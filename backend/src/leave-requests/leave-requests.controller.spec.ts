import { Test, TestingModule } from '@nestjs/testing';
import { LeaveRequestsController } from './leave-requests.controller';
import { LeaveRequestsService } from './leave-requests.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { DecideLeaveDto } from './dto/decide-leave.dto';
import { LeaveFilterDto } from './dto/leave-filter.dto';

describe('LeaveRequestsController', () => {
  let controller: LeaveRequestsController;
  let service: LeaveRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaveRequestsController],
      providers: [
        {
          provide: LeaveRequestsService,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            cancel: jest.fn(),
            decide: jest.fn(),
            findMine: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<LeaveRequestsController>(LeaveRequestsController);
    service = module.get<LeaveRequestsService>(LeaveRequestsService);
  });

  describe('create', () => {
    it('should call service.create with user id and dto', async () => {
      const user = { id: 'user123', role: 'EMPLOYEE' as any };
      const dto: CreateLeaveDto = {
        type: 'VL',
        startDate: '2026-03-01',
        endDate: '2026-03-03',
        reason: 'Vacation',
      };
      const mockResult = { id: 'leave123', ...dto, status: 'PENDING' } as any;

      jest.spyOn(service, 'create').mockResolvedValue(mockResult);

      const result = await controller.create(user, dto);

      expect(service.create).toHaveBeenCalledWith(user.id, dto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('update', () => {
    it('should call service.update with user id, leave id, and dto', async () => {
      const user = { id: 'user123' };
      const leaveId = 'leave123';
      const dto: UpdateLeaveDto = { reason: 'Updated reason' };
      const mockResult = { id: leaveId, reason: 'Updated reason' } as any;

      jest.spyOn(service, 'update').mockResolvedValue(mockResult);

      const result = await controller.update(user, leaveId, dto);

      expect(service.update).toHaveBeenCalledWith(user.id, leaveId, dto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('cancel', () => {
    it('should call service.cancel with user id and leave id', async () => {
      const user = { id: 'user123' };
      const leaveId = 'leave123';
      const mockResult = { id: leaveId, status: 'CANCELLED' } as any;

      jest.spyOn(service, 'cancel').mockResolvedValue(mockResult);

      const result = await controller.cancel(user, leaveId);

      expect(service.cancel).toHaveBeenCalledWith(user.id, leaveId);
      expect(result).toEqual(mockResult);
    });
  });

  describe('decide', () => {
    it('should call service.decide with decision maker id', async () => {
      const user = { id: 'hr123' };
      const leaveId = 'leave123';
      const dto: DecideLeaveDto = { decision: 'APPROVED', note: 'OK' };
      const mockResult = { id: leaveId, status: 'APPROVED' } as any;

      jest.spyOn(service, 'decide').mockResolvedValue(mockResult);

      const result = await controller.decide(user, leaveId, dto);

      expect(service.decide).toHaveBeenCalledWith(user.id, leaveId, dto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findMine', () => {
    it('should call service.findMine with user id and filters', async () => {
      const user = { id: 'user123' };
      const filters: LeaveFilterDto = { page: 1, limit: 10 };
      const mockResult = {
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };

      jest.spyOn(service, 'findMine').mockResolvedValue(mockResult as any);

      const result = await controller.findMine(user, filters);

      expect(service.findMine).toHaveBeenCalledWith(user.id, filters);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with filters', async () => {
      const filters: LeaveFilterDto = { page: 1, limit: 10 };
      const mockResult = {
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };

      jest.spyOn(service, 'findAll').mockResolvedValue(mockResult as any);

      const result = await controller.findAll(filters);

      expect(service.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockResult);
    });
  });
});
