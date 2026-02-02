import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TaskResponseDto {
  @ApiProperty({
    description: 'Task ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Task title',
    example: 'Review purchase agreement',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Task description',
  })
  description?: string;

  @ApiProperty({
    description: 'Task type',
    example: 'review',
  })
  taskType: string;

  @ApiProperty({
    description: 'Task status',
    example: 'pending',
  })
  status: string;

  @ApiProperty({
    description: 'Task priority',
    example: 'medium',
  })
  priority: string;

  @ApiPropertyOptional({
    description: 'Associated matter ID',
  })
  matterId?: string;

  @ApiPropertyOptional({
    description: 'Assigned user ID',
  })
  assignedTo?: string;

  @ApiPropertyOptional({
    description: 'Due date',
  })
  dueDate?: Date;

  @ApiPropertyOptional({
    description: 'Completion timestamp',
  })
  completedAt?: Date;

  @ApiProperty({
    description: 'Organization ID',
  })
  organizationId: string;

  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Created by user ID',
  })
  createdBy: string;
}
