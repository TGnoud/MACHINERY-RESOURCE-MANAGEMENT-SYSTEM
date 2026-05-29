import {
  IsArray,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  MaintenancePriority,
  MaintenanceStatus,
  MaintenanceType,
} from '../schemas/maintenance-log.schema';

export class SparePartDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cost?: number;
}

export class CreateMaintenanceLogDto {
  @IsMongoId()
  @IsNotEmpty()
  machinery: string;

  @IsMongoId()
  @IsOptional()
  technician?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cost?: number;

  @IsEnum(MaintenanceType)
  @IsOptional()
  type?: MaintenanceType;

  @IsEnum(MaintenancePriority)
  @IsOptional()
  priority?: MaintenancePriority;

  @IsEnum(MaintenanceStatus)
  @IsOptional()
  status?: MaintenanceStatus;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsOptional()
  completedAt?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SparePartDto)
  @IsOptional()
  spareParts?: SparePartDto[];
}
