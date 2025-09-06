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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { ApiResponse, PaginatedResponse } from '../../common/types/api-response.type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users/Agents')
@Controller('agents')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Create new agent' })
  @SwaggerResponse({ status: 201, description: 'Agent created successfully' })
  @SwaggerResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createUserDto: CreateUserDto): Promise<ApiResponse> {
    const user = await this.usersService.create(createUserDto);
    return {
      success: true,
      data: user,
      message: 'Agent created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all agents' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @SwaggerResponse({ status: 200, description: 'Agents retrieved successfully' })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ): Promise<PaginatedResponse> {
    const result = await this.usersService.findAll(+page, +limit, search);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
      message: 'Agents retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get agent by ID' })
  @SwaggerResponse({ status: 200, description: 'Agent retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'Agent not found' })
  async findOne(@Param('id') id: string): Promise<ApiResponse> {
    const user = await this.usersService.findById(id);
    const { password: _, ...userWithoutPassword } = user;
    return {
      success: true,
      data: userWithoutPassword,
      message: 'Agent retrieved successfully',
    };
  }

  @Get(':id/performance')
  @ApiOperation({ summary: 'Get agent performance metrics' })
  @SwaggerResponse({ status: 200, description: 'Performance metrics retrieved successfully' })
  @SwaggerResponse({ status: 404, description: 'Agent not found' })
  async getPerformance(@Param('id') id: string): Promise<ApiResponse> {
    const performance = await this.usersService.getAgentPerformance(id);
    return {
      success: true,
      data: performance,
      message: 'Performance metrics retrieved successfully',
    };
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Update agent' })
  @SwaggerResponse({ status: 200, description: 'Agent updated successfully' })
  @SwaggerResponse({ status: 404, description: 'Agent not found' })
  @SwaggerResponse({ status: 403, description: 'Forbidden' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse> {
    const user = await this.usersService.update(id, updateUserDto);
    return {
      success: true,
      data: user,
      message: 'Agent updated successfully',
    };
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Deactivate agent' })
  @SwaggerResponse({ status: 200, description: 'Agent deactivated successfully' })
  @SwaggerResponse({ status: 404, description: 'Agent not found' })
  @SwaggerResponse({ status: 403, description: 'Forbidden' })
  async remove(@Param('id') id: string): Promise<ApiResponse> {
    const result = await this.usersService.remove(id);
    return {
      success: true,
      message: result.message,
    };
  }
}