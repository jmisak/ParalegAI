import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationParams } from '@common/interfaces';

interface DocumentFilter {
  matterId?: string;
  category?: string;
  search?: string;
  tags?: string[];
}

interface DocumentCreateData {
  fileName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  fileHash: string;
  matterId?: string;
  category?: string;
  tags?: string[];
  isPrivileged: boolean;
  organizationId: string;
  createdBy: string;
  updatedBy: string;
}

interface VersionCreateData {
  fileName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  fileHash: string;
  createdBy: string;
}

@Injectable()
export class DocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new document
   */
  async create(data: DocumentCreateData): Promise<Record<string, unknown>> {
    const result = await this.prisma.$queryRaw<Array<Record<string, unknown>>>`
      INSERT INTO documents (
        id, file_name, mime_type, file_size, storage_path, file_hash,
        matter_id, category, tags, is_privileged, version,
        organization_id, created_by, updated_by, created_at, updated_at
      )
      VALUES (
        gen_random_uuid(),
        ${data.fileName},
        ${data.mimeType},
        ${data.fileSize},
        ${data.storagePath},
        ${data.fileHash},
        ${data.matterId || null}::uuid,
        ${data.category || null},
        ${data.tags || []}::text[],
        ${data.isPrivileged},
        1,
        ${data.organizationId}::uuid,
        ${data.createdBy}::uuid,
        ${data.updatedBy}::uuid,
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    const document = result[0];
    if (!document) {
      throw new Error('Failed to create document');
    }
    return document;
  }

  /**
   * Find documents with filtering and pagination
   */
  async findMany(
    filter: DocumentFilter,
    organizationId: string,
    pagination: PaginationParams,
  ): Promise<{ data: Array<Record<string, unknown>>; total: number }> {
    const offset = ((pagination.page || 1) - 1) * (pagination.limit || 20);
    const limit = pagination.limit || 20;
    const sortBy = pagination.sortBy || 'created_at';
    const sortOrder = pagination.sortOrder || 'desc';

    let whereClause = `WHERE d.organization_id = $1::uuid AND d.deleted_at IS NULL`;
    const params: unknown[] = [organizationId];
    let paramIndex = 2;

    if (filter.matterId) {
      whereClause += ` AND d.matter_id = $${paramIndex}::uuid`;
      params.push(filter.matterId);
      paramIndex++;
    }

    if (filter.category) {
      whereClause += ` AND d.category = $${paramIndex}`;
      params.push(filter.category);
      paramIndex++;
    }

    if (filter.search) {
      whereClause += ` AND d.file_name ILIKE $${paramIndex}`;
      params.push(`%${filter.search}%`);
      paramIndex++;
    }

    if (filter.tags && filter.tags.length > 0) {
      whereClause += ` AND d.tags && $${paramIndex}::text[]`;
      params.push(filter.tags);
      paramIndex++;
    }

    const countQuery = `SELECT COUNT(*) as count FROM documents d ${whereClause}`;
    const countResult = await this.prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
      countQuery,
      ...params,
    );
    const total = Number(countResult[0]?.count || 0);

    const dataQuery = `
      SELECT d.*
      FROM documents d
      ${whereClause}
      ORDER BY d.${sortBy} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const data = await this.prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
      dataQuery,
      ...params,
      limit,
      offset,
    );

    return { data, total };
  }

  /**
   * Find a single document by ID
   */
  async findById(
    id: string,
    organizationId: string,
  ): Promise<Record<string, unknown> | null> {
    const result = await this.prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT * FROM documents
      WHERE id = ${id}::uuid
        AND organization_id = ${organizationId}::uuid
        AND deleted_at IS NULL
      LIMIT 1
    `;

    return result[0] || null;
  }

  /**
   * Get version history for a document
   */
  async getVersionHistory(documentId: string): Promise<Array<Record<string, unknown>>> {
    return this.prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT * FROM document_versions
      WHERE document_id = ${documentId}::uuid
      ORDER BY version DESC
    `;
  }

  /**
   * Create a new version of a document
   */
  async createVersion(
    documentId: string,
    data: VersionCreateData,
  ): Promise<Record<string, unknown>> {
    // Get current max version
    const versionResult = await this.prisma.$queryRaw<Array<{ max_version: number }>>`
      SELECT COALESCE(MAX(version), 0) + 1 as max_version
      FROM document_versions
      WHERE document_id = ${documentId}::uuid
    `;
    const newVersion = versionResult[0]?.max_version || 1;

    // Insert new version
    await this.prisma.$executeRaw`
      INSERT INTO document_versions (
        id, document_id, version, file_name, mime_type, file_size,
        storage_path, file_hash, created_by, created_at
      )
      VALUES (
        gen_random_uuid(),
        ${documentId}::uuid,
        ${newVersion},
        ${data.fileName},
        ${data.mimeType},
        ${data.fileSize},
        ${data.storagePath},
        ${data.fileHash},
        ${data.createdBy}::uuid,
        NOW()
      )
    `;

    // Update main document record
    const result = await this.prisma.$queryRaw<Array<Record<string, unknown>>>`
      UPDATE documents
      SET
        file_name = ${data.fileName},
        mime_type = ${data.mimeType},
        file_size = ${data.fileSize},
        storage_path = ${data.storagePath},
        file_hash = ${data.fileHash},
        version = ${newVersion},
        updated_at = NOW()
      WHERE id = ${documentId}::uuid
      RETURNING *
    `;

    const document = result[0];
    if (!document) {
      throw new Error('Failed to create document version');
    }
    return document;
  }

  /**
   * Soft delete a document
   */
  async softDelete(id: string, deletedBy: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE documents
      SET deleted_at = NOW(), updated_by = ${deletedBy}::uuid
      WHERE id = ${id}::uuid
    `;
  }

  /**
   * Log document access for audit
   */
  async logAccess(
    documentId: string,
    action: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.prisma.$executeRaw`
      INSERT INTO document_access_logs (
        id, document_id, action, metadata, created_at
      )
      VALUES (
        gen_random_uuid(),
        ${documentId}::uuid,
        ${action},
        ${JSON.stringify(metadata || {})}::jsonb,
        NOW()
      )
    `;
  }
}
