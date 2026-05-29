import { IsNotEmpty, IsString, IsMongoId, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { AssignmentStatus } from '../schemas/assignment.schema';

export class CreateAssignmentDto {
  @IsMongoId()
  @IsNotEmpty()
  machinery: string;

  @IsMongoId()
  @IsNotEmpty()
  dispatcher: string;

  @IsString()
  @IsNotEmpty()
  destination: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsEnum(AssignmentStatus)
  @IsOptional()
  status?: AssignmentStatus;
}
