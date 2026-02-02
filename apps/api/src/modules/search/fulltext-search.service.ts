import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchResultItem } from './dto';

/**
 * Full-Text Search Service using PostgreSQL FTS
 * Provides efficient text search across database tables
 */
@Injectable()
export class FullTextSearchService {
  private readonly logger = new Logger(FullTextSearchService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Search matters using PostgreSQL full-text search
   */
  async searchMatters(
    query: string,
    organizationId: string,
    limit: number = 20,
  ): Promise<SearchResultItem[]> {
    const searchQuery = this.prepareSearchQuery(query);

    try {
      const results = await this.prisma.$queryRaw<
        Array<{
          id: string;
          title: string;
          description: string | null;
          type: string;
          status: string;
          rank: number;
        }>
      >`
        SELECT
          m.id,
          m.title,
          m.description,
          m.type,
          m.status,
          ts_rank(
            setweight(to_tsvector('english', COALESCE(m.title, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(m.description, '')), 'B') ||
            setweight(to_tsvector('english', COALESCE(m.property_address, '')), 'C'),
            plainto_tsquery('english', ${searchQuery})
          ) as rank
        FROM matters m
        WHERE m.organization_id = ${organizationId}::uuid
          AND m.deleted_at IS NULL
          AND (
            setweight(to_tsvector('english', COALESCE(m.title, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(m.description, '')), 'B') ||
            setweight(to_tsvector('english', COALESCE(m.property_address, '')), 'C')
          ) @@ plainto_tsquery('english', ${searchQuery})
        ORDER BY rank DESC
        LIMIT ${limit}
      `;

      return results.map((r) => ({
        id: r.id,
        type: 'matter' as const,
        title: r.title,
        description: r.description || undefined,
        score: r.rank,
        metadata: {
          matterType: r.type,
          status: r.status,
        },
      }));
    } catch (error) {
      this.logger.error('Matter search failed', error);
      return [];
    }
  }

  /**
   * Search documents using PostgreSQL full-text search
   */
  async searchDocuments(
    query: string,
    organizationId: string,
    limit: number = 20,
  ): Promise<SearchResultItem[]> {
    const searchQuery = this.prepareSearchQuery(query);

    try {
      const results = await this.prisma.$queryRaw<
        Array<{
          id: string;
          file_name: string;
          category: string | null;
          matter_id: string | null;
          rank: number;
        }>
      >`
        SELECT
          d.id,
          d.file_name,
          d.category,
          d.matter_id,
          ts_rank(
            setweight(to_tsvector('english', COALESCE(d.file_name, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(d.category, '')), 'B'),
            plainto_tsquery('english', ${searchQuery})
          ) as rank
        FROM documents d
        WHERE d.organization_id = ${organizationId}::uuid
          AND d.deleted_at IS NULL
          AND (
            setweight(to_tsvector('english', COALESCE(d.file_name, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(d.category, '')), 'B')
          ) @@ plainto_tsquery('english', ${searchQuery})
        ORDER BY rank DESC
        LIMIT ${limit}
      `;

      return results.map((r) => ({
        id: r.id,
        type: 'document' as const,
        title: r.file_name,
        score: r.rank,
        metadata: {
          category: r.category,
          matterId: r.matter_id,
        },
      }));
    } catch (error) {
      this.logger.error('Document search failed', error);
      return [];
    }
  }

  /**
   * Search tasks using PostgreSQL full-text search
   */
  async searchTasks(
    query: string,
    organizationId: string,
    limit: number = 20,
  ): Promise<SearchResultItem[]> {
    const searchQuery = this.prepareSearchQuery(query);

    try {
      const results = await this.prisma.$queryRaw<
        Array<{
          id: string;
          title: string;
          description: string | null;
          status: string;
          due_date: Date | null;
          rank: number;
        }>
      >`
        SELECT
          t.id,
          t.title,
          t.description,
          t.status,
          t.due_date,
          ts_rank(
            setweight(to_tsvector('english', COALESCE(t.title, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(t.description, '')), 'B'),
            plainto_tsquery('english', ${searchQuery})
          ) as rank
        FROM workflow_tasks t
        WHERE t.organization_id = ${organizationId}::uuid
          AND t.deleted_at IS NULL
          AND (
            setweight(to_tsvector('english', COALESCE(t.title, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(t.description, '')), 'B')
          ) @@ plainto_tsquery('english', ${searchQuery})
        ORDER BY rank DESC
        LIMIT ${limit}
      `;

      return results.map((r) => ({
        id: r.id,
        type: 'task' as const,
        title: r.title,
        description: r.description || undefined,
        score: r.rank,
        metadata: {
          status: r.status,
          dueDate: r.due_date?.toISOString(),
        },
      }));
    } catch (error) {
      this.logger.error('Task search failed', error);
      return [];
    }
  }

  /**
   * Get search suggestions for autocomplete
   */
  async getSuggestions(prefix: string, organizationId: string): Promise<string[]> {
    try {
      // Get suggestions from matter titles
      const matterSuggestions = await this.prisma.$queryRaw<Array<{ title: string }>>`
        SELECT DISTINCT title
        FROM matters
        WHERE organization_id = ${organizationId}::uuid
          AND deleted_at IS NULL
          AND title ILIKE ${prefix + '%'}
        LIMIT 5
      `;

      // Get suggestions from document names
      const docSuggestions = await this.prisma.$queryRaw<Array<{ file_name: string }>>`
        SELECT DISTINCT file_name
        FROM documents
        WHERE organization_id = ${organizationId}::uuid
          AND deleted_at IS NULL
          AND file_name ILIKE ${prefix + '%'}
        LIMIT 5
      `;

      const suggestions = [
        ...matterSuggestions.map((r) => r.title),
        ...docSuggestions.map((r) => r.file_name),
      ];

      // Deduplicate and limit
      return [...new Set(suggestions)].slice(0, 10);
    } catch (error) {
      this.logger.error('Get suggestions failed', error);
      return [];
    }
  }

  /**
   * Prepare search query for PostgreSQL FTS
   */
  private prepareSearchQuery(query: string): string {
    // Clean and prepare the query
    return query
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 1)
      .join(' & ');
  }
}
