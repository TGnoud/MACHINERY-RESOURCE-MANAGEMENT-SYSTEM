import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  User,
  UserDocument,
  UserStatus,
} from '../../users/schemas/user.schema';
import { AccessTokenPayload, RequestWithUser } from '../types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing access token.');
    }

    const payload = await this.verifyAccessToken(token);
    const user = await this.userModel.findById(payload.sub).lean().exec();

    if (!user || user.status !== UserStatus.Active) {
      throw new UnauthorizedException('User is not active.');
    }

    request.user = {
      id: String(user._id),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    return true;
  }

  private extractToken(request: RequestWithUser) {
    const authorization = request.headers.authorization;

    if (!authorization) {
      return undefined;
    }

    const [type, token] = authorization.split(' ');

    return type === 'Bearer' ? token : undefined;
  }

  private async verifyAccessToken(token: string) {
    try {
      return await this.jwtService.verifyAsync<AccessTokenPayload>(token, {
        secret: this.getRequiredSecret('JWT_ACCESS_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired access token.');
    }
  }

  private getRequiredSecret(key: string) {
    const value = this.configService.get<string>(key);

    if (!value && process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variable ${key}`);
    }

    return value ?? `dev-${key.toLowerCase()}`;
  }
}
