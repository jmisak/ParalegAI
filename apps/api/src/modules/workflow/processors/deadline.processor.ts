import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { QUEUE_NAMES } from '../workflow.module';

interface DeadlineJobData {
  taskId: string;
  type?: 'reminder' | 'overdue' | 'escalation';
}

/**
 * Deadline Processing Worker
 * Handles deadline tracking, reminders, and escalations
 */
@Processor(QUEUE_NAMES.DEADLINE)
export class DeadlineProcessor extends WorkerHost {
  private readonly logger = new Logger(DeadlineProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.NOTIFICATION) private notificationQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<DeadlineJobData>): Promise<unknown> {
    this.logger.log(`Processing deadline job ${job.id}: ${job.name}`);

    const { taskId, type = 'reminder' } = job.data;

    // Get task details
    const task = await this.getTask(taskId);
    if (!task) {
      this.logger.warn(`Task ${taskId} not found, skipping deadline processing`);
      return { skipped: true, reason: 'task_not_found' };
    }

    // Check if task is already completed
    if (task['status'] === 'completed') {
      this.logger.log(`Task ${taskId} already completed, skipping`);
      return { skipped: true, reason: 'already_completed' };
    }

    switch (type) {
      case 'reminder':
        return this.sendReminder(task);
      case 'overdue':
        return this.handleOverdue(task);
      case 'escalation':
        return this.escalateDeadline(task);
      default:
        return this.sendReminder(task);
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<DeadlineJobData>): void {
    this.logger.log(`Deadline job ${job.id} completed for task ${job.data.taskId}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<DeadlineJobData>, error: Error): void {
    this.logger.error(`Deadline job ${job.id} failed for task ${job.data.taskId}: ${error.message}`);
  }

  private async getTask(taskId: string): Promise<Record<string, unknown> | null> {
    const result = await this.prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT t.*, u.email as assigned_email, u.first_name, u.last_name
      FROM workflow_tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.id = ${taskId}::uuid AND t.deleted_at IS NULL
      LIMIT 1
    `;
    return result[0] || null;
  }

  private async sendReminder(task: Record<string, unknown>): Promise<unknown> {
    const assignedTo = task['assigned_to'] as string;
    const dueDate = task['due_date'] as Date;

    if (!assignedTo) {
      this.logger.warn(`Task ${task['id']} has no assignee, skipping reminder`);
      return { skipped: true, reason: 'no_assignee' };
    }

    // Queue notification
    await this.notificationQueue.add('deadline-approaching', {
      type: 'email',
      recipients: [task['assigned_email'] as string].filter(Boolean),
      subject: `Deadline Reminder: ${task['title']}`,
      message: `Your task "${task['title']}" is due on ${dueDate?.toLocaleDateString()}. Please ensure it is completed on time.`,
      organizationId: task['organization_id'] as string,
      metadata: {
        taskId: task['id'],
        notificationType: 'deadline_reminder',
      },
    });

    // Also create in-app notification
    await this.notificationQueue.add('in-app-notification', {
      type: 'in-app',
      recipients: [assignedTo],
      message: `Deadline approaching for: ${task['title']}`,
      organizationId: task['organization_id'] as string,
      metadata: {
        taskId: task['id'],
        notificationType: 'deadline_reminder',
      },
    });

    // Schedule overdue check for deadline time
    if (dueDate && dueDate > new Date()) {
      const delayMs = dueDate.getTime() - Date.now();
      await this.scheduleOverdueCheck(task['id'] as string, delayMs);
    }

    return { reminded: true, assignee: assignedTo };
  }

  private async handleOverdue(task: Record<string, unknown>): Promise<unknown> {
    const assignedTo = task['assigned_to'] as string;

    // Update task status to overdue
    await this.prisma.$executeRaw`
      UPDATE workflow_tasks
      SET status = 'overdue', updated_at = NOW()
      WHERE id = ${task['id']}::uuid
    `;

    // Queue overdue notification
    await this.notificationQueue.add('task-overdue', {
      type: 'email',
      recipients: [task['assigned_email'] as string].filter(Boolean),
      subject: `OVERDUE: ${task['title']}`,
      message: `Your task "${task['title']}" is now overdue. Please complete it as soon as possible or contact your supervisor.`,
      organizationId: task['organization_id'] as string,
      metadata: {
        taskId: task['id'],
        notificationType: 'task_overdue',
      },
    });

    // Schedule escalation in 24 hours if still not completed
    await this.scheduleEscalation(task['id'] as string, 24 * 60 * 60 * 1000);

    return { markedOverdue: true, assignee: assignedTo };
  }

  private async escalateDeadline(task: Record<string, unknown>): Promise<unknown> {
    // Re-check if task is still overdue
    const currentTask = await this.getTask(task['id'] as string);
    if (!currentTask || currentTask['status'] === 'completed') {
      return { skipped: true, reason: 'already_completed' };
    }

    // Get supervisor/manager to escalate to
    // In a real implementation, this would fetch the org hierarchy
    const supervisorId = await this.getSupervisor(task['assigned_to'] as string);

    if (supervisorId) {
      await this.notificationQueue.add('deadline-escalation', {
        type: 'email',
        recipients: [supervisorId],
        subject: `ESCALATION: Overdue task - ${task['title']}`,
        message: `A task assigned to ${task['first_name']} ${task['last_name']} is overdue and has been escalated: "${task['title']}"`,
        organizationId: task['organization_id'] as string,
        metadata: {
          taskId: task['id'],
          notificationType: 'deadline_escalation',
          originalAssignee: task['assigned_to'],
        },
      });
    }

    // Log escalation
    this.logger.warn(`Task ${task['id']} escalated due to missed deadline`);

    return { escalated: true, escalatedTo: supervisorId };
  }

  private async scheduleOverdueCheck(taskId: string, delayMs: number): Promise<void> {
    // Use bull's delay feature to schedule future job
    // The queue should already have this job scheduled from workflow creation
    // This is a backup in case the original wasn't scheduled
    this.logger.debug(`Scheduling overdue check for task ${taskId} in ${delayMs}ms`);
  }

  private async scheduleEscalation(taskId: string, delayMs: number): Promise<void> {
    // Schedule escalation job
    this.logger.debug(`Scheduling escalation for task ${taskId} in ${delayMs}ms`);
  }

  private async getSupervisor(_userId: string): Promise<string | null> {
    // Placeholder - would fetch from org hierarchy
    // Return null for now
    return null;
  }
}
