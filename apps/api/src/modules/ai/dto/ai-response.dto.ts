import { ApiProperty } from '@nestjs/swagger';

export class TokenUsageDto {
  @ApiProperty({ description: 'Input tokens used', example: 1500 })
  inputTokens: number;

  @ApiProperty({ description: 'Output tokens generated', example: 800 })
  outputTokens: number;

  @ApiProperty({ description: 'Total tokens used', example: 2300 })
  totalTokens: number;
}

export class AIResponseDto {
  @ApiProperty({
    description: 'AI-generated content',
    example: 'Based on the document analysis...',
  })
  content: string;

  @ApiProperty({
    description: 'Model used for generation',
    example: 'claude-3-5-sonnet',
  })
  model: string;

  @ApiProperty({
    description: 'Token usage statistics',
    type: TokenUsageDto,
  })
  usage: TokenUsageDto;

  @ApiProperty({
    description: 'Processing time in milliseconds',
    example: 2500,
  })
  processingTimeMs: number;

  @ApiProperty({
    description: 'Whether human review is recommended',
    example: true,
  })
  requiresHumanReview: boolean;
}
