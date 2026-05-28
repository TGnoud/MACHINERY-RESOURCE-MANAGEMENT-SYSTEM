import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Category } from '../../categories/schemas/category.schema';

export enum MachineryStatus {
  Available = 'AVAILABLE',
  Rented = 'RENTED',
  Maintenance = 'MAINTENANCE',
}

@Schema({ timestamps: true })
export class Machinery {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, index: true, trim: true })
  serialNumber: string;

  @Prop({ trim: true })
  manufacturer?: string;

  @Prop({ default: 0, min: 0 })
  operatingHours: number;

  @Prop({ default: 0, min: 0 })
  fuelConsumption: number;

  @Prop()
  purchaseYear?: number;

  @Prop({
    enum: MachineryStatus,
    default: MachineryStatus.Available,
    required: true,
  })
  status: MachineryStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Category.name })
  category?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  specs: Record<string, unknown>;

  @Prop({ trim: true })
  location?: string;

  @Prop({ trim: true })
  imageUrl?: string;
}

export type MachineryDocument = HydratedDocument<Machinery>;
export const MachinerySchema = SchemaFactory.createForClass(Machinery);
