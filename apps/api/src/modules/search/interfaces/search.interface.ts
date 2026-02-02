/**
 * Search provider interface for extensibility
 */
export interface SearchProvider {
  /**
   * Provider name
   */
  name: string;

  /**
   * Search for documents
   */
  search(
    query: string,
    organizationId: string,
    options: SearchOptions,
  ): Promise<SearchResult>;

  /**
   * Index a document
   */
  index(document: IndexableDocument): Promise<void>;

  /**
   * Remove document from index
   */
  remove(documentId: string): Promise<void>;

  /**
   * Check if provider is healthy
   */
  healthCheck(): Promise<boolean>;
}

/**
 * Search options
 */
export interface SearchOptions {
  limit?: number;
  offset?: number;
  types?: string[];
  filters?: Record<string, unknown>;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

/**
 * Search result
 */
export interface SearchResult {
  hits: SearchHit[];
  total: number;
  took: number;
}

/**
 * Individual search hit
 */
export interface SearchHit {
  id: string;
  type: string;
  score: number;
  source: Record<string, unknown>;
  highlights?: Record<string, string[]>;
}

/**
 * Document structure for indexing
 */
export interface IndexableDocument {
  id: string;
  type: string;
  organizationId: string;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
