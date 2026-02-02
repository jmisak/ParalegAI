/**
 * AI types for IronClad
 * @module types/ai
 */

import type { AIProvider, AITaskType, AIProcessingStatus } from '../enums';

/**
 * AI request for processing
 */
export interface AIRequest {
  /** Unique request identifier */
  readonly id: string;
  /** Organization ID */
  organizationId: string;
  /** Associated matter ID */
  matterId?: string | undefined;
  /** Associated document ID */
  documentId?: string | undefined;
  /** Task type */
  taskType: AITaskType;
  /** AI provider to use */
  provider: AIProvider;
  /** Model identifier */
  model: string;
  /** Input content/prompt */
  input: AIInput;
  /** Request parameters */
  parameters?: AIParameters | undefined;
  /** Processing status */
  status: AIProcessingStatus;
  /** Priority (lower = higher priority) */
  priority: number;
  /** Retry count */
  retryCount: number;
  /** Maximum retries */
  maxRetries: number;
  /** Error message (if failed) */
  errorMessage?: string | undefined;
  /** User ID who initiated request */
  requestedBy: string;
  /** Request timestamp */
  readonly requestedAt: Date;
  /** Processing started timestamp */
  startedAt?: Date | undefined;
  /** Processing completed timestamp */
  completedAt?: Date | undefined;
}

/**
 * AI input content
 */
export interface AIInput {
  /** Primary prompt/question */
  prompt: string;
  /** System prompt/instructions */
  systemPrompt?: string | undefined;
  /** Context documents/text */
  context?: readonly AIContextItem[] | undefined;
  /** Document content (for document processing) */
  documentContent?: string | undefined;
  /** Structured data input */
  structuredData?: Record<string, unknown> | undefined;
  /** Image inputs (base64 or URLs) */
  images?: readonly string[] | undefined;
}

/**
 * Context item for AI request
 */
export interface AIContextItem {
  /** Content */
  content: string;
  /** Source identifier */
  sourceId?: string | undefined;
  /** Source type */
  sourceType?: 'document' | 'matter' | 'party' | 'property' | 'custom' | undefined;
  /** Relevance score (if from RAG) */
  relevanceScore?: number | undefined;
  /** Metadata */
  metadata?: Record<string, unknown> | undefined;
}

/**
 * AI request parameters
 */
export interface AIParameters {
  /** Temperature (0-2) */
  temperature?: number | undefined;
  /** Max tokens */
  maxTokens?: number | undefined;
  /** Top P */
  topP?: number | undefined;
  /** Frequency penalty */
  frequencyPenalty?: number | undefined;
  /** Presence penalty */
  presencePenalty?: number | undefined;
  /** Stop sequences */
  stopSequences?: readonly string[] | undefined;
  /** Response format */
  responseFormat?: 'text' | 'json' | 'markdown' | undefined;
  /** JSON schema (if responseFormat is json) */
  jsonSchema?: Record<string, unknown> | undefined;
  /** Whether to use RAG */
  useRAG?: boolean | undefined;
  /** RAG parameters */
  ragParameters?: RAGParameters | undefined;
}

/**
 * RAG (Retrieval-Augmented Generation) parameters
 */
export interface RAGParameters {
  /** Number of documents to retrieve */
  topK: number;
  /** Minimum similarity score (0-1) */
  minScore: number;
  /** Filter by matter ID */
  matterFilter?: string | undefined;
  /** Filter by document types */
  documentTypeFilter?: readonly string[] | undefined;
  /** Filter by date range */
  dateFilter?: {
    from?: Date;
    to?: Date;
  } | undefined;
  /** Include metadata in results */
  includeMetadata: boolean;
  /** Reranking enabled */
  rerank: boolean;
  /** Reranking model */
  rerankModel?: string | undefined;
}

/**
 * AI response from processing
 */
export interface AIResponse {
  /** Request ID */
  requestId: string;
  /** Response content */
  content: AIResponseContent;
  /** Usage statistics */
  usage: AIUsage;
  /** Model used */
  model: string;
  /** Processing duration (ms) */
  durationMs: number;
  /** Response timestamp */
  readonly timestamp: Date;
}

