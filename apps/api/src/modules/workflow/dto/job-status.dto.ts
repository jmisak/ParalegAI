import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class JobStatusDto {
  @ApiProperty({
    description: 'Job ID',
    example: '1',
  })
  id: string;

  @ApiProperty({
    description: 'Job name',
    example: 'process-document',
  })
  name: string;

  @ApiProperty({
    description: 'Job data payload',
  })
  data: Record<string, unknown>;

  @ApiProperty({
    description: 'Job status',
    enum: ['waiting', 'active', 'completed', 'failed'],
    example: 'active',
  })
  status: string;

  @ApiProperty({
    description: 'Job progress (0-100)',
    example: 50,
  })
  progress: number;

  @ApiProperty({
    description: 'Number of attempts made',
    example: 1,
  })
  attemptsMade: number;

  @ApiProperty({
    description: 'Job creation timestamp',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'When processing started',
  })
  processedAt?: Date;

  @ApiPropertyOptional({
    description: 'When job finished',
  })
  finishedAt?: Date;

  @ApiPropertyOptional({
    description: 'Failure reason if failed',
  })
  failedReason?: string;
}
