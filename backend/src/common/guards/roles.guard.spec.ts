import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { Role } from '@prisma/client';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should allow access when no roles are required', () => {
    (reflector.getAllAndOverride as jest.Mock).mockImplementation(() => undefined);

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: Role.EMPLOYEE } }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user has required role', () => {
    (reflector.getAllAndOverride as jest.Mock).mockImplementation(() => [Role.ADMIN]);

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: Role.ADMIN } }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access when user lacks required role', () => {
    (reflector.getAllAndOverride as jest.Mock).mockImplementation(() => [Role.ADMIN]);

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: Role.EMPLOYEE } }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow access when user has one of multiple required roles', () => {
    (reflector.getAllAndOverride as jest.Mock).mockImplementation(() => [Role.HR, Role.ADMIN]);

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: Role.HR } }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });
});
