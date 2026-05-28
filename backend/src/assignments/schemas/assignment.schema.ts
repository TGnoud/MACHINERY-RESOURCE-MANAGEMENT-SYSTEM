import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Machinery } from '../../machineries/schemas/machinery.schema';
import { User } from '../../users/schemas/user.schema';

export enum AssignmentStatus {
  Pending = 'PENDING',
  InTransit = 'IN_TRANSIT',
  Active = 'ACTIVE',
  Completed = 'COMPLETED',
}

@Schema({ timestamps: true })
export class Assignment {
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
  dispatcher: Types.ObjectId;

  @Prop({ required: true, trim: true })
  destination: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop()
  endDate?: Date;

  @Prop({
    enum: AssignmentStatus,
    default: AssignmentStatus.Pending,
    required: true,
  })
  status: AssignmentStatus;
}

export type AssignmentDocument = HydratedDocument<Assignment>;
export const AssignmentSchema = SchemaFactory.createForClass(Assignment);
