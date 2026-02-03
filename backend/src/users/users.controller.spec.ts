import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Role } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    deactivate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with correct DTO', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: Role.EMPLOYEE,
      };

      const expectedResult = {
        id: '1',
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: createUserDto.role,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with filters', async () => {
      const filters: UserFilterDto = {
        role: Role.HR,
        isActive: true,
        page: 1,
        limit: 10,
      };

      const expectedResult = {
        data: [
          {
            id: '1',
            email: 'hr@example.com',
            firstName: 'HR',
            lastName: 'User',
            role: Role.HR,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      mockUsersService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(filters);

      expect(service.findAll).toHaveBeenCalledWith(filters);
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should pass currentUser and targetId to service.update', async () => {
      const currentUser = { id: 'user-id', role: Role.EMPLOYEE };
      const targetId = 'user-id';
      const updateDto: UpdateUserDto = {
        firstName: 'Jane',
      };

      const expectedResult = {
        id: targetId,
        email: 'user@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        role: Role.EMPLOYEE,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(currentUser, targetId, updateDto);

      expect(service.update).toHaveBeenCalledWith(
        currentUser,
        targetId,
        updateDto,
      );
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should allow admin to update other users', async () => {
      const admin = { id: 'admin-id', role: Role.ADMIN };
      const targetId = 'user-id';
      const updateDto: UpdateUserDto = {
        firstName: 'Jane',
        role: Role.HR,
      };

      const expectedResult = {
        id: targetId,
        email: 'user@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        role: Role.HR,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(admin, targetId, updateDto);

      expect(service.update).toHaveBeenCalledWith(admin, targetId, updateDto);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('deactivate', () => {
    it('should pass admin ID and user ID to service.deactivate', async () => {
      const admin = { id: 'admin-id', role: Role.ADMIN };
      const userId = 'user-id';

      const expectedResult = {
        id: userId,
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: Role.EMPLOYEE,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.deactivate.mockResolvedValue(expectedResult);

      const result = await controller.deactivate(admin, userId);

      expect(service.deactivate).toHaveBeenCalledWith(admin.id, userId);
      expect(service.deactivate).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
      expect(result.isActive).toBe(false);
    });
  });
});
