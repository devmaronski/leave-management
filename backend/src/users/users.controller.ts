import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Conflict - email already exists' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'List all users with filters (Admin/HR only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  findAll(@Query() filters: UserFilterDto) {
    return this.usersService.findAll(filters);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user (self or admin)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 403, description: 'Forbidden - cannot update other users' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(
    @CurrentUser() currentUser: { id: string; role: Role },
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(currentUser, id, updateUserDto);
  }

  @Patch(':id/deactivate')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Deactivate a user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - cannot deactivate self' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'User not found' })
  deactivate(
    @CurrentUser() currentUser: { id: string; role: Role },
    @Param('id') userId: string,
  ) {
    return this.usersService.deactivate(currentUser.id, userId);
  }
}
