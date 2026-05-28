import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Category, CategorySchema } from '../categories/schemas/category.schema';
import { Machinery, MachinerySchema } from './schemas/machinery.schema';
import { MachineriesController } from './machineries.controller';
import { MachineriesService } from './machineries.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Machinery.name, schema: MachinerySchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [MachineriesController],
  providers: [MachineriesService],
  exports: [MachineriesService],
})
export class MachineriesModule {}
