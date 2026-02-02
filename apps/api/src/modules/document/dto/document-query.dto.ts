import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsString, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationQueryDto } from '@common/dto';

export class DocumentQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by matter ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  matterId?: string;

  @ApiPropertyOptional({
    description: 'Filter by category',
    example: 'contract',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Search in file name',
    example: 'deed',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by tags (comma-separated)',
    example: 'title,deed',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((s: string) => s.trim());
    }
    return value;
  })
  tags?: string[];
}
