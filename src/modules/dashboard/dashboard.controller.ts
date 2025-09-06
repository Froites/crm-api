import {
  Controller,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { DashboardService } from './dashboard.service';
import { ApiResponse } from '../../common/types/api-response.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get dashboard metrics' })
  @SwaggerResponse({ status: 200, description: 'Dashboard metrics retrieved successfully' })
  async getMetrics(@Request() req: any): Promise<ApiResponse> {
    const metrics = await this.dashboardService.getMetrics(
      req.user.role,
      req.user.id,
    );
    return {
      success: true,
      data: metrics,
      message: 'Dashboard metrics retrieved successfully',
    };
  }

  @Get('agents-performance')
  @ApiOperation({ summary: 'Get agents performance data' })
  @SwaggerResponse({ status: 200, description: 'Agents performance retrieved successfully' })
  async getAgentsPerformance(@Request() req: any): Promise<ApiResponse> {
    const performance = await this.dashboardService.getAgentsPerformance(
      req.user.role,
      req.user.id,
    );
    return {
      success: true,
      data: performance,
      message: 'Agents performance retrieved successfully',
    };
  }

  @Get('recent-activity')
  @ApiOperation({ summary: 'Get recent activity' })
  @SwaggerResponse({ status: 200, description: 'Recent activity retrieved successfully' })
  async getRecentActivity(@Request() req: any): Promise<ApiResponse> {
    const activity = await this.dashboardService.getRecentActivity(
      req.user.role,
      req.user.id,
    );
    return {
      success: true,
      data: activity,
      message: 'Recent activity retrieved successfully',
    };
  }

  @Get('leads-by-status')
  @ApiOperation({ summary: 'Get leads distribution by status' })
  @SwaggerResponse({ status: 200, description: 'Leads by status retrieved successfully' })
  async getLeadsByStatus(@Request() req: any): Promise<ApiResponse> {
    const data = await this.dashboardService.getLeadsByStatus(
      req.user.role,
      req.user.id,
    );
    return {
      success: true,
      data,
      message: 'Leads by status retrieved successfully',
    };
  }

  @Get('leads-by-source')
  @ApiOperation({ summary: 'Get leads distribution by source' })
  @SwaggerResponse({ status: 200, description: 'Leads by source retrieved successfully' })
  async getLeadsBySource(@Request() req: any): Promise<ApiResponse> {
    const data = await this.dashboardService.getLeadsBySource(
      req.user.role,
      req.user.id,
    );
    return {
      success: true,
      data,
      message: 'Leads by source retrieved successfully',
    };
  }

  @Get('revenue-chart')
  @ApiOperation({ summary: 'Get revenue chart data (last 6 months)' })
  @SwaggerResponse({ status: 200, description: 'Revenue chart data retrieved successfully' })
  async getRevenueChart(@Request() req: any): Promise<ApiResponse> {
    const data = await this.dashboardService.getRevenueChart(
      req.user.role,
      req.user.id,
    );
    return {
      success: true,
      data,
      message: 'Revenue chart data retrieved successfully',
    };
  }
}