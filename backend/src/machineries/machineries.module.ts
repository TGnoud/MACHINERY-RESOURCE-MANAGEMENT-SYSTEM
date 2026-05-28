import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Category, CategorySchema } from '../categories/schemas/category.schema';
import { Machinery, MachinerySchema } from './schemas/machinery.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Assignment, AssignmentSchema } from '../assignments/schemas/assignment.schema';
import { MaintenanceLog, MaintenanceLogSchema } from '../maintenance/schemas/maintenance-log.schema';
import { MachineriesController } from './machineries.controller';
import { MachineriesService } from './machineries.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Machinery.name, schema: MachinerySchema },
      { name: Category.name, schema: CategorySchema },
      { name: User.name, schema: UserSchema },
      { name: Assignment.name, schema: AssignmentSchema },
      { name: MaintenanceLog.name, schema: MaintenanceLogSchema },
    ]),
  ],
  controllers: [MachineriesController],
  providers: [MachineriesService],
  exports: [MachineriesService],
})
export class MachineriesModule {}
