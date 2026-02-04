import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MatterResponseDto {
  @ApiProperty({
    description: 'Matter ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Matter title',
    example: 'Smith Property Purchase - 123 Main St',
  })
  title!: string;

  @ApiPropertyOptional({
    description: 'Matter description',
  })
  description?: string;

  @ApiProperty({
    description: 'Matter type',
    example: 'purchase',
  })
  type!: string;

  @ApiProperty({
    description: 'Matter status',
    example: 'active',
  })
  status!: string;

  @ApiProperty({
    description: 'Matter priority',
    example: 'medium',
  })
  priority!: string;

  @ApiPropertyOptional({
    description: 'Client ID',
  })
  clientId?: string;

  @ApiPropertyOptional({
    description: 'Property address',
  })
  propertyAddress?: string;

  @ApiPropertyOptional({
    description: 'Expected closing date',
  })
  closingDate?: Date;

  @ApiPropertyOptional({
    description: 'Assigned team member IDs',
    type: [String],
  })
  teamMembers?: string[];

  @ApiProperty({
    description: 'Organization ID',
  })
  organizationId!: string;

  @ApiProperty({
    description: 'Creation timestamp',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last update timestamp',
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Created by user ID',
  })
  createdBy!: string;

  @ApiProperty({
    description: 'Last updated by user ID',
  })
  updatedBy!: string;
}
