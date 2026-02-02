import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIGatewayService } from './services/ai-gateway.service';
import { PromptTemplateService } from './services/prompt-template.service';
import { TokenUsageService } from './services/token-usage.service';

@Module({
  controllers: [AIController],
  providers: [AIGatewayService, PromptTemplateService, TokenUsageService],
  exports: [AIGatewayService, PromptTemplateService],
})
export class AIModule {}
