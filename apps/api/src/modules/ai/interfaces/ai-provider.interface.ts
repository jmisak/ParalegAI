/**
 * AI Request configuration
 */
export interface AIRequest {
  prompt: string;
  maxTokens: number;
  temperature: number;
  provider: 'anthropic' | 'openai';
  userId: string;
  organizationId: string;
  requestType: string;
}

/**
 * AI Provider response structure
 */
export interface AIProviderResponse {
  content: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

/**
 * AI Provider interface for abstraction
 */
export interface AIProvider {
  complete(request: AIRequest): Promise<AIProviderResponse>;
}

/**
 * Supported AI models
 */
export enum AIModel {
  // Anthropic models
  CLAUDE_3_5_SONNET = 'claude-3-5-sonnet-20241022',
  CLAUDE_3_OPUS = 'claude-3-opus-20240229',
  CLAUDE_3_HAIKU = 'claude-3-haiku-20240307',

  // OpenAI models
  GPT_4_TURBO = 'gpt-4-turbo-preview',
  GPT_4 = 'gpt-4',
  GPT_4O = 'gpt-4o',
  GPT_4O_MINI = 'gpt-4o-mini',
}

/**
 * Model capabilities
 */
export interface ModelCapabilities {
  maxContextTokens: number;
  maxOutputTokens: number;
  supportsVision: boolean;
  supportsFunctions: boolean;
  costPer1MInputTokens: number;
  costPer1MOutputTokens: number;
}

/**
 * Model configuration map
 */
export const MODEL_CAPABILITIES: Record<AIModel, ModelCapabilities> = {
  [AIModel.CLAUDE_3_5_SONNET]: {
    maxContextTokens: 200000,
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsFunctions: true,
    costPer1MInputTokens: 3.0,
    costPer1MOutputTokens: 15.0,
  },
  [AIModel.CLAUDE_3_OPUS]: {
    maxContextTokens: 200000,
    maxOutputTokens: 4096,
    supportsVision: true,
    supportsFunctions: true,
    costPer1MInputTokens: 15.0,
    costPer1MOutputTokens: 75.0,
  },
  [AIModel.CLAUDE_3_HAIKU]: {
    maxContextTokens: 200000,
    maxOutputTokens: 4096,
    supportsVision: true,
    supportsFunctions: true,
    costPer1MInputTokens: 0.25,
    costPer1MOutputTokens: 1.25,
  },
  [AIModel.GPT_4_TURBO]: {
    maxContextTokens: 128000,
    maxOutputTokens: 4096,
    supportsVision: true,
    supportsFunctions: true,
    costPer1MInputTokens: 10.0,
    costPer1MOutputTokens: 30.0,
  },
  [AIModel.GPT_4]: {
    maxContextTokens: 8192,
    maxOutputTokens: 4096,
    supportsVision: false,
    supportsFunctions: true,
    costPer1MInputTokens: 30.0,
    costPer1MOutputTokens: 60.0,
  },
  [AIModel.GPT_4O]: {
    maxContextTokens: 128000,
    maxOutputTokens: 16384,
    supportsVision: true,
    supportsFunctions: true,
    costPer1MInputTokens: 2.5,
    costPer1MOutputTokens: 10.0,
  },
  [AIModel.GPT_4O_MINI]: {
    maxContextTokens: 128000,
    maxOutputTokens: 16384,
    supportsVision: true,
    supportsFunctions: true,
    costPer1MInputTokens: 0.15,
    costPer1MOutputTokens: 0.6,
  },
};
