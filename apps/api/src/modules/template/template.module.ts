import { Module } from '@nestjs/common';
import { TemplateController } from './template.controller';
import { TemplateService } from './template.service';
import { TemplateRepository } from './template.repository';
import { TemplateEngine } from './template.engine';

@Module({
  controllers: [TemplateController],
  providers: [TemplateService, TemplateRepository, TemplateEngine],
  exports: [TemplateService, TemplateEngine],
})
export class TemplateModule {}
