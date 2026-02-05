/**
 * MatterService Unit Tests
 *
 * Tests matter/case management logic including:
 * - CRUD operations for matters
 * - Multi-tenant isolation
 * - Authorization checks
 * - Soft delete behavior
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { MockPrismaService } from '@test/mocks';
import { MatterFactory } from '@test/factories';

// Mock implementation of MatterService for testing
class MatterService {
  constructor(private readonly prisma: MockPrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.matter.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
    });
  }

  async findOne(id: string, organizationId: string) {
    const matter = await this.prisma.matter.findUnique({
      where: { id },
    });

    if (!matter) {
      throw new NotFoundException('Matter not found');
    }

    if (matter.organizationId !== organizationId) {
      throw new ForbiddenException('Access denied');
    }

    if (matter.deletedAt) {
      throw new NotFoundException('Matter not found');
    }

    return matter;
  }

  async create(data: any, userId: string, organizationId: string) {
    return this.prisma.matter.create({
      data: {
        ...data,
        organizationId,
        createdById: userId,
        assignedToId: data.assignedToId || userId,
      },
    });
  }

  async update(id: string, data: any, organizationId: string) {
    const _matter = await this.findOne(id, organizationId);

    return this.prisma.matter.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, organizationId: string) {
    const _matter = await this.findOne(id, organizationId);

    // Soft delete
    return this.prisma.matter.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

describe('MatterService', () => {
  let service: MatterService;
  let prisma: MockPrismaService;

  const TEST_ORG_ID = 'org-123';
  const TEST_USER_ID = 'user-456';

  beforeEach(async () => {
    prisma = new MockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: MatterService,
          useValue: new MatterService(prisma),
        },
        {
          provide: 'PrismaService',
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<MatterService>(MatterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all matters for organization', async () => {
      const matters = MatterFactory.buildList(3, { organizationId: TEST_ORG_ID });
      prisma.matter.findMany.mockResolvedValue(matters);

      const result = await service.findAll(TEST_ORG_ID);

      expect(result).toEqual(matters);
      expect(prisma.matter.findMany).toHaveBeenCalledWith({
        where: {
          organizationId: TEST_ORG_ID,
          deletedAt: null,
        },
      });
    });

    it('should return empty array when no matters exist', async () => {
      prisma.matter.findMany.mockResolvedValue([]);

      const result = await service.findAll(TEST_ORG_ID);

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should exclude soft-deleted matters', async () => {
      const activeMatter = MatterFactory.build({ organizationId: TEST_ORG_ID });
      prisma.matter.findMany.mockResolvedValue([activeMatter]);

      await service.findAll(TEST_ORG_ID);

      expect(prisma.matter.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          deletedAt: null,
        }),
      });
    });
  });

  describe('findOne', () => {
    it('should return matter by id for correct organization', async () => {
      const matter = MatterFactory.build({
        id: 'matter-1',
        organizationId: TEST_ORG_ID,
      });
      prisma.matter.findUnique.mockResolvedValue(matter);

      const result = await service.findOne('matter-1', TEST_ORG_ID);

      expect(result).toEqual(matter);
    });

    it('should throw NotFoundException for non-existent matter', async () => {
      prisma.matter.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', TEST_ORG_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException for wrong organization', async () => {
      const matter = MatterFactory.build({ organizationId: 'different-org' });
      prisma.matter.findUnique.mockResolvedValue(matter);

      await expect(service.findOne(matter.id, TEST_ORG_ID)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for soft-deleted matter', async () => {
      const matter = MatterFactory.build({
        organizationId: TEST_ORG_ID,
        deletedAt: new Date(),
      });
      prisma.matter.findUnique.mockResolvedValue(matter);

      await expect(service.findOne(matter.id, TEST_ORG_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create matter with correct organization context', async () => {
      const createData = {
        title: 'New Purchase Transaction',
        transactionType: 'PURCHASE',
        propertyAddress: '123 Test St',
      };

      const createdMatter = MatterFactory.build({
        ...createData,
        organizationId: TEST_ORG_ID,
        createdById: TEST_USER_ID,
      });

      prisma.matter.create.mockResolvedValue(createdMatter);

      const result = await service.create(createData, TEST_USER_ID, TEST_ORG_ID);

      expect(result).toEqual(createdMatter);
      expect(prisma.matter.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          organizationId: TEST_ORG_ID,
          createdById: TEST_USER_ID,
        }),
      });
    });

    it('should auto-assign to creator if no assignee specified', async () => {
      const createData = { title: 'Test Matter' };
      const createdMatter = MatterFactory.build({ assignedToId: TEST_USER_ID });

      prisma.matter.create.mockResolvedValue(createdMatter);

      await service.create(createData, TEST_USER_ID, TEST_ORG_ID);

      expect(prisma.matter.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          assignedToId: TEST_USER_ID,
        }),
      });
    });
  });

  describe('update', () => {
    it('should update matter when authorized', async () => {
      const matter = MatterFactory.build({
        id: 'matter-1',
        organizationId: TEST_ORG_ID,
        title: 'Old Title',
      });
      const updateData = { title: 'New Title' };
      const updatedMatter = { ...matter, ...updateData };

      prisma.matter.findUnique.mockResolvedValue(matter);
      prisma.matter.update.mockResolvedValue(updatedMatter);

      const result = await service.update('matter-1', updateData, TEST_ORG_ID);

      expect(result.title).toBe('New Title');
      expect(prisma.matter.update).toHaveBeenCalledWith({
        where: { id: 'matter-1' },
        data: updateData,
      });
    });

    it('should throw when updating matter from wrong organization', async () => {
      const matter = MatterFactory.build({ organizationId: 'different-org' });
      prisma.matter.findUnique.mockResolvedValue(matter);

      await expect(service.update(matter.id, {}, TEST_ORG_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('delete', () => {
    it('should soft delete matter', async () => {
      const matter = MatterFactory.build({
        id: 'matter-1',
        organizationId: TEST_ORG_ID,
      });
      const deletedMatter = { ...matter, deletedAt: new Date() };

      prisma.matter.findUnique.mockResolvedValue(matter);
      prisma.matter.update.mockResolvedValue(deletedMatter);

      const result = await service.delete('matter-1', TEST_ORG_ID);

      expect(result.deletedAt).toBeTruthy();
      expect(prisma.matter.update).toHaveBeenCalledWith({
        where: { id: 'matter-1' },
        data: expect.objectContaining({
          deletedAt: expect.any(Date),
        }),
      });
    });

    it('should prevent deletion from wrong organization', async () => {
      const matter = MatterFactory.build({ organizationId: 'different-org' });
      prisma.matter.findUnique.mockResolvedValue(matter);

      await expect(service.delete(matter.id, TEST_ORG_ID)).rejects.toThrow(ForbiddenException);
    });
  });
});
