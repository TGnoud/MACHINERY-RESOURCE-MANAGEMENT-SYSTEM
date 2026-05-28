import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserRole, UserStatus } from '../users/schemas/user.schema';

function execResult<T>(value: T) {
  return {
    exec: jest.fn().mockResolvedValue(value),
  };
}

function selectableExecResult<T>(value: T) {
  return {
    select: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(value),
  };
}

function createUserDoc(overrides: Record<string, unknown> = {}) {
  return {
    _id: 'user-1',
    fullName: 'Nguyen Van A',
    email: 'user@gnoudcrm.vn',
    role: UserRole.Dispatcher,
    status: UserStatus.Active,
    passwordHash: '',
    refreshTokenHash: '',
    resetPasswordTokenHash: undefined,
    resetPasswordExpiresAt: undefined,
    lastLoginAt: undefined,
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let userModel: {
    exists: jest.Mock;
    create: jest.Mock;
    findOne: jest.Mock;
    findById: jest.Mock;
    findByIdAndUpdate: jest.Mock;
  };

  beforeEach(() => {
    userModel = {
      exists: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };

    const jwtService = {
      signAsync: jest
        .fn()
        .mockImplementation((payload: { type: string }) =>
          Promise.resolve(`${payload.type}-token`),
        ),
      verifyAsync: jest.fn().mockResolvedValue({
        sub: 'user-1',
        email: 'user@gnoudcrm.vn',
        role: UserRole.Dispatcher,
        type: 'refresh',
      }),
    } as unknown as JwtService;

    const configService = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          JWT_ACCESS_SECRET: 'access-secret',
          JWT_REFRESH_SECRET: 'refresh-secret',
          PASSWORD_RESET_SECRET: 'reset-secret',
          CLIENT_ORIGIN: 'https://frontend.test',
        };

        return values[key];
      }),
    } as unknown as ConfigService;

    service = new AuthService(userModel as never, jwtService, configService);
  });

  it('registers active dispatcher users', async () => {
    const user = createUserDoc();
    userModel.exists.mockReturnValue(execResult(null));
    userModel.create.mockResolvedValue(user);

    const result = await service.register({
      fullName: ' Nguyen Van A ',
      email: 'USER@GNOUDCRM.VN',
      password: 'password123',
    });

    expect(userModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: 'Nguyen Van A',
        email: 'user@gnoudcrm.vn',
        role: UserRole.Dispatcher,
        status: UserStatus.Active,
      }),
    );
    expect(result.user.role).toBe(UserRole.Dispatcher);
    expect(result.tokens.accessToken).toBe('access-token');
    expect(result.tokens.refreshToken).toBe('refresh-token');
  });

  it('rejects duplicate registration email', async () => {
    userModel.exists.mockReturnValue(execResult({ _id: 'existing' }));

    await expect(
      service.register({
        fullName: 'Nguyen Van A',
        email: 'user@gnoudcrm.vn',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('logs in active users', async () => {
    const passwordHash = await bcrypt.hash('password123', 4);
    const user = createUserDoc({ passwordHash });
    userModel.findOne.mockReturnValue(selectableExecResult(user));

    const result = await service.login({
      email: 'user@gnoudcrm.vn',
      password: 'password123',
    });

    expect(result.user.email).toBe('user@gnoudcrm.vn');
    expect(user.lastLoginAt).toBeInstanceOf(Date);
  });

  it('rejects invalid login password', async () => {
    const passwordHash = await bcrypt.hash('password123', 4);
    const user = createUserDoc({ passwordHash });
    userModel.findOne.mockReturnValue(selectableExecResult(user));

    await expect(
      service.login({
        email: 'user@gnoudcrm.vn',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects disabled users', async () => {
    const user = createUserDoc({ status: UserStatus.Disabled });
    userModel.findOne.mockReturnValue(selectableExecResult(user));

    await expect(
      service.login({
        email: 'user@gnoudcrm.vn',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refreshes a valid refresh token', async () => {
    const refreshTokenHash = await bcrypt.hash('refresh-token', 4);
    const user = createUserDoc({ refreshTokenHash });
    userModel.findById.mockReturnValue(selectableExecResult(user));

    const result = await service.refresh({ refreshToken: 'refresh-token' });

    expect(result).toEqual({
      accessToken: 'access-token',
      expiresIn: 900,
    });
  });

  it('generates and consumes reset password tokens', async () => {
    const user = createUserDoc();
    userModel.findOne.mockImplementation((query: Record<string, unknown>) => {
      if ('email' in query || 'resetPasswordTokenHash' in query) {
        return selectableExecResult(user);
      }

      return selectableExecResult(null);
    });

    const forgotResult = await service.forgotPassword({
      email: 'user@gnoudcrm.vn',
    });
    const token = new URL(forgotResult.resetUrl).searchParams.get('token');

    expect(token).toBeTruthy();
    expect(user.resetPasswordTokenHash).toBeTruthy();

    await expect(
      service.resetPassword({
        token: token ?? '',
        password: 'new-password123',
      }),
    ).resolves.toEqual({
      message: 'Password has been reset successfully.',
    });
    expect(user.resetPasswordTokenHash).toBeUndefined();
    expect(user.refreshTokenHash).toBeUndefined();
  });
});
