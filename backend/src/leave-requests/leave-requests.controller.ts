import { Controller, Post, Patch, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LeaveRequestsService } from './leave-requests.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { DecideLeaveDto } from './dto/decide-leave.dto';
import { LeaveFilterDto } from './dto/leave-filter.dto';
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

  @Patch(':id')
  @Roles(Role.EMPLOYEE, Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Update own PENDING leave request' })
  @ApiResponse({ status: 200, description: 'Leave request updated' })
  @ApiResponse({ status: 403, description: 'Not owner' })
  @ApiResponse({ status: 400, description: 'Cannot update non-PENDING leave' })
  update(@CurrentUser() user: { id: string }, @Param('id') id: string, @Body() dto: UpdateLeaveDto) {
    return this.service.update(user.id, id, dto);
  }

  @Post(':id/cancel')
  @Roles(Role.EMPLOYEE, Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Cancel own PENDING leave request' })
  @ApiResponse({ status: 200, description: 'Leave request cancelled' })
  @ApiResponse({ status: 403, description: 'Not owner' })
  @ApiResponse({ status: 400, description: 'Cannot cancel non-PENDING leave' })
  cancel(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.service.cancel(user.id, id);
  }

  @Post(':id/decision')
  @Roles(Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Approve or reject a PENDING leave request (HR/Admin only)' })
  @ApiResponse({ status: 200, description: 'Decision recorded' })
  @ApiResponse({ status: 400, description: 'Leave is not PENDING' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  decide(@CurrentUser() user: { id: string }, @Param('id') id: string, @Body() dto: DecideLeaveDto) {
    return this.service.decide(user.id, id, dto);
  }

  @Get('mine')
  @Roles(Role.EMPLOYEE, Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Get own leave requests with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated leave requests' })
  findMine(@CurrentUser() user: { id: string }, @Query() filters: LeaveFilterDto) {
    return this.service.findMine(user.id, filters);
  }

  @Get()
  @Roles(Role.HR, Role.ADMIN)
  @ApiOperation({ summary: 'Get all leave requests (HR/Admin only)' })
  @ApiResponse({ status: 200, description: 'Paginated leave requests' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  findAll(@Query() filters: LeaveFilterDto) {
    return this.service.findAll(filters);
  }
}
