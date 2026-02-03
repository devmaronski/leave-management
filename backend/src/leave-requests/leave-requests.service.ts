import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { DecideLeaveDto } from './dto/decide-leave.dto';
import { LeaveFilterDto } from './dto/leave-filter.dto';
import { paginate } from '../common/utils/pagination.util';

@Injectable()
export class LeaveRequestsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateLeaveDto) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (start > end) {
      throw new BadRequestException(
        'startDate must be before or equal to endDate',
      );
    }

    return this.prisma.leaveRequest.create({
      data: {
        userId,
        type: dto.type,
        startDate: start,
        endDate: end,
        reason: dto.reason,
        status: 'PENDING',
      },
    });
  }

  async update(userId: string, leaveId: string, dto: UpdateLeaveDto) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id: leaveId },
    });

    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }

    if (leave.userId !== userId) {
      throw new ForbiddenException(
        'You can only update your own leave requests',
      );
    }

    if (leave.status !== 'PENDING') {
      throw new BadRequestException(
        'Cannot update leave request that is not PENDING',
      );
    }

    // Validate dates if both are being updated
    if (dto.startDate || dto.endDate) {
      const start = dto.startDate ? new Date(dto.startDate) : leave.startDate;
      const end = dto.endDate ? new Date(dto.endDate) : leave.endDate;

      if (start > end) {
        throw new BadRequestException(
          'startDate must be before or equal to endDate',
        );
      }
    }

    return this.prisma.leaveRequest.update({
      where: { id: leaveId },
      data: {
        ...(dto.type && { type: dto.type }),
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate && { endDate: new Date(dto.endDate) }),
        ...(dto.reason && { reason: dto.reason }),
      },
    });
  }

  async cancel(userId: string, leaveId: string) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id: leaveId },
    });

    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }

    if (leave.userId !== userId) {
      throw new ForbiddenException(
        'You can only cancel your own leave requests',
      );
    }

    if (leave.status !== 'PENDING') {
      throw new BadRequestException(
        'Cannot cancel leave request that is not PENDING',
      );
    }

    return this.prisma.leaveRequest.update({
      where: { id: leaveId },
      data: { status: 'CANCELLED' },
    });
  }

  async decide(decisionById: string, leaveId: string, dto: DecideLeaveDto) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id: leaveId },
    });

    if (!leave) {
      throw new NotFoundException('Leave request not found');
    }

    if (leave.status !== 'PENDING') {
      throw new BadRequestException(
        'Can only decide on PENDING leave requests',
      );
    }

    return this.prisma.leaveRequest.update({
      where: { id: leaveId },
      data: {
        status: dto.decision,
        decisionById,
        decisionNote: dto.note || null,
        decidedAt: new Date(),
      },
    });
  }

  async findMine(userId: string, filters: LeaveFilterDto) {
    const { status, page = 1, limit = 10 } = filters;

    const where = {
      userId,
      ...(status && { status }),
    };

    return paginate(
      this.prisma.leaveRequest,
      {
        where,
        orderBy: { createdAt: 'desc' },
      },
      { page, limit },
    );
  }

  async findAll(filters: LeaveFilterDto) {
    const { status, userId, page = 1, limit = 10 } = filters;

    const where = {
      ...(userId && { userId }),
      ...(status && { status }),
    };

    return paginate(
      this.prisma.leaveRequest,
      {
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          decisionBy: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      },
      { page, limit },
    );
  }
}
