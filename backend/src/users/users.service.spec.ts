import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: Role.EMPLOYEE,
    };

    it('should create a user with valid data', async () => {
      const hashedPassword = 'hashedPassword123';
      const createdUser = {
        id: '1',
        email: createUserDto.email,
        passwordHash: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: createUserDto.role,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: createUserDto.email,
          passwordHash: hashedPassword,
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          role: createUserDto.role,
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
      expect(result).toEqual(createdUser);
      expect(result.isActive).toBe(true);
    });

    it('should throw ConflictException when email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '1',
        email: createUserDto.email,
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('deactivate', () => {
    const adminId = 'admin-id';
    const userId = 'user-id';

    it('should deactivate an existing user', async () => {
      const existingUser = {
        id: userId,
        email: 'user@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: Role.EMPLOYEE,
        isActive: true,
      };

      const deactivatedUser = {
        ...existingUser,
        isActive: false,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue(deactivatedUser);

      const result = await service.deactivate(adminId, userId);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
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
      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.deactivate(adminId, userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when admin tries to deactivate themselves', async () => {
      const sameId = 'admin-id';

      await expect(service.deactivate(sameId, sameId)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrismaService.user.findUnique).not.toHaveBeenCalled();
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    const mockUsers = [
      {
        id: '1',
        email: 'user1@example.com',
        firstName: 'User',
        lastName: 'One',
        role: Role.EMPLOYEE,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        email: 'user2@example.com',
        firstName: 'User',
        lastName: 'Two',
        role: Role.HR,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should list users with pagination', async () => {
      const filters = { page: 1, limit: 10 };
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(2);

      const result = await service.findAll(filters);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
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
      expect(mockPrismaService.user.count).toHaveBeenCalledWith({ where: {} });
      expect(result.data).toEqual(mockUsers);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it('should list users filtered by role', async () => {
      const filters = { role: Role.HR, page: 1, limit: 10 };
      const hrUsers = [mockUsers[1]];
      mockPrismaService.user.findMany.mockResolvedValue(hrUsers);
      mockPrismaService.user.count.mockResolvedValue(1);

      const result = await service.findAll(filters);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: { role: Role.HR },
        skip: 0,
        take: 10,
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
      expect(result.data).toEqual(hrUsers);
    });

    it('should list users filtered by isActive', async () => {
      const filters = { isActive: false, page: 1, limit: 10 };
      const inactiveUser = { ...mockUsers[0], isActive: false };
      mockPrismaService.user.findMany.mockResolvedValue([inactiveUser]);
      mockPrismaService.user.count.mockResolvedValue(1);

      const result = await service.findAll(filters);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: { isActive: false },
        skip: 0,
        take: 10,
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
      expect(result.data[0].isActive).toBe(false);
    });
  });

  describe('update', () => {
    const currentUser = { id: 'user-id', role: Role.EMPLOYEE };
    const targetUser = {
      id: 'user-id',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: Role.EMPLOYEE,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should allow self-update of allowed fields', async () => {
      const updateDto = { firstName: 'Jane' };
      const updatedUser = { ...targetUser, firstName: 'Jane' };

      mockPrismaService.user.findUnique.mockResolvedValue(targetUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(currentUser, currentUser.id, updateDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: currentUser.id },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: currentUser.id },
        data: { firstName: 'Jane' },
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
      expect(result.firstName).toBe('Jane');
    });

    it('should throw ForbiddenException when self-update includes role', async () => {
      const updateDto = { firstName: 'Jane', role: Role.ADMIN };

      mockPrismaService.user.findUnique.mockResolvedValue(targetUser);

      await expect(
        service.update(currentUser, currentUser.id, updateDto),
      ).rejects.toThrow('Non-admin users cannot change role');
    });

    it('should allow admin to update any user including role', async () => {
      const admin = { id: 'admin-id', role: Role.ADMIN };
      const updateDto = { firstName: 'Jane', role: Role.HR };
      const updatedUser = { ...targetUser, firstName: 'Jane', role: Role.HR };

      mockPrismaService.user.findUnique.mockResolvedValue(targetUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(admin, targetUser.id, updateDto);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: targetUser.id },
        data: { firstName: 'Jane', role: Role.HR },
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
      expect(result.role).toBe(Role.HR);
    });

    it('should throw NotFoundException when updating non-existent user', async () => {
      const admin = { id: 'admin-id', role: Role.ADMIN };
      const updateDto = { firstName: 'Jane' };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.update(admin, 'non-existent-id', updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when non-admin tries to update other user', async () => {
      const otherUserId = 'other-user-id';
      const updateDto = { firstName: 'Jane' };

      await expect(
        service.update(currentUser, otherUserId, updateDto),
      ).rejects.toThrow('You can only update your own profile');
    });
  });
});
