import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { MatterRepository } from './matter.repository';
import {
  CreateMatterDto,
  UpdateMatterDto,
  MatterQueryDto,
  MatterResponseDto,
} from './dto';
import { PaginatedResponse } from '@common/interfaces';
import { paginate } from '@common/dto';

@Injectable()
export class MatterService {
  private readonly logger = new Logger(MatterService.name);

  constructor(private readonly matterRepository: MatterRepository) {}

  /**
   * Create a new matter
   */
  async create(
    dto: CreateMatterDto,
    userId: string,
    organizationId: string,
  ): Promise<MatterResponseDto> {
    this.logger.log(`Creating matter: ${dto.title} for org: ${organizationId}`);

    const matter = await this.matterRepository.create({
      ...dto,
      closingDate: dto.closingDate ? new Date(dto.closingDate) : undefined,
      organizationId,
      createdBy: userId,
      updatedBy: userId,
    });

    return this.toResponseDto(matter);
  }

  /**
   * Find all matters with filtering and pagination
   */
  async findAll(
    query: MatterQueryDto,
    organizationId: string,
  ): Promise<PaginatedResponse<MatterResponseDto>> {
    const { data, total } = await this.matterRepository.findMany(
      {
        status: query.status,
        type: query.type,
        assignedTo: query.assignedTo,
        search: query.search,
      },
      organizationId,
      {
        page: query.page || 1,
        limit: query.limit || 20,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      },
    );

    return paginate(data.map(this.toResponseDto), total, query);
  }

  /**
   * Find a single matter by ID
   */
  async findOne(id: string, organizationId: string): Promise<MatterResponseDto> {
    const matter = await this.matterRepository.findById(id, organizationId);

    if (!matter) {
      throw new NotFoundException(`Matter with ID ${id} not found`);
    }

    return this.toResponseDto(matter);
  }

  /**
   * Update a matter
   */
  async update(
    id: string,
    dto: UpdateMatterDto,
    userId: string,
    organizationId: string,
  ): Promise<MatterResponseDto> {
    // Verify matter exists
    await this.findOne(id, organizationId);

    const updated = await this.matterRepository.update(id, {
      ...dto,
      closingDate: dto.closingDate ? new Date(dto.closingDate) : undefined,
      updatedBy: userId,
    }, organizationId);

    return this.toResponseDto(updated);
  }

  /**
   * Soft delete a matter
   */
  async remove(id: string, userId: string, organizationId: string): Promise<void> {
    // Verify matter exists
    await this.findOne(id, organizationId);

    await this.matterRepository.softDelete(id, userId, organizationId);
  }

  /**
   * Assign team members to a matter
   */
  async assignTeam(
    matterId: string,
    userIds: string[],
    assignedBy: string,
    organizationId: string,
  ): Promise<MatterResponseDto> {
    // Verify matter exists
    await this.findOne(matterId, organizationId);

    const updated = await this.matterRepository.assignTeam(
      matterId,
      userIds,
      assignedBy,
      organizationId,
    );

    return this.toResponseDto(updated);
  }

  /**
   * Get activity history for a matter
   */
  async getActivityHistory(matterId: string, organizationId: string) {
    // Verify matter exists
    await this.findOne(matterId, organizationId);

    return this.matterRepository.getActivityHistory(matterId, organizationId);
  }

  /**
   * Check for conflicts of interest before adding parties
   *
   * @param partyIds - Party IDs to check
   * @param organizationId - Tenant organization
   * @param excludeMatterId - Matter to exclude (for updates)
   * @returns Conflict details if any exist
   */
  async checkConflicts(
    partyIds: string[],
    organizationId: string,
    excludeMatterId?: string,
  ) {
    const conflicts = await this.matterRepository.checkConflicts(
      partyIds,
      organizationId,
      excludeMatterId,
    );

    return {
      hasConflicts: conflicts.length > 0,
      conflicts: conflicts.map((c) => ({
        matterId: c['matter_id'],
        matterTitle: c['matter_title'],
        partyId: c['party_id'],
        partyName: c['party_name'],
        role: c['party_role'],
      })),
    };
  }

  /**
   * Add parties to a matter with conflict checking
   *
   * @throws ConflictException if conflicts are detected
   */
  async addParties(
    matterId: string,
    parties: Array<{ partyId: string; role: string }>,
    organizationId: string,
    skipConflictCheck = false,
  ) {
    // Verify matter exists
    await this.findOne(matterId, organizationId);

    if (!skipConflictCheck) {
      const partyIds = parties.map((p) => p.partyId);
      const conflictResult = await this.checkConflicts(
        partyIds,
        organizationId,
        matterId,
      );

      if (conflictResult.hasConflicts) {
        throw new ConflictException({
          message: 'Conflict of interest detected',
          conflicts: conflictResult.conflicts,
        });
      }
    }

    await this.matterRepository.addParties(matterId, parties, organizationId);

    return this.findOne(matterId, organizationId);
  }

  /**
   * Get parties for a matter
   */
  async getParties(matterId: string, organizationId: string) {
    // Verify matter exists
    await this.findOne(matterId, organizationId);

    return this.matterRepository.getParties(matterId, organizationId);
  }

  /**
   * Transform entity to response DTO
   */
  private toResponseDto(matter: Record<string, unknown>): MatterResponseDto {
    return {
      id: matter['id'] as string,
      title: matter['title'] as string,
      description: matter['description'] as string | undefined,
      type: matter['type'] as string,
      status: matter['status'] as string,
      priority: matter['priority'] as string,
      clientId: matter['client_id'] as string | undefined,
      propertyAddress: matter['property_address'] as string | undefined,
      closingDate: matter['closing_date'] as Date | undefined,
      teamMembers: matter['team_members'] as string[] | undefined,
      organizationId: matter['organization_id'] as string,
      createdAt: matter['created_at'] as Date,
      updatedAt: matter['updated_at'] as Date,
      createdBy: matter['created_by'] as string,
      updatedBy: matter['updated_by'] as string,
    };
  }
}
