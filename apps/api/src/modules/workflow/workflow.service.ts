import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { QUEUE_NAMES } from './workflow.module';
import {
  CreateTaskDto,
  TaskQueryDto,
  TaskResponseDto,
  JobStatusDto,
} from './dto';
import { PaginatedResponse } from '@common/interfaces';
import { paginate } from '@common/dto';

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.DOCUMENT) private documentQueue: Queue,
    @InjectQueue(QUEUE_NAMES.NOTIFICATION) private notificationQueue: Queue,
    @InjectQueue(QUEUE_NAMES.DEADLINE) private deadlineQueue: Queue,
  ) {}

  /**
   * Create a new workflow task
   */
  async createTask(
    dto: CreateTaskDto,
    userId: string,
    organizationId: string,
  ): Promise<TaskResponseDto> {
    const result = await this.prisma.$queryRaw<Array<Record<string, unknown>>>`
      INSERT INTO workflow_tasks (
        id, title, description, task_type, status, priority,
        matter_id, assigned_to, due_date,
        organization_id, created_by, updated_by, created_at, updated_at
      )
      VALUES (
        gen_random_uuid(),
        ${dto.title},
        ${dto.description || null},
        ${dto.taskType},
        'pending',
        ${dto.priority || 'medium'},
        ${dto.matterId || null}::uuid,
        ${dto.assignedTo || null}::uuid,
        ${dto.dueDate ? new Date(dto.dueDate) : null}::timestamp,
        ${organizationId}::uuid,
        ${userId}::uuid,
        ${userId}::uuid,
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    const task = result[0];
    if (!task) {
      throw new Error('Failed to create task');
    }

    // Schedule deadline reminder if due date is set
    if (dto.dueDate) {
      await this.scheduleDeadlineReminder(task['id'] as string, new Date(dto.dueDate));
    }

    return this.toTaskResponse(task);
  }

  /**
   * List workflow tasks
   */
  async listTasks(
    query: TaskQueryDto,
    organizationId: string,
  ): Promise<PaginatedResponse<TaskResponseDto>> {
    const offset = ((query.page || 1) - 1) * (query.limit || 20);
    const limit = query.limit || 20;

    let whereClause = `WHERE t.organization_id = $1::uuid AND t.deleted_at IS NULL`;
    const params: unknown[] = [organizationId];
    let paramIndex = 2;

    if (query.status) {
      whereClause += ` AND t.status = $${paramIndex}`;
      params.push(query.status);
      paramIndex++;
    }

    if (query.matterId) {
      whereClause += ` AND t.matter_id = $${paramIndex}::uuid`;
      params.push(query.matterId);
      paramIndex++;
    }

    if (query.assignedTo) {
      whereClause += ` AND t.assigned_to = $${paramIndex}::uuid`;
      params.push(query.assignedTo);
      paramIndex++;
    }

    const countQuery = `SELECT COUNT(*) as count FROM workflow_tasks t ${whereClause}`;
    const countResult = await this.prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
      countQuery,
      ...params,
    );
    const total = Number(countResult[0]?.count || 0);

    const dataQuery = `
      SELECT t.*
      FROM workflow_tasks t
      ${whereClause}
      ORDER BY t.due_date ASC NULLS LAST, t.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const data = await this.prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
      dataQuery,
      ...params,
      limit,
      offset,
    );

    return paginate(data.map(this.toTaskResponse), total, query);
  }

  /**
   * Get task by ID
   */
  async getTask(id: string, organizationId: string): Promise<TaskResponseDto> {
    const result = await this.prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT * FROM workflow_tasks
      WHERE id = ${id}::uuid
        AND organization_id = ${organizationId}::uuid
        AND deleted_at IS NULL
      LIMIT 1
    `;

    if (!result[0]) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return this.toTaskResponse(result[0]);
  }

  /**
   * Complete a task
   */
  async completeTask(
    id: string,
    userId: string,
    organizationId: string,
  ): Promise<TaskResponseDto> {
    await this.getTask(id, organizationId);

    const result = await this.prisma.$queryRaw<Array<Record<string, unknown>>>`
      UPDATE workflow_tasks
      SET status = 'completed', completed_at = NOW(), updated_by = ${userId}::uuid, updated_at = NOW()
      WHERE id = ${id}::uuid
      RETURNING *
    `;

    const task = result[0];
    if (!task) {
      throw new Error('Failed to complete task');
    }

    // Send completion notification
    await this.notificationQueue.add('task-completed', {
      taskId: id,
      completedBy: userId,
      organizationId,
    });

    return this.toTaskResponse(task);
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string, userId: string, organizationId: string): Promise<void> {
    await this.getTask(id, organizationId);

    await this.prisma.$executeRaw`
      UPDATE workflow_tasks
      SET deleted_at = NOW(), updated_by = ${userId}::uuid
      WHERE id = ${id}::uuid
    `;
  }

  /**
   * List jobs in a queue
   */
  async listJobs(queueName: string, status?: string): Promise<JobStatusDto[]> {
    const queue = this.getQueue(queueName);
    if (!queue) {
      return [];
    }

    let jobs: Job[];
    if (status) {
      jobs = await queue.getJobs([status as 'waiting' | 'active' | 'completed' | 'failed']);
    } else {
      jobs = await queue.getJobs(['waiting', 'active', 'completed', 'failed']);
    }

    return jobs.slice(0, 100).map(this.toJobStatus);
  }

  /**
   * Get job status
   */
  async getJobStatus(queueName: string, jobId: string): Promise<JobStatusDto> {
    const queue = this.getQueue(queueName);
    if (!queue) {
      throw new NotFoundException(`Queue ${queueName} not found`);
    }

    const job = await queue.getJob(jobId);
    if (!job) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }

    return this.toJobStatus(job);
  }

  /**
   * Queue document for processing
   */
  async queueDocumentProcessing(
    documentId: string,
    operations: string[],
    userId: string,
    organizationId: string,
  ): Promise<string> {
    const job = await this.documentQueue.add(
      'process-document',
      {
        documentId,
        operations,
        userId,
        organizationId,
      },
      {
        priority: 1,
        attempts: 3,
      },
    );

    this.logger.log(`Queued document ${documentId} for processing: ${job.id}`);
    return job.id || '';
  }

  /**
   * Get upcoming deadlines
   */
  async getUpcomingDeadlines(organizationId: string, days: number) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return this.prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT t.*, m.title as matter_title
      FROM workflow_tasks t
      LEFT JOIN matters m ON t.matter_id = m.id
      WHERE t.organization_id = ${organizationId}::uuid
        AND t.deleted_at IS NULL
        AND t.status != 'completed'
        AND t.due_date IS NOT NULL
        AND t.due_date <= ${endDate}
      ORDER BY t.due_date ASC
    `;
  }

  /**
   * Schedule deadline reminder
   */
  private async scheduleDeadlineReminder(taskId: string, dueDate: Date): Promise<void> {
    // Schedule reminder 24 hours before deadline
    const reminderTime = new Date(dueDate);
    reminderTime.setHours(reminderTime.getHours() - 24);

    if (reminderTime > new Date()) {
      await this.deadlineQueue.add(
        'deadline-reminder',
        { taskId },
        {
          delay: reminderTime.getTime() - Date.now(),
          removeOnComplete: true,
        },
      );
    }
  }

  private getQueue(name: string): Queue | null {
    const queues: Record<string, Queue> = {
      [QUEUE_NAMES.DOCUMENT]: this.documentQueue,
      [QUEUE_NAMES.NOTIFICATION]: this.notificationQueue,
      [QUEUE_NAMES.DEADLINE]: this.deadlineQueue,
    };
    return queues[name] || null;
  }

  private toTaskResponse(task: Record<string, unknown>): TaskResponseDto {
    return {
      id: task['id'] as string,
      title: task['title'] as string,
      description: task['description'] as string | undefined,
      taskType: task['task_type'] as string,
      status: task['status'] as string,
      priority: task['priority'] as string,
      matterId: task['matter_id'] as string | undefined,
      assignedTo: task['assigned_to'] as string | undefined,
      dueDate: task['due_date'] as Date | undefined,
      completedAt: task['completed_at'] as Date | undefined,
      organizationId: task['organization_id'] as string,
      createdAt: task['created_at'] as Date,
      createdBy: task['created_by'] as string,
    };
  }

  private toJobStatus(job: Job): JobStatusDto {
    return {
      id: job.id || '',
      name: job.name,
      data: job.data,
      status: job.finishedOn
        ? 'completed'
        : job.failedReason
          ? 'failed'
          : job.processedOn
            ? 'active'
            : 'waiting',
      progress: typeof job.progress === 'number' ? job.progress : 0,
      attemptsMade: job.attemptsMade,
      createdAt: new Date(job.timestamp),
      processedAt: job.processedOn ? new Date(job.processedOn) : undefined,
      finishedAt: job.finishedOn ? new Date(job.finishedOn) : undefined,
      failedReason: job.failedReason,
    };
  }
}
