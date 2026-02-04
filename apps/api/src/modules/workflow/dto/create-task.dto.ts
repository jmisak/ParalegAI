import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  MaxLength,
} from 'class-validator';

export enum TaskType {
  REVIEW = 'review',
  DRAFT = 'draft',
  SIGNATURE = 'signature',
  FILING = 'filing',
  CALL = 'call',
  MEETING = 'meeting',
  RESEARCH = 'research',
  FOLLOW_UP = 'follow_up',
  GENERAL = 'general',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export class CreateTaskDto {
  @ApiProperty({
    description: 'Task title',
    example: 'Review purchase agreement',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({
    description: 'Task description',
    example: 'Review the purchase agreement for Smith transaction',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({
    description: 'Task type',
    enum: TaskType,
    example: TaskType.REVIEW,
  })
  @IsEnum(TaskType)
  taskType!: TaskType;

  @ApiPropertyOptional({
    description: 'Task priority',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'Associated matter ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  matterId?: string;

  @ApiPropertyOptional({
    description: 'User ID to assign task to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @ApiPropertyOptional({
    description: 'Task due date',
    example: '2026-02-15T17:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
