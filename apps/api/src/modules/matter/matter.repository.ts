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

/**
 * Whitelist of allowed sort columns to prevent SQL injection
 */
const ALLOWED_SORT_COLUMNS: Record<string, string> = {
  created_at: 'm.created_at',
  updated_at: 'm.updated_at',
  title: 'm.title',
  status: 'm.status',
  priority: 'm.priority',
  closing_date: 'm.closing_date',
  type: 'm.type',
};

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
    // Sanitize sort column against whitelist to prevent SQL injection
    const sortColumn = ALLOWED_SORT_COLUMNS[pagination.sortBy || 'created_at'] || 'm.created_at';
    const sortOrder = pagination.sortOrder === 'asc' ? 'ASC' : 'DESC';

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

    // Data query with pagination (sort column is whitelisted, not user input)
    const dataQuery = `
      SELECT m.*,
             array_agg(DISTINCT ma.user_id) FILTER (WHERE ma.user_id IS NOT NULL) as team_members
      FROM matters m
      LEFT JOIN matter_assignments ma ON m.id = ma.matter_id
      ${whereClause}
      GROUP BY m.id
      ORDER BY ${sortColumn} ${sortOrder}
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
    organizationId: string,
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
        AND organization_id = ${organizationId}::uuid
        AND deleted_at IS NULL
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
  async softDelete(id: string, deletedBy: string, organizationId: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE matters
      SET deleted_at = NOW(), updated_by = ${deletedBy}::uuid
      WHERE id = ${id}::uuid
        AND organization_id = ${organizationId}::uuid
        AND deleted_at IS NULL
    `;
  }

  /**
   * Assign team members to a matter
   * Wrapped in a transaction to prevent orphaned state if INSERT fails
   */
  async assignTeam(
    matterId: string,
    userIds: string[],
    assignedBy: string,
    organizationId: string,
  ): Promise<Record<string, unknown>> {
    return this.prisma.$transaction(async (tx) => {
      // Remove existing assignments
      await tx.$executeRaw`
        DELETE FROM matter_assignments
        WHERE matter_id = ${matterId}::uuid
      `;

      // Add new assignments
      for (const userId of userIds) {
        await tx.$executeRaw`
          INSERT INTO matter_assignments (matter_id, user_id, assigned_by, assigned_at)
          VALUES (${matterId}::uuid, ${userId}::uuid, ${assignedBy}::uuid, NOW())
        `;
      }

      // Return updated matter
      const result = await tx.$queryRaw<Array<Record<string, unknown>>>`
        SELECT m.*,
               array_agg(DISTINCT ma.user_id) FILTER (WHERE ma.user_id IS NOT NULL) as team_members
        FROM matters m
        LEFT JOIN matter_assignments ma ON m.id = ma.matter_id
        WHERE m.id = ${matterId}::uuid
          AND m.organization_id = ${organizationId}::uuid
          AND m.deleted_at IS NULL
        GROUP BY m.id
      `;

      const matter = result[0];
      if (!matter) {
        throw new Error('Matter not found');
      }
      return matter;
    });
  }

  /**
   * Get activity history for a matter
   */
  async getActivityHistory(
    matterId: string,
    organizationId: string,
  ): Promise<Array<Record<string, unknown>>> {
    return this.prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT ma.* FROM matter_activities ma
      JOIN matters m ON ma.matter_id = m.id
      WHERE ma.matter_id = ${matterId}::uuid
        AND m.organization_id = ${organizationId}::uuid
        AND m.deleted_at IS NULL
      ORDER BY ma.created_at DESC
      LIMIT 100
    `;
  }

  /**
   * Check for conflicts of interest
   *
   * Identifies matters where any of the given party IDs appear
   * on opposing sides, implementing Chinese Wall requirements.
   *
   * @param partyIds - Party IDs to check for conflicts
   * @param organizationId - Tenant organization
   * @param excludeMatterId - Matter to exclude from check (for updates)
   * @returns Array of conflicting matters with details
   */
  async checkConflicts(
    partyIds: string[],
    organizationId: string,
    excludeMatterId?: string,
  ): Promise<Array<Record<string, unknown>>> {
    if (partyIds.length === 0) return [];

    // Find matters where any of the given parties already appear
    const conflicts = await this.prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT DISTINCT
        m.id as matter_id,
        m.title as matter_title,
        m.status as matter_status,
        mp.party_id,
        p.name as party_name,
        mp.role as party_role
      FROM matter_parties mp
      JOIN matters m ON mp.matter_id = m.id
      JOIN parties p ON mp.party_id = p.id
      WHERE mp.party_id = ANY(${partyIds}::uuid[])
        AND m.organization_id = ${organizationId}::uuid
        AND m.deleted_at IS NULL
        AND m.status NOT IN ('closed', 'cancelled')
        ${excludeMatterId ? this.prisma.$queryRaw`AND m.id != ${excludeMatterId}::uuid` : this.prisma.$queryRaw``}
      ORDER BY m.title
    `;

    return conflicts;
  }

  /**
   * Add parties to a matter
   */
  async addParties(
    matterId: string,
    parties: Array<{ partyId: string; role: string }>,
    organizationId: string,
  ): Promise<void> {
    for (const party of parties) {
      await this.prisma.$executeRaw`
        INSERT INTO matter_parties (id, matter_id, party_id, role, organization_id, created_at)
        VALUES (
          gen_random_uuid(),
          ${matterId}::uuid,
          ${party.partyId}::uuid,
          ${party.role},
          ${organizationId}::uuid,
          NOW()
        )
        ON CONFLICT (matter_id, party_id) DO UPDATE SET role = ${party.role}
      `;
    }
  }

  /**
   * Get parties for a matter
   */
  async getParties(
    matterId: string,
    organizationId: string,
  ): Promise<Array<Record<string, unknown>>> {
    return this.prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT mp.*, p.name as party_name, p.type as party_type, p.email as party_email
      FROM matter_parties mp
      JOIN parties p ON mp.party_id = p.id
      JOIN matters m ON mp.matter_id = m.id
      WHERE mp.matter_id = ${matterId}::uuid
        AND m.organization_id = ${organizationId}::uuid
        AND m.deleted_at IS NULL
      ORDER BY mp.role, p.name
    `;
  }
}
