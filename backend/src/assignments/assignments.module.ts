import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Assignment, AssignmentSchema } from './schemas/assignment.schema';
import { Machinery, MachinerySchema } from '../machineries/schemas/machinery.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import {
  MaintenanceLog,
  MaintenanceLogSchema,
} from '../maintenance/schemas/maintenance-log.schema';
import { AssignmentsService } from './assignments.service';
import { AssignmentsController } from './assignments.controller';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Assignment.name, schema: AssignmentSchema },
      { name: Machinery.name, schema: MachinerySchema },
      { name: User.name, schema: UserSchema },
      { name: MaintenanceLog.name, schema: MaintenanceLogSchema },
    ]),
  ],
  providers: [AssignmentsService],
  controllers: [AssignmentsController],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
