import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtAuthGuard)
@Controller('v1/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('cost-history')
  getCostHistory() {
    return this.dashboardService.getCostHistory();
  }

  @Get('recent-maintenance')
  getRecentMaintenance() {
    return this.dashboardService.getRecentMaintenance();
  }

  @Get('recent-activities')
  getRecentActivities() {
    return this.dashboardService.getRecentActivities();
  }
}
