import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TemplateDefinition, TemplateCategory, TemplateVariable } from './template.types';

/**
 * Whitelist of allowed sort columns
 */
const ALLOWED_SORT_COLUMNS: Record<string, string> = {
  created_at: 'dt.created_at',
  updated_at: 'dt.updated_at',
  name: 'dt.name',
  category: 'dt.category',
};

@Injectable()
export class TemplateRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new template
   */
  async create(data: {
    name: string;
    description: string;
    category: TemplateCategory;
    content: string;
    variables: TemplateVariable[];
    jurisdiction?: string;
    organizationId: string;
    createdBy: string;
  }): Promise<TemplateDefinition> {
    const result = await this.prisma.$queryRaw<Array<Record<string, unknown>>>`
      INSERT INTO document_templates (
        id, name, description, category, content, variables,
        jurisdiction, version, is_active,
        organization_id, created_by, updated_by, created_at, updated_at
      )
      VALUES (
        gen_random_uuid(),
        ${data.name},
        ${data.description},
        ${data.category},
        ${data.content},
        ${JSON.stringify(data.variables)}::jsonb,
        ${data.jurisdiction || null},
        1,
        true,
        ${data.organizationId}::uuid,
        ${data.createdBy}::uuid,
        ${data.createdBy}::uuid,
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    return this.toEntity(result[0]!);
  }

  /**
   * Find a template by ID
   */
  async findById(
    id: string,
    organizationId: string,
  ): Promise<TemplateDefinition | null> {
    const result = await this.prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT * FROM document_templates
      WHERE id = ${id}::uuid
        AND organization_id = ${organizationId}::uuid
        AND is_active = true
      LIMIT 1
    `;

    return result[0] ? this.toEntity(result[0]) : null;
  }

  /**
   * Find templates with filtering
   */
  async findMany(
    organizationId: string,
    filter?: {
      category?: TemplateCategory;
      search?: string;
      jurisdiction?: string;
    },
    pagination?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: string;
    },
  ): Promise<{ data: TemplateDefinition[]; total: number }> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const offset = (page - 1) * limit;
    const sortColumn = ALLOWED_SORT_COLUMNS[pagination?.sortBy || 'created_at'] || 'dt.created_at';
    const sortOrder = pagination?.sortOrder === 'asc' ? 'ASC' : 'DESC';

    let whereClause = `WHERE dt.organization_id = $1::uuid AND dt.is_active = true`;
    const params: unknown[] = [organizationId];
    let paramIndex = 2;

    if (filter?.category) {
      whereClause += ` AND dt.category = $${paramIndex}`;
      params.push(filter.category);
      paramIndex++;
    }

    if (filter?.search) {
      whereClause += ` AND (dt.name ILIKE $${paramIndex} OR dt.description ILIKE $${paramIndex})`;
      params.push(`%${filter.search}%`);
      paramIndex++;
    }

    if (filter?.jurisdiction) {
      whereClause += ` AND dt.jurisdiction = $${paramIndex}`;
      params.push(filter.jurisdiction);
      paramIndex++;
    }

    const countQuery = `SELECT COUNT(*) as count FROM document_templates dt ${whereClause}`;
    const countResult = await this.prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
      countQuery,
      ...params,
    );
    const total = Number(countResult[0]?.count || 0);

    const dataQuery = `
      SELECT dt.* FROM document_templates dt
      ${whereClause}
      ORDER BY ${sortColumn} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const data = await this.prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
      dataQuery,
      ...params,
      limit,
      offset,
    );

    return {
      data: data.map((row) => this.toEntity(row)),
      total,
    };
  }

  /**
   * Update a template (creates new version)
   */
  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      content?: string;
      variables?: TemplateVariable[];
      jurisdiction?: string;
      updatedBy: string;
    },
    organizationId: string,
  ): Promise<TemplateDefinition> {
    const result = await this.prisma.$queryRaw<Array<Record<string, unknown>>>`
      UPDATE document_templates
      SET
        name = COALESCE(${data.name}, name),
        description = COALESCE(${data.description}, description),
        content = COALESCE(${data.content}, content),
        variables = COALESCE(${data.variables ? JSON.stringify(data.variables) : null}::jsonb, variables),
        jurisdiction = COALESCE(${data.jurisdiction}, jurisdiction),
        version = version + 1,
        updated_by = ${data.updatedBy}::uuid,
        updated_at = NOW()
      WHERE id = ${id}::uuid
        AND organization_id = ${organizationId}::uuid
        AND is_active = true
      RETURNING *
    `;

    if (!result[0]) {
      throw new Error('Template not found or not accessible');
    }
    return this.toEntity(result[0]);
  }

  /**
   * Soft delete a template
   */
  async softDelete(id: string, deletedBy: string, organizationId: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE document_templates
      SET is_active = false, updated_by = ${deletedBy}::uuid, updated_at = NOW()
      WHERE id = ${id}::uuid
        AND organization_id = ${organizationId}::uuid
    `;
  }

  private toEntity(row: Record<string, unknown>): TemplateDefinition {
    return {
      id: row['id'] as string,
      name: row['name'] as string,
      description: row['description'] as string,
      category: row['category'] as TemplateCategory,
      content: row['content'] as string,
      variables: (typeof row['variables'] === 'string'
        ? JSON.parse(row['variables'] as string)
        : row['variables']) as TemplateVariable[],
      jurisdiction: row['jurisdiction'] as string | undefined,
      version: row['version'] as number,
      isActive: row['is_active'] as boolean,
      organizationId: row['organization_id'] as string,
      createdBy: row['created_by'] as string,
      updatedBy: row['updated_by'] as string,
      createdAt: row['created_at'] as Date,
      updatedAt: row['updated_at'] as Date,
    };
  }
}
