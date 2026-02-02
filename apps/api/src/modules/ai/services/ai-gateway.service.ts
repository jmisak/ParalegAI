import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PromptTemplateService } from './prompt-template.service';
import { TokenUsageService } from './token-usage.service';
import { AnalyzeDocumentDto, GenerateDocumentDto, AIResponseDto } from '../dto';
import { AIProvider, AIRequest, AIProviderResponse } from '../interfaces/ai-provider.interface';

/**
 * AI Gateway Service
 * Abstraction layer for LLM providers (Anthropic, OpenAI)
 * Handles prompt injection defense, token tracking, and provider failover
 */
@Injectable()
export class AIGatewayService {
  private readonly logger = new Logger(AIGatewayService.name);
  private readonly defaultProvider: 'anthropic' | 'openai';
  private readonly anthropicApiKey: string | undefined;
  private readonly openaiApiKey: string | undefined;

  constructor(
    private readonly configService: ConfigService,
    private readonly promptService: PromptTemplateService,
    private readonly tokenUsageService: TokenUsageService,
  ) {
    this.defaultProvider = configService.get<'anthropic' | 'openai'>('AI_DEFAULT_PROVIDER') || 'anthropic';
    this.anthropicApiKey = configService.get<string>('ANTHROPIC_API_KEY');
    this.openaiApiKey = configService.get<string>('OPENAI_API_KEY');
  }

  /**
   * Analyze a document using AI
   */
  async analyzeDocument(
    dto: AnalyzeDocumentDto,
    userId: string,
    organizationId: string,
  ): Promise<AIResponseDto> {
    // Sanitize input for prompt injection
    const sanitizedContent = this.sanitizeInput(dto.content);

    // Get prompt template
    const prompt = await this.promptService.getTemplate('document_analysis', {
      content: sanitizedContent,
      documentType: dto.documentType,
      analysisType: dto.analysisType,
    });

    const response = await this.executeRequest({
      prompt,
      maxTokens: dto.maxTokens || 4096,
      temperature: 0.3, // Lower temperature for analysis
      provider: dto.provider || this.defaultProvider,
      userId,
      organizationId,
      requestType: 'analyze',
    });

    return response;
  }

  /**
   * Generate document content using AI
   */
  async generateContent(
    dto: GenerateDocumentDto,
    userId: string,
    organizationId: string,
  ): Promise<AIResponseDto> {
    // Sanitize input
    const sanitizedContext = dto.context ? this.sanitizeInput(dto.context) : undefined;

    // Get prompt template
    const prompt = await this.promptService.getTemplate('document_generation', {
      templateType: dto.templateType,
      context: sanitizedContext,
      variables: dto.variables,
    });

    const response = await this.executeRequest({
      prompt,
      maxTokens: dto.maxTokens || 8192,
      temperature: 0.7, // Higher temperature for creative generation
      provider: dto.provider || this.defaultProvider,
      userId,
      organizationId,
      requestType: 'generate',
    });

    return response;
  }

  /**
   * AI-assisted contract review
   */
  async reviewContract(
    dto: AnalyzeDocumentDto,
    userId: string,
    organizationId: string,
  ): Promise<AIResponseDto> {
    // Sanitize input
    const sanitizedContent = this.sanitizeInput(dto.content);

    // Get specialized review prompt
    const prompt = await this.promptService.getTemplate('contract_review', {
      content: sanitizedContent,
      reviewFocus: dto.analysisType || 'general',
    });

    const response = await this.executeRequest({
      prompt,
      maxTokens: dto.maxTokens || 8192,
      temperature: 0.2, // Very low temperature for precise review
      provider: dto.provider || this.defaultProvider,
      userId,
      organizationId,
      requestType: 'review',
    });

    return response;
  }

