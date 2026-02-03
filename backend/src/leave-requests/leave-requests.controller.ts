import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LeaveRequestsService } from './leave-requests.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('leave-requests')
@ApiBearerAuth()
@Controller('leave-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveRequestsController {
  constructor(private service: LeaveRequestsService) {}

  @Post()
  @Roles(Role.EMPLOYEE, Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new leave request' })
  @ApiResponse({
    status: 201,
    description: 'Leave request created',
    schema: {
      example: {
        id: 'cuid123',
        userId: 'user123',
        type: 'VL',
        startDate: '2026-03-01T00:00:00.000Z',
        endDate: '2026-03-05T00:00:00.000Z',
        reason: 'Family vacation',
        status: 'PENDING',
        decisionById: null,
        decisionNote: null,
        decidedAt: null,
        createdAt: '2026-02-03T10:00:00.000Z',
        updatedAt: '2026-02-03T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid date range' })
  create(@CurrentUser() user: { id: string; role: Role }, @Body() dto: CreateLeaveDto) {
    return this.service.create(user.id, dto);
  }
}
