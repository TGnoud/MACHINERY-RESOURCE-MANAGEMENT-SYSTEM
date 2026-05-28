import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Machinery } from '../../machineries/schemas/machinery.schema';
import { User } from '../../users/schemas/user.schema';

@Schema({ _id: false })
export class SparePart {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: 1, min: 1 })
  quantity: number;

  @Prop({ default: 0, min: 0 })
  cost: number;
}

const SparePartSchema = SchemaFactory.createForClass(SparePart);

export enum MaintenanceType {
  Routine = 'ROUTINE',
  Emergency = 'EMERGENCY',
  Inspection = 'INSPECTION',
  Replacement = 'REPLACEMENT',
}

export enum MaintenancePriority {
  Low = 'LOW',
  Medium = 'MEDIUM',
  High = 'HIGH',
  Critical = 'CRITICAL',
}

export enum MaintenanceStatus {
  Pending = 'PENDING',
  InProgress = 'IN_PROGRESS',
  Completed = 'COMPLETED',
}

@Schema({ timestamps: true })
export class MaintenanceLog {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Machinery.name,
    required: true,
    index: true,
  })
  machinery: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  technician: Types.ObjectId;

  @Prop({ default: 0, min: 0 })
  cost: number;

  @Prop({
    enum: MaintenanceType,
    default: MaintenanceType.Routine,
    required: true,
  })
  type: MaintenanceType;

  @Prop({
    enum: MaintenancePriority,
    default: MaintenancePriority.Medium,
    required: true,
  })
  priority: MaintenancePriority;

  @Prop({
    enum: MaintenanceStatus,
    default: MaintenanceStatus.Pending,
    required: true,
  })
  status: MaintenanceStatus;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop()
  completedAt?: Date;

  @Prop({ type: [SparePartSchema], default: [] })
  spareParts: SparePart[];
}

export type MaintenanceLogDocument = HydratedDocument<MaintenanceLog>;
export const MaintenanceLogSchema =
  SchemaFactory.createForClass(MaintenanceLog);