  /**
   * Execute AI request with provider abstraction
   */
  private async executeRequest(request: AIRequest): Promise<AIResponseDto> {
    const startTime = Date.now();
    let response: AIProviderResponse;

    try {
      // Select provider
      const provider = this.getProvider(request.provider);

      // Execute request
      response = await provider.complete(request);

      // Track token usage
      await this.tokenUsageService.trackUsage({
        organizationId: request.organizationId,
        userId: request.userId,
        provider: request.provider,
        requestType: request.requestType,
        inputTokens: response.usage.inputTokens,
        outputTokens: response.usage.outputTokens,
        totalTokens: response.usage.totalTokens,
        cost: this.calculateCost(request.provider, response.usage),
        durationMs: Date.now() - startTime,
      });

      return {
        content: response.content,
        model: response.model,
        usage: response.usage,
        processingTimeMs: Date.now() - startTime,
        requiresHumanReview: this.shouldRequireHumanReview(request.requestType),
      };
    } catch (error) {
      this.logger.error('AI request failed', error);

      // Try failover to alternate provider
      if (request.provider === 'anthropic' && this.openaiApiKey) {
        this.logger.warn('Failing over to OpenAI');
        return this.executeRequest({ ...request, provider: 'openai' });
      }

      throw error;
    }
  }

  /**
   * Get provider implementation
   */
  private getProvider(providerName: 'anthropic' | 'openai'): AIProvider {
    // Return mock provider for now - actual implementation would use SDK
    return {
      complete: async (request: AIRequest): Promise<AIProviderResponse> => {
        // Placeholder - would call actual API
        this.logger.log(`Calling ${providerName} API with prompt length: ${request.prompt.length}`);

        // Simulate API call
        return {
          content: `[AI Response Placeholder]\n\nThis is a mock response for ${request.requestType}. In production, this would call the ${providerName} API.\n\nPrompt processed: ${request.prompt.substring(0, 100)}...`,
          model: providerName === 'anthropic' ? 'claude-3-5-sonnet' : 'gpt-4-turbo',
          usage: {
            inputTokens: Math.ceil(request.prompt.length / 4),
            outputTokens: 500,
            totalTokens: Math.ceil(request.prompt.length / 4) + 500,
          },
        };
      },
    };
  }

  /**
   * Sanitize input to prevent prompt injection
   */
  private sanitizeInput(input: string): string {
    // Remove potential injection patterns
    let sanitized = input;

    // Remove instruction-like patterns
    const injectionPatterns = [
      /ignore\s+(previous|above|all)\s+instructions?/gi,
      /disregard\s+(previous|above|all)\s+instructions?/gi,
      /forget\s+(previous|above|all)\s+instructions?/gi,
      /new\s+instructions?:/gi,
      /system\s*:/gi,
      /assistant\s*:/gi,
      /human\s*:/gi,
      /<\/?system>/gi,
      /<\/?assistant>/gi,
    ];

    for (const pattern of injectionPatterns) {
      sanitized = sanitized.replace(pattern, '[FILTERED]');
    }

    // Log if injection attempt detected
    if (sanitized !== input) {
      this.logger.warn('Potential prompt injection detected and filtered');
    }

    return sanitized;
  }

  /**
   * Calculate cost based on provider pricing
   */
  private calculateCost(
    provider: 'anthropic' | 'openai',
    usage: { inputTokens: number; outputTokens: number },
  ): number {
    // Pricing per 1M tokens (as of 2024)
    const pricing: Record<string, { input: number; output: number }> = {
      anthropic: { input: 3.0, output: 15.0 }, // Claude 3.5 Sonnet
      openai: { input: 10.0, output: 30.0 }, // GPT-4 Turbo
    };

    const rate = pricing[provider] || pricing['anthropic'];
    const inputCost = (usage.inputTokens / 1_000_000) * (rate?.input ?? 3.0);
    const outputCost = (usage.outputTokens / 1_000_000) * (rate?.output ?? 15.0);

    return inputCost + outputCost;
  }

  /**
   * Determine if human review is required
   */
  private shouldRequireHumanReview(requestType: string): boolean {
    // High-stakes actions require human review
    const highStakesTypes = ['review', 'generate'];
    return highStakesTypes.includes(requestType);
  }
}
