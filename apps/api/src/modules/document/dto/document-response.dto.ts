import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DocumentResponseDto {
  @ApiProperty({
    description: 'Document ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Original file name',
    example: 'deed_of_trust.pdf',
  })
  fileName!: string;

  @ApiProperty({
    description: 'MIME type',
    example: 'application/pdf',
  })
  mimeType!: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1048576,
  })
  fileSize!: number;

  @ApiPropertyOptional({
    description: 'Associated matter ID',
  })
  matterId?: string;

  @ApiPropertyOptional({
    description: 'Document category',
  })
  category?: string;

  @ApiPropertyOptional({
    description: 'Document tags',
    type: [String],
  })
  tags?: string[];

  @ApiProperty({
    description: 'Whether document is attorney-client privileged',
    example: false,
  })
  isPrivileged!: boolean;

  @ApiProperty({
    description: 'Document version number',
    example: 1,
  })
  version!: number;

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
}
