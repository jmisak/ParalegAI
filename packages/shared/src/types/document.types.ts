/**
 * Document types for IronClad
 * @module types/document
 */

import type { DocumentStatus, DocumentType } from '../enums';

/**
 * Document entity
 */
export interface Document {
  /** Unique document identifier */
  readonly id: string;
  /** Associated matter ID */
  matterId: string;
  /** Document title/name */
  title: string;
  /** Document description */
  description?: string | undefined;
  /** Document type/category */
  type: DocumentType;
  /** Current status */
  status: DocumentStatus;
  /** Original filename */
  fileName: string;
  /** File extension */
  fileExtension: string;
  /** MIME type */
  mimeType: string;
  /** File size in bytes */
  fileSize: number;
  /** Storage path/key */
  storagePath: string;
  /** Storage bucket/container */
  storageBucket: string;
  /** Current version number */
  currentVersion: number;
  /** Checksum (SHA-256) */
  checksum: string;
  /** Whether document is a template */
  isTemplate: boolean;
  /** Parent template ID (if generated from template) */
  templateId?: string | undefined;
  /** OCR processed flag */
  ocrProcessed: boolean;
  /** OCR extracted text */
  ocrText?: string | undefined;
  /** AI-generated summary */
  aiSummary?: string | undefined;
  /** AI-extracted metadata */
  aiMetadata?: DocumentAIMetadata | undefined;
  /** Vector embedding ID for RAG */
  embeddingId?: string | undefined;
  /** Execution/signature date */
  executionDate?: Date | undefined;
  /** Recording information (if recorded) */
  recordingInfo?: RecordingInfo | undefined;
  /** Associated party IDs */
  partyIds: readonly string[];
  /** Tags for categorization */
  tags: readonly string[];
  /** Custom fields */
  customFields?: Record<string, unknown> | undefined;
  /** Uploaded by user ID */
  uploadedBy: string;
  /** Creation timestamp */
  readonly createdAt: Date;
  /** Last updated timestamp */
  updatedAt: Date;
}

/**
 * Document version for version history
 */
export interface DocumentVersion {
  /** Version ID */
  readonly id: string;
  /** Parent document ID */
  documentId: string;
  /** Version number */
  versionNumber: number;
  /** Storage path for this version */
  storagePath: string;
  /** File size for this version */
  fileSize: number;
  /** Checksum for this version */
  checksum: string;
  /** Version comment/notes */
  comment?: string | undefined;
  /** Changes from previous version */
  changes?: string | undefined;
  /** Created by user ID */
  createdBy: string;
  /** Version creation timestamp */
  readonly createdAt: Date;
}

/**
 * Document template
 */
export interface DocumentTemplate {
  /** Template ID */
  readonly id: string;
  /** Organization ID */
  organizationId: string;
  /** Template name */
  name: string;
  /** Template description */
  description?: string | undefined;
  /** Document type this template creates */
  documentType: DocumentType;
  /** Template category */
  category: string;
  /** Applicable jurisdictions (empty = all) */
  jurisdictions: readonly string[];
  /** Applicable matter types */
  matterTypes: readonly string[];
  /** Template content/body (for text-based templates) */
  content?: string | undefined;
  /** Template file path (for file-based templates) */
  filePath?: string | undefined;
  /** Template variables/placeholders */
  variables: readonly TemplateVariable[];
  /** Whether template is active */
  isActive: boolean;
  /** Whether this is a system template */
  isSystem: boolean;
  /** Usage count */
  usageCount: number;
  /** Created by user ID */
  createdBy: string;
  /** Creation timestamp */
  readonly createdAt: Date;
  /** Last updated timestamp */
  updatedAt: Date;
}

/**
 * Template variable definition
 */
export interface TemplateVariable {
  /** Variable key/name */
  key: string;
  /** Display label */
  label: string;
  /** Variable description */
  description?: string | undefined;
  /** Variable type */
  type: TemplateVariableType;
  /** Whether variable is required */
  required: boolean;
  /** Default value */
  defaultValue?: string | undefined;
  /** Validation pattern (regex) */
  validationPattern?: string | undefined;
  /** Options for select/enum types */
  options?: readonly string[] | undefined;
  /** Data source for auto-population */
  dataSource?: TemplateDataSource | undefined;
}

/**
 * Template variable types
 */
export type TemplateVariableType =
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'party'
  | 'property'
  | 'currency'
  | 'address'
  | 'legal_description'
  | 'signature';

