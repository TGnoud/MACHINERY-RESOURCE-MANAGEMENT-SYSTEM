import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../users/schemas/user.schema';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsEnum([UserRole.Dispatcher, UserRole.Technician], {
    message: 'Chỉ được phép đăng ký vai trò DISPATCHER hoặc TECHNICIAN.',
  })
  role?: UserRole;
}
