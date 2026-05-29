import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types';
import { UserRole } from '../users/schemas/user.schema';
import { CreateMaintenanceLogDto } from './dto/create-maintenance-log.dto';
import { QueryMaintenanceLogDto } from './dto/query-maintenance-log.dto';
import { UpdateMaintenanceLogDto } from './dto/update-maintenance-log.dto';
import { MaintenanceService } from './maintenance.service';

@Controller('v1/maintenance')
@UseGuards(JwtAuthGuard)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  findAll(@Query() query: QueryMaintenanceLogDto) {
    return this.maintenanceService.findAll(query);
  }

  @Get('stats')
  getStats() {
    return this.maintenanceService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.maintenanceService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin, UserRole.Technician)
  create(
    @Body() dto: CreateMaintenanceLogDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.maintenanceService.create(dto, user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin, UserRole.Technician)
  update(@Param('id') id: string, @Body() dto: UpdateMaintenanceLogDto) {
    return this.maintenanceService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin, UserRole.Technician)
  remove(@Param('id') id: string) {
    return this.maintenanceService.remove(id);
  }
}
