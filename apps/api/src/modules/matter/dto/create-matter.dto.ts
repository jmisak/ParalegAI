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

export enum MatterType {
  PURCHASE = 'purchase',
  SALE = 'sale',
  REFINANCE = 'refinance',
  COMMERCIAL = 'commercial',
  LEASE = 'lease',
  TITLE_REVIEW = 'title_review',
  OTHER = 'other',
}

export enum MatterStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PENDING = 'pending',
  ON_HOLD = 'on_hold',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

export enum MatterPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export class CreateMatterDto {
  @ApiProperty({
    description: 'Matter title',
    example: 'Smith Property Purchase - 123 Main St',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description: 'Matter description',
    example: 'Residential purchase transaction for the Smith family',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({
    description: 'Matter type',
    enum: MatterType,
    example: MatterType.PURCHASE,
  })
  @IsEnum(MatterType)
  type: MatterType;

  @ApiPropertyOptional({
    description: 'Matter status',
    enum: MatterStatus,
    default: MatterStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(MatterStatus)
  status?: MatterStatus;

  @ApiPropertyOptional({
    description: 'Matter priority',
    enum: MatterPriority,
    default: MatterPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(MatterPriority)
  priority?: MatterPriority;

  @ApiPropertyOptional({
    description: 'Client ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  clientId?: string;

  @ApiPropertyOptional({
    description: 'Property address',
    example: '123 Main Street, Anytown, ST 12345',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  propertyAddress?: string;

  @ApiPropertyOptional({
    description: 'Expected closing date',
    example: '2026-03-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  closingDate?: string;
}
