import { Test, TestingModule } from '@nestjs/testing';
import { LeaveRequestsService } from './leave-requests.service';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { DecideLeaveDto } from './dto/decide-leave.dto';
import { LeaveFilterDto } from './dto/leave-filter.dto';

describe('LeaveRequestsService', () => {
  let service: LeaveRequestsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaveRequestsService,
        {
          provide: PrismaService,
          useValue: {
            leaveRequest: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<LeaveRequestsService>(LeaveRequestsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a leave request with PENDING status', async () => {
      // Arrange
      const userId = 'user123';
      const dto: CreateLeaveDto = {
        type: 'VL',
        startDate: '2026-03-01',
        endDate: '2026-03-03',
        reason: 'Family vacation',
      };

      const mockLeaveRequest = {
        id: 'leave123',
        userId,
        type: 'VL',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-03'),
        reason: 'Family vacation',
        status: 'PENDING',
        decisionById: null,
        decisionNote: null,
        decidedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(prisma.leaveRequest, 'create')
        .mockResolvedValue(mockLeaveRequest as any);

      // Act
      const result = await service.create(userId, dto);

      // Assert
      expect(result).toEqual(mockLeaveRequest);
      expect(prisma.leaveRequest.create).toHaveBeenCalledWith({
        data: {
          userId,
          type: dto.type,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          reason: dto.reason,
          status: 'PENDING',
        },
      });
    });

    it('should throw BadRequestException if startDate > endDate', async () => {
      const userId = 'user123';
      const dto: CreateLeaveDto = {
        type: 'VL',
        startDate: '2026-03-05',
        endDate: '2026-03-01', // Invalid: end before start
        reason: 'Invalid dates',
      };

      await expect(service.create(userId, dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(userId, dto)).rejects.toThrow(
        'startDate must be before or equal to endDate',
      );
    });
  });

  describe('update', () => {
    it('should update a PENDING leave request owned by user', async () => {
      const userId = 'user123';
      const leaveId = 'leave123';
      const dto: UpdateLeaveDto = { reason: 'Updated reason' };

      const existingLeave = {
        id: leaveId,
        userId,
        status: 'PENDING',
        type: 'VL',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-03'),
        reason: 'Original reason',
      };

      const updatedLeave = { ...existingLeave, reason: 'Updated reason' };

      jest
        .spyOn(prisma.leaveRequest, 'findUnique')
        .mockResolvedValue(existingLeave as any);
      jest
        .spyOn(prisma.leaveRequest, 'update')
        .mockResolvedValue(updatedLeave as any);

      const result = await service.update(userId, leaveId, dto);

      expect(result).toEqual(updatedLeave);
    });

    it('should throw ForbiddenException if not owner', async () => {
      const userId = 'user123';
      const leaveId = 'leave456';
      const dto: UpdateLeaveDto = { reason: 'Hacking attempt' };

      const existingLeave = {
        id: leaveId,
        userId: 'otherUser',
        status: 'PENDING',
      };

      jest
        .spyOn(prisma.leaveRequest, 'findUnique')
        .mockResolvedValue(existingLeave as any);

      await expect(service.update(userId, leaveId, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException if status is not PENDING', async () => {
      const userId = 'user123';
      const leaveId = 'leave123';
      const dto: UpdateLeaveDto = { reason: 'Too late' };

      const existingLeave = {
        id: leaveId,
        userId,
        status: 'APPROVED', // Cannot update after decision
      };

      jest
        .spyOn(prisma.leaveRequest, 'findUnique')
        .mockResolvedValue(existingLeave as any);

      await expect(service.update(userId, leaveId, dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(userId, leaveId, dto)).rejects.toThrow(
        'Cannot update leave request that is not PENDING',
      );
    });

    it('should throw NotFoundException if leave does not exist', async () => {
      const userId = 'user123';
      const leaveId = 'nonexistent';
      const dto: UpdateLeaveDto = { reason: 'Update' };

      jest.spyOn(prisma.leaveRequest, 'findUnique').mockResolvedValue(null);

      await expect(service.update(userId, leaveId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should validate dates when both startDate and endDate are updated', async () => {
      const userId = 'user123';
      const leaveId = 'leave123';
      const dto: UpdateLeaveDto = {
        startDate: '2026-03-05',
        endDate: '2026-03-01', // Invalid: end before start
      };

      const existingLeave = {
        id: leaveId,
        userId,
        status: 'PENDING',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-03'),
      };

      jest
        .spyOn(prisma.leaveRequest, 'findUnique')
        .mockResolvedValue(existingLeave as any);

      await expect(service.update(userId, leaveId, dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(userId, leaveId, dto)).rejects.toThrow(
        'startDate must be before or equal to endDate',
      );
    });
  });

  describe('cancel', () => {
    it('should cancel a PENDING leave request owned by user', async () => {
      const userId = 'user123';
      const leaveId = 'leave123';

      const existingLeave = {
        id: leaveId,
        userId,
        status: 'PENDING',
      };

      const cancelledLeave = { ...existingLeave, status: 'CANCELLED' };

      jest
        .spyOn(prisma.leaveRequest, 'findUnique')
        .mockResolvedValue(existingLeave as any);
      jest
        .spyOn(prisma.leaveRequest, 'update')
        .mockResolvedValue(cancelledLeave as any);

      const result = await service.cancel(userId, leaveId);

      expect(result.status).toBe('CANCELLED');
    });

    it('should throw ForbiddenException if not owner', async () => {
      const userId = 'user123';
      const leaveId = 'leave456';

      const existingLeave = {
        id: leaveId,
        userId: 'otherUser',
        status: 'PENDING',
      };

      jest
        .spyOn(prisma.leaveRequest, 'findUnique')
        .mockResolvedValue(existingLeave as any);

      await expect(service.cancel(userId, leaveId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException if status is not PENDING', async () => {
      const userId = 'user123';
      const leaveId = 'leave123';

      const existingLeave = {
        id: leaveId,
        userId,
        status: 'APPROVED',
      };

      jest
        .spyOn(prisma.leaveRequest, 'findUnique')
        .mockResolvedValue(existingLeave as any);

      await expect(service.cancel(userId, leaveId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if leave does not exist', async () => {
      const userId = 'user123';
      const leaveId = 'nonexistent';

      jest.spyOn(prisma.leaveRequest, 'findUnique').mockResolvedValue(null);

      await expect(service.cancel(userId, leaveId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('decide', () => {
    it('should approve a PENDING leave request and set decision metadata', async () => {
      const decisionById = 'hr123';
      const leaveId = 'leave123';
      const dto: DecideLeaveDto = {
        decision: 'APPROVED',
        note: 'Enjoy your vacation',
      };

      const existingLeave = {
        id: leaveId,
        userId: 'employee123',
        status: 'PENDING',
        decisionById: null,
        decidedAt: null,
      };

      const decidedLeave = {
        ...existingLeave,
        status: 'APPROVED',
        decisionById,
        decisionNote: dto.note,
        decidedAt: new Date(),
      };

      jest
        .spyOn(prisma.leaveRequest, 'findUnique')
        .mockResolvedValue(existingLeave as any);
      jest
        .spyOn(prisma.leaveRequest, 'update')
        .mockResolvedValue(decidedLeave as any);

      const result = await service.decide(decisionById, leaveId, dto);

      expect(result.status).toBe('APPROVED');
      expect(result.decisionById).toBe(decisionById);
      expect(result.decisionNote).toBe(dto.note);
      expect(result.decidedAt).toBeDefined();
    });

    it('should reject a PENDING leave request', async () => {
      const decisionById = 'hr123';
      const leaveId = 'leave123';
      const dto: DecideLeaveDto = {
        decision: 'REJECTED',
        note: 'Insufficient leave balance',
      };

      const existingLeave = {
        id: leaveId,
        userId: 'employee123',
        status: 'PENDING',
      };

      const decidedLeave = {
        ...existingLeave,
        status: 'REJECTED',
        decisionById,
        decisionNote: dto.note,
        decidedAt: new Date(),
      };

      jest
        .spyOn(prisma.leaveRequest, 'findUnique')
        .mockResolvedValue(existingLeave as any);
      jest
        .spyOn(prisma.leaveRequest, 'update')
        .mockResolvedValue(decidedLeave as any);

      const result = await service.decide(decisionById, leaveId, dto);

      expect(result.status).toBe('REJECTED');
    });

    it('should throw BadRequestException if leave is not PENDING', async () => {
      const decisionById = 'hr123';
      const leaveId = 'leave123';
      const dto: DecideLeaveDto = { decision: 'APPROVED' };

      const existingLeave = {
        id: leaveId,
        status: 'APPROVED', // Already decided
      };

      jest
        .spyOn(prisma.leaveRequest, 'findUnique')
        .mockResolvedValue(existingLeave as any);

      await expect(service.decide(decisionById, leaveId, dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.decide(decisionById, leaveId, dto)).rejects.toThrow(
        'Can only decide on PENDING leave requests',
      );
    });

    it('should throw NotFoundException if leave does not exist', async () => {
      const decisionById = 'hr123';
      const leaveId = 'nonexistent';
      const dto: DecideLeaveDto = { decision: 'APPROVED' };

      jest.spyOn(prisma.leaveRequest, 'findUnique').mockResolvedValue(null);

      await expect(service.decide(decisionById, leaveId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findMine', () => {
    it('should return paginated leave requests for the user', async () => {
      const userId = 'user123';
      const filters: LeaveFilterDto = { page: 1, limit: 10 };

      const mockLeaves = [
        { id: 'leave1', userId, status: 'PENDING' },
        { id: 'leave2', userId, status: 'APPROVED' },
      ];

      jest
        .spyOn(prisma.leaveRequest, 'findMany')
        .mockResolvedValue(mockLeaves as any);
      jest.spyOn(prisma.leaveRequest, 'count').mockResolvedValue(2);

      const result = await service.findMine(userId, filters);

      expect(result.data).toEqual(mockLeaves);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it('should filter by status if provided', async () => {
      const userId = 'user123';
      const filters: LeaveFilterDto = { status: 'PENDING', page: 1, limit: 10 };

      const mockLeaves = [{ id: 'leave1', userId, status: 'PENDING' }];

      jest
        .spyOn(prisma.leaveRequest, 'findMany')
        .mockResolvedValue(mockLeaves as any);
      jest.spyOn(prisma.leaveRequest, 'count').mockResolvedValue(1);

      const result = await service.findMine(userId, filters);

      expect(prisma.leaveRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId, status: 'PENDING' },
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all leave requests with pagination', async () => {
      const filters: LeaveFilterDto = { page: 1, limit: 10 };

      const mockLeaves = [
        { id: 'leave1', userId: 'user1', status: 'PENDING' },
        { id: 'leave2', userId: 'user2', status: 'APPROVED' },
      ];

      jest
        .spyOn(prisma.leaveRequest, 'findMany')
        .mockResolvedValue(mockLeaves as any);
      jest.spyOn(prisma.leaveRequest, 'count').mockResolvedValue(2);

      const result = await service.findAll(filters);

      expect(result.data).toEqual(mockLeaves);
      expect(result.meta.total).toBe(2);
    });

    it('should filter by userId and status', async () => {
      const filters: LeaveFilterDto = {
        userId: 'user123',
        status: 'APPROVED',
        page: 1,
        limit: 10,
      };

      jest.spyOn(prisma.leaveRequest, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.leaveRequest, 'count').mockResolvedValue(0);

      await service.findAll(filters);

      expect(prisma.leaveRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user123', status: 'APPROVED' },
        }),
      );
    });
  });

  describe('date range filtering', () => {
    it('should filter by fromDate only', async () => {
      const userId = 'user123';
      const filters: LeaveFilterDto = {
        fromDate: '2026-03-01',
        page: 1,
        limit: 10,
      };

      const mockLeaves = [
        {
          id: 'leave1',
          userId,
          startDate: new Date('2026-03-05'),
          endDate: new Date('2026-03-10'),
        },
        {
          id: 'leave2',
          userId,
          startDate: new Date('2026-03-15'),
          endDate: new Date('2026-03-20'),
        },
      ];

      jest
        .spyOn(prisma.leaveRequest, 'findMany')
        .mockResolvedValue(mockLeaves as any);
      jest.spyOn(prisma.leaveRequest, 'count').mockResolvedValue(2);

      const result = await service.findMine(userId, filters);

      expect(result.data).toEqual(mockLeaves);
      expect(prisma.leaveRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            startDate: { gte: new Date('2026-03-01') },
          }),
        }),
      );
    });

    it('should filter by toDate only', async () => {
      const userId = 'user123';
      const filters: LeaveFilterDto = {
        toDate: '2026-03-31',
        page: 1,
        limit: 10,
      };

      const mockLeaves = [
        {
          id: 'leave1',
          userId,
          startDate: new Date('2026-03-05'),
          endDate: new Date('2026-03-10'),
        },
      ];

      jest
        .spyOn(prisma.leaveRequest, 'findMany')
        .mockResolvedValue(mockLeaves as any);
      jest.spyOn(prisma.leaveRequest, 'count').mockResolvedValue(1);

      const result = await service.findMine(userId, filters);

      expect(result.data).toEqual(mockLeaves);
      expect(prisma.leaveRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            endDate: { lte: new Date('2026-03-31') },
          }),
        }),
      );
    });

    it('should filter by date range (both fromDate and toDate)', async () => {
      const filters: LeaveFilterDto = {
        fromDate: '2026-03-01',
        toDate: '2026-03-31',
        page: 1,
        limit: 10,
      };

      const mockLeaves = [
        {
          id: 'leave1',
          userId: 'user1',
          startDate: new Date('2026-03-05'),
          endDate: new Date('2026-03-10'),
        },
        {
          id: 'leave2',
          userId: 'user2',
          startDate: new Date('2026-03-15'),
          endDate: new Date('2026-03-20'),
        },
      ];

      jest
        .spyOn(prisma.leaveRequest, 'findMany')
        .mockResolvedValue(mockLeaves as any);
      jest.spyOn(prisma.leaveRequest, 'count').mockResolvedValue(2);

      const result = await service.findAll(filters);

      expect(result.data).toEqual(mockLeaves);
      expect(prisma.leaveRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            startDate: { gte: new Date('2026-03-01') },
            endDate: { lte: new Date('2026-03-31') },
          }),
        }),
      );
    });
  });

  describe('overlap detection', () => {
    it('should create leave with no overlaps', async () => {
      const userId = 'user123';
      const dto: CreateLeaveDto = {
        type: 'VL',
        startDate: '2026-03-15',
        endDate: '2026-03-20',
        reason: 'Spring vacation',
      };

      jest.spyOn(prisma.leaveRequest, 'findFirst').mockResolvedValue(null);

      const mockLeaveRequest = {
        id: 'leave123',
        userId,
        type: 'VL',
        startDate: new Date('2026-03-15'),
        endDate: new Date('2026-03-20'),
        reason: 'Spring vacation',
        status: 'PENDING',
        decisionById: null,
        decisionNote: null,
        decidedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(prisma.leaveRequest, 'create')
        .mockResolvedValue(mockLeaveRequest as any);

      const result = await service.create(userId, dto);

      expect(result).toEqual(mockLeaveRequest);
      expect(prisma.leaveRequest.findFirst).toHaveBeenCalledWith({
        where: {
          userId,
          status: 'APPROVED',
          startDate: { lte: new Date(dto.endDate) },
          endDate: { gte: new Date(dto.startDate) },
        },
      });
    });

    it('should throw ConflictException when overlapping with APPROVED leave', async () => {
      const userId = 'user123';
      const dto: CreateLeaveDto = {
        type: 'VL',
        startDate: '2026-03-08',
        endDate: '2026-03-12',
        reason: 'Overlapping vacation',
      };

      const existingLeave = {
        id: 'existing123',
        userId,
        status: 'APPROVED',
        startDate: new Date('2026-03-05'),
        endDate: new Date('2026-03-10'),
      };

      jest
        .spyOn(prisma.leaveRequest, 'findFirst')
        .mockResolvedValue(existingLeave as any);

      await expect(service.create(userId, dto)).rejects.toThrow(
        'Leave request overlaps with approved leave from',
      );
      expect(prisma.leaveRequest.create).not.toHaveBeenCalled();
    });

    it('should allow adjacent leaves (no overlap)', async () => {
      const userId = 'user123';
      const dto: CreateLeaveDto = {
        type: 'VL',
        startDate: '2026-03-11',
        endDate: '2026-03-15',
        reason: 'Adjacent vacation',
      };

      const existingLeave = {
        id: 'existing123',
        userId,
        status: 'APPROVED',
        startDate: new Date('2026-03-05'),
        endDate: new Date('2026-03-10'),
      };

      // findFirst returns null because dates don't overlap
      jest.spyOn(prisma.leaveRequest, 'findFirst').mockResolvedValue(null);

      const mockLeaveRequest = {
        id: 'leave123',
        userId,
        type: 'VL',
        startDate: new Date('2026-03-11'),
        endDate: new Date('2026-03-15'),
        reason: 'Adjacent vacation',
        status: 'PENDING',
        decisionById: null,
        decisionNote: null,
        decidedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(prisma.leaveRequest, 'create')
        .mockResolvedValue(mockLeaveRequest as any);

      const result = await service.create(userId, dto);

      expect(result).toEqual(mockLeaveRequest);
    });

    it('should ignore PENDING leaves when checking overlaps', async () => {
      const userId = 'user123';
      const dto: CreateLeaveDto = {
        type: 'VL',
        startDate: '2026-03-08',
        endDate: '2026-03-12',
        reason: 'New vacation',
      };

      // findFirst only checks APPROVED status, so returns null for PENDING
      jest.spyOn(prisma.leaveRequest, 'findFirst').mockResolvedValue(null);

      const mockLeaveRequest = {
        id: 'leave123',
        userId,
        type: 'VL',
        startDate: new Date('2026-03-08'),
        endDate: new Date('2026-03-12'),
        reason: 'New vacation',
        status: 'PENDING',
        decisionById: null,
        decisionNote: null,
        decidedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(prisma.leaveRequest, 'create')
        .mockResolvedValue(mockLeaveRequest as any);

      const result = await service.create(userId, dto);

      expect(result).toEqual(mockLeaveRequest);
      expect(prisma.leaveRequest.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'APPROVED',
          }),
        }),
      );
    });

    it('should ignore REJECTED leaves when checking overlaps', async () => {
      const userId = 'user123';
      const dto: CreateLeaveDto = {
        type: 'VL',
        startDate: '2026-03-08',
        endDate: '2026-03-12',
        reason: 'New vacation',
      };

      // findFirst only checks APPROVED status
      jest.spyOn(prisma.leaveRequest, 'findFirst').mockResolvedValue(null);

      const mockLeaveRequest = {
        id: 'leave123',
        userId,
        type: 'VL',
        startDate: new Date('2026-03-08'),
        endDate: new Date('2026-03-12'),
        reason: 'New vacation',
        status: 'PENDING',
        decisionById: null,
        decisionNote: null,
        decidedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(prisma.leaveRequest, 'create')
        .mockResolvedValue(mockLeaveRequest as any);

      const result = await service.create(userId, dto);

      expect(result).toEqual(mockLeaveRequest);
    });

    it('should only check overlaps for same user', async () => {
      const userId = 'user123';
      const dto: CreateLeaveDto = {
        type: 'VL',
        startDate: '2026-03-08',
        endDate: '2026-03-12',
        reason: 'My vacation',
      };

      // findFirst checks for userId in where clause
      jest.spyOn(prisma.leaveRequest, 'findFirst').mockResolvedValue(null);

      const mockLeaveRequest = {
        id: 'leave123',
        userId,
        type: 'VL',
        startDate: new Date('2026-03-08'),
        endDate: new Date('2026-03-12'),
        reason: 'My vacation',
        status: 'PENDING',
        decisionById: null,
        decisionNote: null,
        decidedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(prisma.leaveRequest, 'create')
        .mockResolvedValue(mockLeaveRequest as any);

      const result = await service.create(userId, dto);

      expect(result).toEqual(mockLeaveRequest);
      expect(prisma.leaveRequest.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
          }),
        }),
      );
    });
  });
});
