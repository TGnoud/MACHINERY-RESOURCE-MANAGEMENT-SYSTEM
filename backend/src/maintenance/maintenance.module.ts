import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import {
  Machinery,
  MachinerySchema,
} from '../machineries/schemas/machinery.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import {
  Assignment,
  AssignmentSchema,
} from '../assignments/schemas/assignment.schema';
import {
  MaintenanceLog,
  MaintenanceLogSchema,
} from './schemas/maintenance-log.schema';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: MaintenanceLog.name, schema: MaintenanceLogSchema },
      { name: Machinery.name, schema: MachinerySchema },
      { name: User.name, schema: UserSchema },
      { name: Assignment.name, schema: AssignmentSchema },
    ]),
  ],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