/**
 * AI response content
 */
export interface AIResponseContent {
  /** Text response */
  text?: string | undefined;
  /** Structured JSON response */
  json?: Record<string, unknown> | undefined;
  /** Extracted data (for extraction tasks) */
  extractedData?: ExtractedData | undefined;
  /** Summary (for summarization tasks) */
  summary?: DocumentSummary | undefined;
  /** Analysis results (for analysis tasks) */
  analysis?: DocumentAnalysis | undefined;
  /** Generated content (for generation tasks) */
  generatedContent?: GeneratedContent | undefined;
  /** Comparison results (for comparison tasks) */
  comparison?: DocumentComparison | undefined;
  /** Risk assessment (for risk tasks) */
  riskAssessment?: RiskAssessment | undefined;
  /** Sources/citations */
  sources?: readonly AISource[] | undefined;
  /** Confidence score (0-1) */
  confidenceScore?: number | undefined;
}

/**
 * AI usage statistics
 */
export interface AIUsage {
  /** Prompt tokens */
  promptTokens: number;
  /** Completion tokens */
  completionTokens: number;
  /** Total tokens */
  totalTokens: number;
  /** Estimated cost (USD) */
  estimatedCostUsd: number;
  /** Cached tokens (if applicable) */
  cachedTokens?: number | undefined;
}

/**
 * Extracted data from document
 */
export interface ExtractedData {
  /** Extracted parties */
  parties?: readonly {
    name: string;
    role: string;
    type?: string;
    confidence: number;
  }[] | undefined;
  /** Extracted dates */
  dates?: readonly {
    date: string;
    type: string;
    confidence: number;
  }[] | undefined;
  /** Extracted amounts */
  amounts?: readonly {
    amount: number;
    currency: string;
    type: string;
    confidence: number;
  }[] | undefined;
  /** Extracted addresses */
  addresses?: readonly {
    full: string;
    components?: Record<string, string>;
    confidence: number;
  }[] | undefined;
  /** Extracted legal descriptions */
  legalDescriptions?: readonly {
    text: string;
    type: string;
    confidence: number;
  }[] | undefined;
  /** Custom extracted fields */
  customFields?: Record<string, unknown> | undefined;
}

/**
 * Document summary
 */
export interface DocumentSummary {
  /** Brief summary (1-2 sentences) */
  brief: string;
  /** Detailed summary */
  detailed: string;
  /** Key points */
  keyPoints: readonly string[];
  /** Important dates mentioned */
  importantDates?: readonly { date: string; description: string }[] | undefined;
  /** Important amounts mentioned */
  importantAmounts?: readonly { amount: number; description: string }[] | undefined;
  /** Action items identified */
  actionItems?: readonly string[] | undefined;
}

/**
 * Document analysis results
 */
export interface DocumentAnalysis {
  /** Document type detected */
  documentType: string;
  /** Jurisdiction detected */
  jurisdiction?: string | undefined;
  /** Key provisions */
  keyProvisions: readonly {
    title: string;
    summary: string;
    pageReference?: string;
  }[];
  /** Missing elements */
  missingElements?: readonly string[] | undefined;
  /** Unusual clauses */
  unusualClauses?: readonly {
    clause: string;
    concern: string;
    recommendation: string;
  }[] | undefined;
  /** Compliance status */
  complianceStatus?: {
    isCompliant: boolean;
    issues: readonly string[];
  } | undefined;
}

/**
 * Generated content
 */
export interface GeneratedContent {
  /** Generated text */
  text: string;
  /** Format of content */
  format: 'text' | 'markdown' | 'html' | 'docx';
  /** Variables used */
  variablesUsed?: Record<string, string> | undefined;
  /** Sections generated */
  sections?: readonly {
    title: string;
    content: string;
  }[] | undefined;
}

/**
 * Document comparison results
 */
