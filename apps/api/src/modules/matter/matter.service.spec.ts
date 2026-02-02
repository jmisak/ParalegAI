import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MatterService } from './matter.service';
import { MatterRepository } from './matter.repository';
import { MatterType, MatterStatus, MatterPriority } from './dto';

describe('MatterService', () => {
  let service: MatterService;
  let repository: MatterRepository;

  const mockRepository = {
    create: jest.fn(),
    findMany: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    assignTeam: jest.fn(),
    getActivityHistory: jest.fn(),
  };

  const mockMatter = {
    id: 'matter-123',
    title: 'Test Matter',
    description: 'Test description',
    type: MatterType.PURCHASE,
    status: MatterStatus.ACTIVE,
    priority: MatterPriority.MEDIUM,
    organization_id: 'org-123',
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 'user-123',
    updated_by: 'user-123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatterService,
        { provide: MatterRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<MatterService>(MatterService);
    repository = module.get<MatterRepository>(MatterRepository);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a matter', async () => {
      mockRepository.create.mockResolvedValue(mockMatter);

      const result = await service.create(
        {
          title: 'Test Matter',
          type: MatterType.PURCHASE,
        },
        'user-123',
        'org-123',
      );

      expect(result.id).toBe(mockMatter.id);
      expect(result.title).toBe(mockMatter.title);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Matter',
          type: MatterType.PURCHASE,
          organizationId: 'org-123',
          createdBy: 'user-123',
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated matters', async () => {
      mockRepository.findMany.mockResolvedValue({
        data: [mockMatter],
        total: 1,
      });

      const result = await service.findAll({ page: 1, limit: 20 }, 'org-123');

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should apply filters', async () => {
      mockRepository.findMany.mockResolvedValue({
        data: [],
        total: 0,
      });

      await service.findAll(
        { status: MatterStatus.ACTIVE, type: MatterType.PURCHASE },
        'org-123',
      );

      expect(repository.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          status: MatterStatus.ACTIVE,
          type: MatterType.PURCHASE,
        }),
        'org-123',
        expect.any(Object),
      );
    });
  });

  describe('findOne', () => {
    it('should return a matter by id', async () => {
      mockRepository.findById.mockResolvedValue(mockMatter);

      const result = await service.findOne('matter-123', 'org-123');

      expect(result.id).toBe(mockMatter.id);
    });

    it('should throw NotFoundException when matter not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'org-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a matter', async () => {
      mockRepository.findById.mockResolvedValue(mockMatter);
      mockRepository.update.mockResolvedValue({
        ...mockMatter,
        title: 'Updated Title',
      });

      const result = await service.update(
        'matter-123',
        { title: 'Updated Title' },
        'user-123',
        'org-123',
      );

      expect(result.title).toBe('Updated Title');
    });

    it('should throw NotFoundException when matter not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { title: 'Test' }, 'user-123', 'org-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft delete a matter', async () => {
      mockRepository.findById.mockResolvedValue(mockMatter);
      mockRepository.softDelete.mockResolvedValue(undefined);

      await service.remove('matter-123', 'user-123', 'org-123');

      expect(repository.softDelete).toHaveBeenCalledWith('matter-123', 'user-123');
    });
  });

  describe('assignTeam', () => {
    it('should assign team members to a matter', async () => {
      mockRepository.findById.mockResolvedValue(mockMatter);
      mockRepository.assignTeam.mockResolvedValue({
        ...mockMatter,
        team_members: ['user-1', 'user-2'],
      });

      const result = await service.assignTeam(
        'matter-123',
        ['user-1', 'user-2'],
        'user-123',
        'org-123',
      );

      expect(result.teamMembers).toEqual(['user-1', 'user-2']);
    });
  });
});
