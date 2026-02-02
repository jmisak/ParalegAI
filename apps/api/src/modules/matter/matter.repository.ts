import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationParams } from '@common/interfaces';

interface MatterFilter {
  status?: string;
  type?: string;
  assignedTo?: string;
  search?: string;
}

interface MatterCreateData {
  title: string;
  description?: string;
  type: string;
  status?: string;
  priority?: string;
  clientId?: string;
  propertyAddress?: string;
  closingDate?: Date;
  organizationId: string;
  createdBy: string;
  updatedBy: string;
}

interface MatterUpdateData {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  propertyAddress?: string;
  closingDate?: Date;
  updatedBy: string;
}

@Injectable()
export class MatterRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new matter
   */
  async create(data: MatterCreateData): Promise<Record<string, unknown>> {
    const result = await this.prisma.$queryRaw<Array<Record<string, unknown>>>`
      INSERT INTO matters (
        id, title, description, type, status, priority,
        client_id, property_address, closing_date,
        organization_id, created_by, updated_by, created_at, updated_at
      )
      VALUES (
        gen_random_uuid(),
        ${data.title},
        ${data.description || null},
        ${data.type},
        ${data.status || 'draft'},
        ${data.priority || 'medium'},
        ${data.clientId || null}::uuid,
        ${data.propertyAddress || null},
        ${data.closingDate || null}::timestamp,
        ${data.organizationId}::uuid,
        ${data.createdBy}::uuid,
        ${data.updatedBy}::uuid,
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    const matter = result[0];
    if (!matter) {
      throw new Error('Failed to create matter');
    }
    return matter;
  }

  /**
   * Find matters with filtering and pagination
   */
  async findMany(
    filter: MatterFilter,
    organizationId: string,
    pagination: PaginationParams,
  ): Promise<{ data: Array<Record<string, unknown>>; total: number }> {
    const offset = ((pagination.page || 1) - 1) * (pagination.limit || 20);
    const limit = pagination.limit || 20;
    const sortBy = pagination.sortBy || 'created_at';
    const sortOrder = pagination.sortOrder || 'desc';

    // Build dynamic WHERE conditions
    let whereClause = `WHERE m.organization_id = $1::uuid AND m.deleted_at IS NULL`;
    const params: unknown[] = [organizationId];
    let paramIndex = 2;

    if (filter.status) {
      whereClause += ` AND m.status = $${paramIndex}`;
      params.push(filter.status);
      paramIndex++;
    }

    if (filter.type) {
      whereClause += ` AND m.type = $${paramIndex}`;
      params.push(filter.type);
      paramIndex++;
    }

    if (filter.search) {
      whereClause += ` AND (m.title ILIKE $${paramIndex} OR m.description ILIKE $${paramIndex})`;
      params.push(`%${filter.search}%`);
      paramIndex++;
    }

    // Count query
    const countQuery = `SELECT COUNT(*) as count FROM matters m ${whereClause}`;
    const countResult = await this.prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
      countQuery,
      ...params,
    );
    const total = Number(countResult[0]?.count || 0);

    // Data query with pagination
    const dataQuery = `
      SELECT m.*,
             array_agg(DISTINCT ma.user_id) FILTER (WHERE ma.user_id IS NOT NULL) as team_members
      FROM matters m
      LEFT JOIN matter_assignments ma ON m.id = ma.matter_id
      ${whereClause}
      GROUP BY m.id
      ORDER BY m.${sortBy} ${sortOrder}
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
   * Find a single matter by ID
   */
  async findById(
    id: string,
    organizationId: string,
  ): Promise<Record<string, unknown> | null> {
    const result = await this.prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT m.*,
             array_agg(DISTINCT ma.user_id) FILTER (WHERE ma.user_id IS NOT NULL) as team_members
      FROM matters m
      LEFT JOIN matter_assignments ma ON m.id = ma.matter_id
      WHERE m.id = ${id}::uuid
        AND m.organization_id = ${organizationId}::uuid
        AND m.deleted_at IS NULL
      GROUP BY m.id
      LIMIT 1
    `;

    return result[0] || null;
  }

  /**
   * Update a matter
   */
  async update(
    id: string,
    data: MatterUpdateData,
  ): Promise<Record<string, unknown>> {
    const result = await this.prisma.$queryRaw<Array<Record<string, unknown>>>`
      UPDATE matters
      SET
        title = COALESCE(${data.title}, title),
        description = COALESCE(${data.description}, description),
        status = COALESCE(${data.status}, status),
        priority = COALESCE(${data.priority}, priority),
        property_address = COALESCE(${data.propertyAddress}, property_address),
        closing_date = COALESCE(${data.closingDate}::timestamp, closing_date),
        updated_by = ${data.updatedBy}::uuid,
        updated_at = NOW()
      WHERE id = ${id}::uuid
      RETURNING *
    `;

    const matter = result[0];
    if (!matter) {
      throw new Error('Failed to update matter');
    }
    return matter;
  }

  /**
   * Soft delete a matter
   */
  async softDelete(id: string, deletedBy: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE matters
      SET deleted_at = NOW(), updated_by = ${deletedBy}::uuid
      WHERE id = ${id}::uuid
    `;
  }

  /**
   * Assign team members to a matter
   */
  async assignTeam(
    matterId: string,
    userIds: string[],
    assignedBy: string,
  ): Promise<Record<string, unknown>> {
    // Remove existing assignments
    await this.prisma.$executeRaw`
      DELETE FROM matter_assignments WHERE matter_id = ${matterId}::uuid
    `;

    // Add new assignments
    for (const userId of userIds) {
      await this.prisma.$executeRaw`
        INSERT INTO matter_assignments (matter_id, user_id, assigned_by, assigned_at)
        VALUES (${matterId}::uuid, ${userId}::uuid, ${assignedBy}::uuid, NOW())
      `;
    }

    // Return updated matter
    const result = await this.prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT m.*,
             array_agg(DISTINCT ma.user_id) FILTER (WHERE ma.user_id IS NOT NULL) as team_members
      FROM matters m
      LEFT JOIN matter_assignments ma ON m.id = ma.matter_id
      WHERE m.id = ${matterId}::uuid
      GROUP BY m.id
    `;

    const matter = result[0];
    if (!matter) {
      throw new Error('Matter not found');
    }
    return matter;
  }

  /**
   * Get activity history for a matter
   */
  async getActivityHistory(matterId: string): Promise<Array<Record<string, unknown>>> {
    return this.prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT * FROM matter_activities
      WHERE matter_id = ${matterId}::uuid
      ORDER BY created_at DESC
      LIMIT 100
    `;
  }
}
