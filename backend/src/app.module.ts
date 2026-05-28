import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Assignment,
  AssignmentSchema,
} from './assignments/schemas/assignment.schema';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { Category, CategorySchema } from './categories/schemas/category.schema';
import { DashboardModule } from './dashboard/dashboard.module';
import { MachineriesModule } from './machineries/machineries.module';
import {
  Machinery,
  MachinerySchema,
} from './machineries/schemas/machinery.schema';
import {
  MaintenanceLog,
  MaintenanceLogSchema,
} from './maintenance/schemas/maintenance-log.schema';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');

        if (!uri) {
          throw new Error('Missing required environment variable MONGODB_URI');
        }

        return {
          uri,
        };
      },
    }),
    MongooseModule.forFeature([
      { name: Assignment.name, schema: AssignmentSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Machinery.name, schema: MachinerySchema },
      { name: MaintenanceLog.name, schema: MaintenanceLogSchema },
    ]),
    AuthModule,
    DashboardModule,
    MachineriesModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