/**
 * Data source for auto-populating template variables
 */
export interface TemplateDataSource {
  /** Source entity type */
  entity: 'matter' | 'party' | 'property' | 'transaction' | 'user';
  /** Field path within entity */
  fieldPath: string;
}

/**
 * Recording information for recorded documents
 */
export interface RecordingInfo {
  /** Recording number/instrument number */
  recordingNumber: string;
  /** Book number */
  book?: string | undefined;
  /** Page number */
  page?: string | undefined;
  /** Recording date */
  recordingDate: Date;
  /** County of recording */
  county: string;
  /** State of recording */
  state: string;
  /** Recording fee paid */
  recordingFee?: number | undefined;
}

/**
 * AI-extracted document metadata
 */
export interface DocumentAIMetadata {
  /** Extracted parties */
  parties?: readonly ExtractedParty[] | undefined;
  /** Extracted dates */
  dates?: readonly ExtractedDate[] | undefined;
  /** Extracted monetary amounts */
  amounts?: readonly ExtractedAmount[] | undefined;
  /** Extracted property descriptions */
  properties?: readonly ExtractedProperty[] | undefined;
  /** Key clauses/provisions */
  keyClauses?: readonly ExtractedClause[] | undefined;
  /** Identified risks/issues */
  risks?: readonly IdentifiedRisk[] | undefined;
  /** Confidence score (0-1) */
  confidenceScore: number;
  /** Processing timestamp */
  processedAt: Date;
  /** AI model used */
  modelUsed: string;
}

/**
 * Extracted party from document
 */
export interface ExtractedParty {
  /** Party name */
  name: string;
  /** Party role in document */
  role: string;
  /** Confidence score */
  confidence: number;
}

/**
 * Extracted date from document
 */
export interface ExtractedDate {
  /** Date value */
  date: Date;
  /** Date context/purpose */
  context: string;
  /** Confidence score */
  confidence: number;
}

/**
 * Extracted monetary amount
 */
export interface ExtractedAmount {
  /** Amount value */
  amount: number;
  /** Currency code */
  currency: string;
  /** Amount context/purpose */
  context: string;
  /** Confidence score */
  confidence: number;
}

/**
 * Extracted property information
 */
export interface ExtractedProperty {
  /** Property address */
  address?: string | undefined;
  /** Legal description */
  legalDescription?: string | undefined;
  /** Parcel/APN */
  parcelNumber?: string | undefined;
  /** Confidence score */
  confidence: number;
}

/**
 * Extracted clause/provision
 */
export interface ExtractedClause {
  /** Clause title/type */
  title: string;
  /** Clause text */
  text: string;
  /** Page number */
  pageNumber?: number | undefined;
  /** Confidence score */
  confidence: number;
}

/**
 * Identified risk in document
 */
export interface IdentifiedRisk {
  /** Risk category */
  category: string;
  /** Risk description */
  description: string;
  /** Severity level */
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  /** Relevant text/clause */
  relevantText?: string | undefined;
  /** Recommended action */
  recommendation?: string | undefined;
}

/**
 * Document upload input
 */
export interface UploadDocumentInput {
  /** Matter ID */
  matterId: string;
  /** Document title */
  title: string;
  /** Document type */
  type: DocumentType;
  /** File data (base64 or buffer) */
  fileData: string | Buffer;
  /** Original filename */
  fileName: string;
  /** MIME type */
  mimeType: string;
  /** Optional description */
  description?: string | undefined;
  /** Optional tags */
  tags?: readonly string[] | undefined;
  /** Associated party IDs */
  partyIds?: readonly string[] | undefined;
  /** Whether to process with AI */
  processWithAI?: boolean | undefined;
}

/**
 * Document search criteria
 */
export interface DocumentSearchCriteria {
  /** Search query (matches title, content) */
  query?: string | undefined;
  /** Filter by matter ID */
  matterId?: string | undefined;
  /** Filter by document type */
  type?: DocumentType | readonly DocumentType[] | undefined;
  /** Filter by status */
  status?: DocumentStatus | readonly DocumentStatus[] | undefined;
  /** Filter by uploaded by user */
  uploadedBy?: string | undefined;
  /** Filter by date range */
  createdFrom?: Date | undefined;
  createdTo?: Date | undefined;
  /** Filter by tags */
  tags?: readonly string[] | undefined;
  /** Include templates only */
  templatesOnly?: boolean | undefined;
  /** Semantic search (uses embeddings) */
  semanticSearch?: boolean | undefined;
}