export interface DocumentComparison {
  /** Overall similarity score (0-1) */
  similarityScore: number;
  /** Documents compared */
  documentsCompared: readonly string[];
  /** Key differences */
  differences: readonly {
    section: string;
    document1: string;
    document2: string;
    significance: 'LOW' | 'MEDIUM' | 'HIGH';
  }[];
  /** Similarities */
  similarities: readonly {
    section: string;
    content: string;
  }[];
  /** Recommendations */
  recommendations?: readonly string[] | undefined;
}

/**
 * Risk assessment results
 */
export interface RiskAssessment {
  /** Overall risk level */
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  /** Risk score (0-100) */
  riskScore: number;
  /** Identified risks */
  risks: readonly {
    category: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    likelihood: 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'CERTAIN';
    impact: string;
    mitigation?: string;
    relevantText?: string;
  }[];
  /** Recommendations */
  recommendations: readonly string[];
}

/**
 * AI source/citation
 */
export interface AISource {
  /** Source document ID */
  documentId?: string | undefined;
  /** Source document title */
  title: string;
  /** Page/section reference */
  reference?: string | undefined;
  /** Relevant excerpt */
  excerpt?: string | undefined;
  /** Relevance score */
  relevanceScore?: number | undefined;
}

/**
 * Vector embedding
 */
export interface Embedding {
  /** Embedding ID */
  readonly id: string;
  /** Source document ID */
  documentId: string;
  /** Chunk index within document */
  chunkIndex: number;
  /** Text content that was embedded */
  content: string;
  /** Vector embedding values */
  vector: readonly number[];
  /** Embedding model used */
  model: string;
  /** Vector dimension */
  dimension: number;
  /** Metadata */
  metadata?: EmbeddingMetadata | undefined;
  /** Creation timestamp */
  readonly createdAt: Date;
}

/**
 * Embedding metadata
 */
export interface EmbeddingMetadata {
  /** Matter ID */
  matterId?: string | undefined;
  /** Document type */
  documentType?: string | undefined;
  /** Page number */
  pageNumber?: number | undefined;
  /** Section/heading */
  section?: string | undefined;
  /** Token count */
  tokenCount?: number | undefined;
  /** Custom metadata */
  custom?: Record<string, unknown> | undefined;
}

/**
 * RAG context for AI requests
 */
export interface RAGContext {
  /** Query used for retrieval */
  query: string;
  /** Retrieved documents */
  documents: readonly RAGDocument[];
  /** Total documents found */
  totalFound: number;
  /** Retrieval duration (ms) */
  retrievalDurationMs: number;
}

/**
 * RAG retrieved document
 */
export interface RAGDocument {
  /** Document ID */
  documentId: string;
  /** Document title */
  title: string;
  /** Chunk content */
  content: string;
  /** Similarity score (0-1) */
  score: number;
  /** Rerank score (if reranked) */
  rerankScore?: number | undefined;
  /** Metadata */
  metadata: EmbeddingMetadata;
}

/**
 * AI conversation message
 */
export interface AIConversationMessage {
  /** Message ID */
  readonly id: string;
  /** Conversation ID */
  conversationId: string;
  /** Role */
  role: 'user' | 'assistant' | 'system';
  /** Content */
  content: string;
  /** Attachments */
  attachments?: readonly {
    type: 'document' | 'image';
    id: string;
    name: string;
  }[] | undefined;
  /** Token count */
  tokenCount?: number | undefined;
  /** Timestamp */
  readonly timestamp: Date;
}

/**
 * AI conversation
 */
export interface AIConversation {
  /** Conversation ID */
  readonly id: string;
  /** Organization ID */
  organizationId: string;
  /** Associated matter ID */
  matterId?: string | undefined;
  /** User ID */
  userId: string;
  /** Conversation title */
  title: string;
  /** Messages */
  messages: readonly AIConversationMessage[];
  /** Total tokens used */
  totalTokens: number;
  /** Creation timestamp */
  readonly createdAt: Date;
  /** Last message timestamp */
  lastMessageAt: Date;
}
