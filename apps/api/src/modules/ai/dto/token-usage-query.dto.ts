import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsEnum, IsUUID } from 'class-validator';

export class TokenUsageQueryDto {
  @ApiPropertyOptional({
    description: 'Start date for usage query',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for usage query',
    example: '2026-02-01',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by AI provider',
    enum: ['anthropic', 'openai'],
  })
  @IsOptional()
  @IsEnum(['anthropic', 'openai'])
  provider?: 'anthropic' | 'openai';

  @ApiPropertyOptional({
    description: 'Filter by user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
