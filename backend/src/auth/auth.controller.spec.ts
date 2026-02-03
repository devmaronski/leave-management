import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Role } from '@prisma/client';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashed',
    firstName: 'Test',
    lastName: 'User',
    role: Role.EMPLOYEE,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('POST /auth/login', () => {
    it('should return token on valid credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };
      const loginResponse = {
        accessToken: 'jwt-token',
        user: { 
          id: 'user-1', 
          email: 'test@example.com', 
          firstName: 'Test',
          lastName: 'User',
          role: Role.EMPLOYEE,
        },
      };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);
      jest.spyOn(authService, 'login').mockResolvedValue(loginResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(loginResponse);
      expect(authService.validateUser).toHaveBeenCalledWith('test@example.com', 'password');
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrong' };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user', () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        role: Role.EMPLOYEE,
        firstName: 'Test',
        lastName: 'User',
      };

      const result = controller.getMe(user);

      expect(result).toEqual(user);
    });
  });
});
