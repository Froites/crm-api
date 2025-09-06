import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { ApiResponse, PaginatedResponse, LeadFilters } from '../../common/types/api-response.type';

@ApiTags('Leads')
@Controller('leads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new lead' })
  @SwaggerResponse({ status: 201, description: 'Lead created successfully' })
  async create(
    @Body() createLeadDto: CreateLeadDto,
    @Request() req: any,
  ): Promise<ApiResponse> {
    const lead = await this.leadsService.create(createLeadDto, req.user.id);
    return {
      success: true,
      data: lead,
      message: 'Lead created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all leads with filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'source', required: false, type: String })
  @ApiQuery({ name: 'assignedAgent', required: false, type: String })
  @ApiQuery({ name: 'priority', required: false, type: String })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @SwaggerResponse({ status: 200, description: 'Leads retrieved successfully' })
  async findAll(
    @Query() filters: LeadFilters,
    @Request() req: any,
  ): Promise<PaginatedResponse> {
    const result = await this.leadsService.findAll(
      filters,
      req.user.role,
      req.user.id,
    );
    return {
      success: true,
      data: result.data,
      meta: result.meta,
      message: 'Leads retrieved successfully',
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get leads statistics' })
  @SwaggerResponse({ status: 200, description: 'Lead statistics retrieved successfully' })
  async getStats(@Request() req: any): Promise<ApiResponse> {
    const stats = await this.leadsService.getLeadStats(req.user.role, req.user.id);
    return {
      success: true,
      data: stats,
      message: 'Lead statistics retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lead by ID' })
  @SwaggerResponse({ status: 200, description: 'Lead retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'Lead not found' })
  @SwaggerResponse({ status: 403, description: 'Access denied' })
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ApiResponse> {
    const lead = await this.leadsService.findOne(id, req.user.role, req.user.id);
    return {
      success: true,
      data: lead,
      message: 'Lead retrieved successfully',
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update lead' })
  @SwaggerResponse({ status: 200, description: 'Lead updated successfully' })
  @SwaggerResponse({ status: 404, description: 'Lead not found' })
  @SwaggerResponse({ status: 403, description: 'Access denied' })
  async update(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
    @Request() req: any,
  ): Promise<ApiResponse> {
    const lead = await this.leadsService.update(
      id,
      updateLeadDto,
      req.user.role,
      req.user.id,
    );
    return {
      success: true,
      data: lead,
      message: 'Lead updated successfully',
    };
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update lead status' })
  @SwaggerResponse({ status: 200, description: 'Lead status updated successfully' })
  @SwaggerResponse({ status: 404, description: 'Lead not found' })
  @SwaggerResponse({ status: 403, description: 'Access denied' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateLeadStatusDto,
    @Request() req: any,
  ): Promise<ApiResponse> {
    const lead = await this.leadsService.updateStatus(
      id,
      updateStatusDto,
      req.user.role,
      req.user.id,
    );
    return {
      success: true,
      data: lead,
      message: 'Lead status updated successfully',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete/Archive lead' })
  @SwaggerResponse({ status: 200, description: 'Lead deleted/archived successfully' })
  @SwaggerResponse({ status: 404, description: 'Lead not found' })
  @SwaggerResponse({ status: 403, description: 'Access denied' })
  async remove(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ApiResponse> {
    const result = await this.leadsService.remove(id, req.user.role, req.user.id);
    return {
      success: true,
      message: result.message,
    };
  }
}
