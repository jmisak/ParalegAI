import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '@common/dto';
import { MatterStatus, MatterType } from './create-matter.dto';

export class MatterQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: MatterStatus,
  })
  @IsOptional()
  @IsEnum(MatterStatus)
  status?: MatterStatus;

  @ApiPropertyOptional({
    description: 'Filter by type',
    enum: MatterType,
  })
  @IsOptional()
  @IsEnum(MatterType)
  type?: MatterType;

  @ApiPropertyOptional({
    description: 'Filter by assigned user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @ApiPropertyOptional({
    description: 'Search in title and description',
    example: 'Smith property',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
