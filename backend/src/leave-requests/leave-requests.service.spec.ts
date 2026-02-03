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
});
