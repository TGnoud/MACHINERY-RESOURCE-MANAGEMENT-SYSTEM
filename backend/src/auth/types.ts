import { Request } from 'express';
import { UserRole, UserStatus } from '../users/schemas/user.schema';

export type PublicUser = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};

export type AuthenticatedUser = PublicUser;

export type RequestWithUser = Request & {
  user?: AuthenticatedUser;
};

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
  type: 'access';
};

export type RefreshTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
  type: 'refresh';
};

export type AuthResponse = {
  user: PublicUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
};
