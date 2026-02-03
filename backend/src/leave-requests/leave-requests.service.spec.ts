import { Test, TestingModule } from '@nestjs/testing';
import { LeaveRequestsService } from './leave-requests.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
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

      jest.spyOn(prisma.leaveRequest, 'create').mockResolvedValue(mockLeaveRequest as any);

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

      await expect(service.create(userId, dto)).rejects.toThrow(BadRequestException);
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

      jest.spyOn(prisma.leaveRequest, 'findUnique').mockResolvedValue(existingLeave as any);
      jest.spyOn(prisma.leaveRequest, 'update').mockResolvedValue(updatedLeave as any);

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

      jest.spyOn(prisma.leaveRequest, 'findUnique').mockResolvedValue(existingLeave as any);

      await expect(service.update(userId, leaveId, dto)).rejects.toThrow(ForbiddenException);
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

      jest.spyOn(prisma.leaveRequest, 'findUnique').mockResolvedValue(existingLeave as any);

      await expect(service.update(userId, leaveId, dto)).rejects.toThrow(BadRequestException);
      await expect(service.update(userId, leaveId, dto)).rejects.toThrow(
        'Cannot update leave request that is not PENDING',
      );
    });

    it('should throw NotFoundException if leave does not exist', async () => {
      const userId = 'user123';
      const leaveId = 'nonexistent';
      const dto: UpdateLeaveDto = { reason: 'Update' };

      jest.spyOn(prisma.leaveRequest, 'findUnique').mockResolvedValue(null);

      await expect(service.update(userId, leaveId, dto)).rejects.toThrow(NotFoundException);
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

      jest.spyOn(prisma.leaveRequest, 'findUnique').mockResolvedValue(existingLeave as any);

      await expect(service.update(userId, leaveId, dto)).rejects.toThrow(BadRequestException);
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

      jest.spyOn(prisma.leaveRequest, 'findUnique').mockResolvedValue(existingLeave as any);
      jest.spyOn(prisma.leaveRequest, 'update').mockResolvedValue(cancelledLeave as any);

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

      jest.spyOn(prisma.leaveRequest, 'findUnique').mockResolvedValue(existingLeave as any);

      await expect(service.cancel(userId, leaveId)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if status is not PENDING', async () => {
      const userId = 'user123';
      const leaveId = 'leave123';

      const existingLeave = {
        id: leaveId,
        userId,
        status: 'APPROVED',
      };

      jest.spyOn(prisma.leaveRequest, 'findUnique').mockResolvedValue(existingLeave as any);

      await expect(service.cancel(userId, leaveId)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if leave does not exist', async () => {
      const userId = 'user123';
      const leaveId = 'nonexistent';

      jest.spyOn(prisma.leaveRequest, 'findUnique').mockResolvedValue(null);

      await expect(service.cancel(userId, leaveId)).rejects.toThrow(NotFoundException);
    });
  });
});
