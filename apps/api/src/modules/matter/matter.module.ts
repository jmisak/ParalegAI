import { Module } from '@nestjs/common';
import { MatterController } from './matter.controller';
import { MatterService } from './matter.service';
import { MatterRepository } from './matter.repository';

@Module({
  controllers: [MatterController],
  providers: [MatterService, MatterRepository],
  exports: [MatterService, MatterRepository],
})
export class MatterModule {}
