import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, Min, Max, IsObject } from 'class-validator';

export enum TemplateType {
  PURCHASE_AGREEMENT = 'purchase_agreement',
  DEED_OF_TRUST = 'deed_of_trust',
  LEASE_AGREEMENT = 'lease_agreement',
  ASSIGNMENT = 'assignment',
  AMENDMENT = 'amendment',
  NOTICE = 'notice',
  DISCLOSURE = 'disclosure',
  POWER_OF_ATTORNEY = 'power_of_attorney',
  AFFIDAVIT = 'affidavit',
  CUSTOM = 'custom',
}

export class GenerateDocumentDto {
  @ApiProperty({
    description: 'Type of document template to generate',
    enum: TemplateType,
  })
  @IsEnum(TemplateType)
  templateType!: TemplateType;

  @ApiPropertyOptional({
    description: 'Additional context for document generation',
    example: 'Residential property sale, first-time buyer, conventional financing',
  })
  @IsOptional()
  @IsString()
  context?: string;

  @ApiPropertyOptional({
    description: 'Variables to populate in the template',
    example: { buyerName: 'John Doe', sellerName: 'Jane Smith', propertyAddress: '123 Main St' },
  })
  @IsOptional()
  @IsObject()
  variables?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'AI provider to use',
    enum: ['anthropic', 'openai'],
    default: 'anthropic',
  })
  @IsOptional()
  @IsEnum(['anthropic', 'openai'])
  provider?: 'anthropic' | 'openai';

  @ApiPropertyOptional({
    description: 'Maximum tokens for response',
    minimum: 100,
    maximum: 16000,
    default: 8192,
  })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(16000)
  maxTokens?: number;
}
