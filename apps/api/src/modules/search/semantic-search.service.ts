import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchResultItem } from './dto';

/**
 * Semantic Search Service using pgvector
 * Provides AI-powered semantic search using embeddings
 */
@Injectable()
export class SemanticSearchService {
  private readonly logger = new Logger(SemanticSearchService.name);
  private readonly embeddingDimension = 1536; // OpenAI ada-002 dimension

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Perform semantic search using vector similarity
   */
  async search(
    query: string,
    organizationId: string,
    limit: number = 20,
  ): Promise<SearchResultItem[]> {
    try {
      // Generate embedding for query
      const queryEmbedding = await this.generateEmbedding(query);

      if (!queryEmbedding) {
        this.logger.warn('Failed to generate query embedding, falling back to empty results');
        return [];
      }

      // Search using pgvector cosine similarity
      const results = await this.prisma.$queryRaw<
        Array<{
          id: string;
          entity_type: string;
          entity_id: string;
          content_preview: string;
          similarity: number;
        }>
      >`
        SELECT
          e.id,
          e.entity_type,
          e.entity_id,
          e.content_preview,
          1 - (e.embedding <=> ${queryEmbedding}::vector) as similarity
        FROM document_embeddings e
        WHERE e.organization_id = ${organizationId}::uuid
        ORDER BY e.embedding <=> ${queryEmbedding}::vector
        LIMIT ${limit}
      `;

      // Enrich results with entity details
      return this.enrichResults(results, organizationId);
    } catch (error) {
      this.logger.error('Semantic search failed', error);
      return [];
    }
  }

  /**
   * Generate embedding for text using AI provider
   */
  async generateEmbedding(text: string): Promise<number[] | null> {
    // Check for API key
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      this.logger.warn('OpenAI API key not configured for embeddings');
      return this.generateMockEmbedding();
    }

    try {
      // In production, would call OpenAI embeddings API
      // const response = await openai.embeddings.create({
      //   model: 'text-embedding-ada-002',
      //   input: text,
      // });
      // return response.data[0].embedding;

      // For now, return mock embedding
      return this.generateMockEmbedding();
    } catch (error) {
      this.logger.error('Failed to generate embedding', error);
      return null;
    }
  }

  /**
   * Index a document for semantic search
   */
  async indexDocument(
    entityType: string,
    entityId: string,
    content: string,
    organizationId: string,
  ): Promise<void> {
    try {
      const embedding = await this.generateEmbedding(content);

      if (!embedding) {
        this.logger.warn(`Failed to generate embedding for ${entityType}:${entityId}`);
        return;
      }

      // Store embedding
      await this.prisma.$executeRaw`
        INSERT INTO document_embeddings (
          id, entity_type, entity_id, content_preview, embedding, organization_id, created_at
        )
        VALUES (
          gen_random_uuid(),
          ${entityType},
          ${entityId}::uuid,
          ${content.substring(0, 500)},
          ${embedding}::vector,
          ${organizationId}::uuid,
          NOW()
        )
        ON CONFLICT (entity_type, entity_id)
        DO UPDATE SET
          content_preview = EXCLUDED.content_preview,
          embedding = EXCLUDED.embedding,
          updated_at = NOW()
      `;

      this.logger.log(`Indexed ${entityType}:${entityId} for semantic search`);
    } catch (error) {
      this.logger.error(`Failed to index ${entityType}:${entityId}`, error);
    }
  }

  /**
   * Remove document from semantic search index
   */
  async removeFromIndex(entityType: string, entityId: string): Promise<void> {
    try {
      await this.prisma.$executeRaw`
        DELETE FROM document_embeddings
        WHERE entity_type = ${entityType} AND entity_id = ${entityId}::uuid
      `;
    } catch (error) {
      this.logger.error(`Failed to remove ${entityType}:${entityId} from index`, error);
    }
  }

  /**
   * Enrich search results with entity details
   */
  private async enrichResults(
    results: Array<{
      id: string;
      entity_type: string;
      entity_id: string;
      content_preview: string;
      similarity: number;
    }>,
    _organizationId: string,
  ): Promise<SearchResultItem[]> {
    const enriched: SearchResultItem[] = [];

    for (const result of results) {
      let title = result.content_preview.substring(0, 100);
      let metadata: Record<string, unknown> = {};

      // Fetch entity details based on type
      switch (result.entity_type) {
        case 'matter': {
          const matter = await this.prisma.$queryRaw<Array<{ title: string; status: string }>>`
            SELECT title, status FROM matters WHERE id = ${result.entity_id}::uuid LIMIT 1
          `;
          if (matter[0]) {
            title = matter[0].title;
            metadata = { status: matter[0].status };
          }
          break;
        }
        case 'document': {
          const doc = await this.prisma.$queryRaw<Array<{ file_name: string; category: string }>>`
            SELECT file_name, category FROM documents WHERE id = ${result.entity_id}::uuid LIMIT 1
          `;
          if (doc[0]) {
            title = doc[0].file_name;
            metadata = { category: doc[0].category };
          }
          break;
        }
      }

      enriched.push({
        id: result.entity_id,
        type: result.entity_type as 'matter' | 'document' | 'task',
        title,
        description: result.content_preview,
        score: result.similarity,
        metadata,
      });
    }

    return enriched;
  }

  /**
   * Generate mock embedding for development/testing
   */
  private generateMockEmbedding(): number[] {
    // Generate deterministic-ish mock embedding
    return Array.from({ length: this.embeddingDimension }, (_, i) => Math.sin(i) * 0.1);
  }
}
