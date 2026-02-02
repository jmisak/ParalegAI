import { Injectable, Logger } from '@nestjs/common';
import { FullTextSearchService } from './fulltext-search.service';
import { SemanticSearchService } from './semantic-search.service';
import { SearchQueryDto, SearchResultDto, SearchResultItem } from './dto';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly ftsService: FullTextSearchService,
    private readonly semanticService: SemanticSearchService,
  ) {}

  /**
   * Universal search across all entities
   */
  async search(query: SearchQueryDto, organizationId: string): Promise<SearchResultDto> {
    this.logger.log(`Searching for: ${query.q} in org: ${organizationId}`);

    const startTime = Date.now();
    const results: SearchResultItem[] = [];
    const types = query.types || ['matters', 'documents', 'tasks'];

    // Execute searches in parallel
    const searchPromises: Promise<SearchResultItem[]>[] = [];

    if (types.includes('matters')) {
      searchPromises.push(this.ftsService.searchMatters(query.q, organizationId, query.limit));
    }
    if (types.includes('documents')) {
      searchPromises.push(this.ftsService.searchDocuments(query.q, organizationId, query.limit));
    }
    if (types.includes('tasks')) {
      searchPromises.push(this.ftsService.searchTasks(query.q, organizationId, query.limit));
    }

    const searchResults = await Promise.all(searchPromises);
    for (const items of searchResults) {
      results.push(...items);
    }

    // Sort by relevance score
    results.sort((a, b) => b.score - a.score);

    // Apply limit
    const limitedResults = results.slice(0, query.limit || 20);

    return {
      results: limitedResults,
      total: results.length,
      query: query.q,
      searchTimeMs: Date.now() - startTime,
      facets: this.buildFacets(results),
    };
  }

  /**
   * Search matters only
   */
  async searchMatters(query: SearchQueryDto, organizationId: string) {
    return {
      results: await this.ftsService.searchMatters(query.q, organizationId, query.limit),
      query: query.q,
    };
  }

  /**
   * Search documents only
   */
  async searchDocuments(query: SearchQueryDto, organizationId: string) {
    return {
      results: await this.ftsService.searchDocuments(query.q, organizationId, query.limit),
      query: query.q,
    };
  }

  /**
   * Semantic search using embeddings
   */
  async semanticSearch(query: SearchQueryDto, organizationId: string) {
    this.logger.log(`Semantic search for: ${query.q}`);

    const results = await this.semanticService.search(
      query.q,
      organizationId,
      query.limit || 20,
    );

    return {
      results,
      query: query.q,
      searchType: 'semantic',
    };
  }

  /**
   * Get search suggestions for autocomplete
   */
  async getSuggestions(prefix: string, organizationId: string): Promise<string[]> {
    if (!prefix || prefix.length < 2) {
      return [];
    }

    return this.ftsService.getSuggestions(prefix, organizationId);
  }

  /**
   * Build facets for search results
   */
  private buildFacets(results: SearchResultItem[]): Record<string, number> {
    const facets: Record<string, number> = {};

    for (const result of results) {
      const type = result.type;
      facets[type] = (facets[type] || 0) + 1;
    }

    return facets;
  }
}
