import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchResultItem {
  @ApiProperty({
    description: 'Entity ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Entity type',
    enum: ['matter', 'document', 'task'],
    example: 'matter',
  })
  type: 'matter' | 'document' | 'task';

  @ApiProperty({
    description: 'Result title',
    example: 'Smith Property Purchase',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Result description or snippet',
  })
  description?: string;

  @ApiProperty({
    description: 'Relevance score',
    example: 0.85,
  })
  score: number;

  @ApiPropertyOptional({
    description: 'Additional metadata',
  })
  metadata?: Record<string, unknown>;
}

export class SearchResultDto {
  @ApiProperty({
    description: 'Search results',
    type: [SearchResultItem],
  })
  results: SearchResultItem[];

  @ApiProperty({
    description: 'Total number of results',
    example: 42,
  })
  total: number;

  @ApiProperty({
    description: 'Original search query',
    example: 'purchase agreement',
  })
  query: string;

  @ApiProperty({
    description: 'Search execution time in milliseconds',
    example: 125,
  })
  searchTimeMs: number;

  @ApiPropertyOptional({
    description: 'Result facets by type',
    example: { matter: 10, document: 25, task: 7 },
  })
  facets?: Record<string, number>;
}
