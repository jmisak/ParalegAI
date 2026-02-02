import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';
import { DocumentProcessor } from './processors/document.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { DeadlineProcessor } from './processors/deadline.processor';

export const QUEUE_NAMES = {
  DOCUMENT: 'document-processing',
  NOTIFICATION: 'notifications',
  DEADLINE: 'deadline-tracking',
  AI: 'ai-processing',
} as const;

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUE_NAMES.DOCUMENT },
      { name: QUEUE_NAMES.NOTIFICATION },
      { name: QUEUE_NAMES.DEADLINE },
      { name: QUEUE_NAMES.AI },
    ),
  ],
  controllers: [WorkflowController],
  providers: [
    WorkflowService,
    DocumentProcessor,
    NotificationProcessor,
    DeadlineProcessor,
  ],
  exports: [WorkflowService, BullModule],
})
export class WorkflowModule {}
