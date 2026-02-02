import { ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { CreateMatterDto } from './create-matter.dto';

export class UpdateMatterDto extends PartialType(
  OmitType(CreateMatterDto, ['type', 'clientId'] as const),
) {
  @ApiPropertyOptional({
    description: 'Matter title',
    example: 'Smith Property Purchase - 123 Main St (Updated)',
  })
  declare title?: string;
}
