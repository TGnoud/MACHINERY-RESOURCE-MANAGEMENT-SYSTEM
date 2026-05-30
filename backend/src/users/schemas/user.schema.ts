import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum UserRole {
  Admin = 'ADMIN',
  Technician = 'TECHNICIAN',
  Dispatcher = 'DISPATCHER',
}

export enum UserStatus {
  Active = 'ACTIVE',
  Disabled = 'DISABLED',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({
    enum: UserRole,
    default: UserRole.Dispatcher,
    required: true,
  })
  role: UserRole;

  @Prop({
    enum: UserStatus,
    default: UserStatus.Active,
    required: true,
  })
  status: UserStatus;

  @Prop({ select: false })
  refreshTokenHash?: string;

  @Prop({ trim: true })
  avatarUrl?: string;

  @Prop({ select: false })
  resetPasswordTokenHash?: string;

  @Prop()
  resetPasswordExpiresAt?: Date;

  @Prop()
  lastLoginAt?: Date;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
