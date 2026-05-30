import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { createHmac, randomBytes } from 'crypto';
import { Model } from 'mongoose';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  User,
  UserDocument,
  UserRole,
  UserStatus,
} from '../users/schemas/user.schema';
import {
  AccessTokenPayload,
  AuthResponse,
  PublicUser,
  RefreshTokenPayload,
} from './types';

const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 15 * 60;
const REFRESH_TOKEN_EXPIRES_IN = '7d';
const PASSWORD_RESET_EXPIRES_IN_MS = 15 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const email = this.normalizeEmail(registerDto.email);
    const existingUser = await this.userModel.exists({ email }).exec();

    if (existingUser) {
      throw new ConflictException('Email already exists.');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 12);
    const user = await this.userModel.create({
      fullName: registerDto.fullName.trim(),
      email,
      passwordHash,
      role: registerDto.role || UserRole.Dispatcher,
      status: UserStatus.Active,
    });

    return this.issueAuthResponse(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const email = this.normalizeEmail(loginDto.email);
    const user = await this.userModel
      .findOne({ email })
      .select('+passwordHash')
      .exec();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (user.status !== UserStatus.Active) {
      throw new UnauthorizedException('Account is disabled.');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    user.lastLoginAt = new Date();

    return this.issueAuthResponse(user);
  }

  async refresh(refreshTokenDto: RefreshTokenDto) {
    const payload = await this.verifyRefreshToken(refreshTokenDto.refreshToken);
    const user = await this.userModel
      .findById(payload.sub)
      .select('+refreshTokenHash')
      .exec();

    if (!user || user.status !== UserStatus.Active || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const isTokenValid = await bcrypt.compare(
      refreshTokenDto.refreshToken,
      user.refreshTokenHash,
    );

    if (!isTokenValid) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    return {
      accessToken: await this.signAccessToken(user),
      expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    };
  }

  async logout(userId: string) {
    await this.userModel
      .findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } })
      .exec();

    return { message: 'Logged out successfully.' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const email = this.normalizeEmail(forgotPasswordDto.email);
    const user = await this.userModel.findOne({ email }).exec();
    const resetToken = this.createOpaqueToken();
    const resetUrl = this.buildResetUrl(resetToken);

    if (user && user.status === UserStatus.Active) {
      user.resetPasswordTokenHash = this.hashResetToken(resetToken);
      user.resetPasswordExpiresAt = new Date(
        Date.now() + PASSWORD_RESET_EXPIRES_IN_MS,
      );
      await user.save();
    }

    return {
      message: 'Reset password link generated.',
      resetUrl,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const tokenHash = this.hashResetToken(resetPasswordDto.token);
    const user = await this.userModel
      .findOne({
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpiresAt: { $gt: new Date() },
      })
      .select('+resetPasswordTokenHash')
      .exec();

    if (!user || user.status !== UserStatus.Active) {
      throw new UnauthorizedException('Invalid or expired reset token.');
    }

    user.passwordHash = await bcrypt.hash(resetPasswordDto.password, 12);
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpiresAt = undefined;
    user.refreshTokenHash = undefined;
    await user.save();

    return { message: 'Password has been reset successfully.' };
  }

  toPublicUser(user: UserDocument): PublicUser {
    return {
      id: String(user._id),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      avatarUrl: user.avatarUrl,
    };
  }

  private async issueAuthResponse(user: UserDocument): Promise<AuthResponse> {
    const refreshToken = await this.signRefreshToken(user);
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    await user.save();

    return {
      user: this.toPublicUser(user),
      tokens: {
        accessToken: await this.signAccessToken(user),
        refreshToken,
        expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      },
    };
  }

  private signAccessToken(user: UserDocument) {
    const payload: AccessTokenPayload = {
      sub: String(user._id),
      email: user.email,
      role: user.role,
      type: 'access',
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      secret: this.getRequiredSecret('JWT_ACCESS_SECRET'),
    });
  }

  private signRefreshToken(user: UserDocument) {
    const payload: RefreshTokenPayload = {
      sub: String(user._id),
      email: user.email,
      role: user.role,
      type: 'refresh',
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      secret: this.getRequiredSecret('JWT_REFRESH_SECRET'),
    });
  }

  private async verifyRefreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        token,
        {
          secret: this.getRequiredSecret('JWT_REFRESH_SECRET'),
        },
      );

      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type.');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token.');
    }
  }

  private hashResetToken(token: string) {
    return createHmac('sha256', this.getRequiredSecret('PASSWORD_RESET_SECRET'))
      .update(token)
      .digest('hex');
  }

  private buildResetUrl(token: string) {
    const clientOrigin =
      this.configService.get<string>('CLIENT_ORIGIN')?.split(',')[0]?.trim() ||
      'http://localhost:3000';
    const baseUrl = clientOrigin.replace(/\/$/, '');

    return `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
  }

  private createOpaqueToken() {
    return randomBytes(32).toString('hex');
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private getRequiredSecret(key: string) {
    const value = this.configService.get<string>(key);

    if (!value && process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variable ${key}`);
    }

    return value ?? `dev-${key.toLowerCase()}`;
  }
}
