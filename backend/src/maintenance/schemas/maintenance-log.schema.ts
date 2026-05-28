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
