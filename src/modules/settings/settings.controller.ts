import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { SettingsService } from './settings.service';
import { ApiResponse } from '../../common/types/api-response.type';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('user')
  @ApiOperation({ summary: 'Get user settings' })
  @SwaggerResponse({ status: 200, description: 'User settings retrieved successfully' })
  async getUserSettings(@Request() req: any): Promise<ApiResponse> {
    const settings = await this.settingsService.getUserSettings(req.user.id);
    return {
      success: true,
      data: settings,
      message: 'User settings retrieved successfully',
    };
  }

  @Put('user')
  @ApiOperation({ summary: 'Update user settings' })
  @SwaggerResponse({ status: 200, description: 'User settings updated successfully' })
  async updateUserSettings(
    @Request() req: any,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ): Promise<ApiResponse> {
    const settings = await this.settingsService.updateUserSettings(
      req.user.id,
      updateSettingsDto,
    );
    return {
      success: true,
      data: settings,
      message: 'User settings updated successfully',
    };
  }

  @Get('defaults')
  @ApiOperation({ summary: 'Get system default settings' })
  @SwaggerResponse({ status: 200, description: 'Default settings retrieved successfully' })
  async getSystemDefaults(): Promise<ApiResponse> {
    const defaults = await this.settingsService.getSystemDefaults();
    return {
      success: true,
      data: defaults,
      message: 'Default settings retrieved successfully',
    };
  }
}