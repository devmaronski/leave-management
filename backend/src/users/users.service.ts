import { Injectable, ConflictException, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Check email uniqueness
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    // Create user with role defaulting to EMPLOYEE
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        passwordHash,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: createUserDto.role || Role.EMPLOYEE,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async deactivate(adminId: string, userId: string) {
    // Prevent self-deactivation (R9)
    if (adminId === userId) {
      throw new BadRequestException('Admin cannot deactivate themselves');
    }

    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Set isActive = false
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async findAll(filters: UserFilterDto) {
    const { role, isActive, page = 1, limit = 10 } = filters;

    // Build where clause
    const where: any = {};
    if (role !== undefined) {
      where.role = role;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const take = limit;

    // Fetch users and count
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(
    currentUser: { id: string; role: Role },
    targetId: string,
    updateDto: UpdateUserDto,
  ) {
    // Verify target user exists
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetId },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Authorization check
    const isAdmin = currentUser.role === Role.ADMIN;
    const isSelf = currentUser.id === targetId;

    if (!isAdmin && !isSelf) {
      throw new ForbiddenException('You can only update your own profile');
    }

    // Filter allowed fields based on role
    const allowedData: any = {};

    if (updateDto.firstName !== undefined) {
      allowedData.firstName = updateDto.firstName;
    }
    if (updateDto.lastName !== undefined) {
      allowedData.lastName = updateDto.lastName;
    }

    // Only admin can update role
    if (updateDto.role !== undefined) {
      if (!isAdmin) {
        throw new ForbiddenException('Non-admin users cannot change role');
      }
      allowedData.role = updateDto.role;
    }

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id: targetId },
      data: allowedData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }
}
