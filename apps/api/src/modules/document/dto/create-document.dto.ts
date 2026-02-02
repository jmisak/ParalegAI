import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsString, IsBoolean, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDocumentDto {
  @ApiPropertyOptional({
    description: 'Matter ID to associate the document with',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  matterId?: string;

  @ApiPropertyOptional({
    description: 'Document category',
    example: 'contract',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Document tags',
    example: ['title', 'deed', 'important'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',').map((s: string) => s.trim());
      }
    }
    return value;
  })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Whether the document is attorney-client privileged',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPrivileged?: boolean;
}
