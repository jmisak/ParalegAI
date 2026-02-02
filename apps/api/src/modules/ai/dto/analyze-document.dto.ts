import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';

export enum DocumentType {
  CONTRACT = 'contract',
  DEED = 'deed',
  TITLE_COMMITMENT = 'title_commitment',
  SURVEY = 'survey',
  MORTGAGE = 'mortgage',
  LEASE = 'lease',
  DISCLOSURE = 'disclosure',
  OTHER = 'other',
}

export enum AnalysisType {
  SUMMARY = 'summary',
  RISK_ASSESSMENT = 'risk_assessment',
  KEY_TERMS = 'key_terms',
  COMPLIANCE = 'compliance',
  FULL = 'full',
}

export class AnalyzeDocumentDto {
  @ApiProperty({
    description: 'Document content to analyze',
    example: 'THIS DEED OF TRUST, made this...',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: 'Type of document being analyzed',
    enum: DocumentType,
    default: DocumentType.OTHER,
  })
  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @ApiPropertyOptional({
    description: 'Type of analysis to perform',
    enum: AnalysisType,
    default: AnalysisType.FULL,
  })
  @IsOptional()
  @IsEnum(AnalysisType)
  analysisType?: AnalysisType;

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
    default: 4096,
  })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(16000)
  maxTokens?: number;
}
