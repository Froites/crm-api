import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { ApiResponse } from '../../common/types/api-response.type';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @SwaggerResponse({
    status: 201,
    description: 'User registered successfully',
  })
  @SwaggerResponse({
    status: 400,
    description: 'Invalid input or user already exists',
  })
  async register(@Body() registerDto: RegisterDto): Promise<ApiResponse> {
    const result = await this.authService.register(registerDto);
    return {
      success: true,
      data: result,
      message: 'User registered successfully',
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'User login' })
  @SwaggerResponse({
    status: 200,
    description: 'Login successful',
  })
  @SwaggerResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(
    @Request() req: any,
    @Body() loginDto: LoginDto,
  ): Promise<ApiResponse> {
    const result = await this.authService.login(req.user);
    return {
      success: true,
      data: result,
      message: 'Login successful',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @SwaggerResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @SwaggerResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getProfile(@Request() req: any): Promise<ApiResponse> {
    return {
      success: true,
      data: req.user,
      message: 'User profile retrieved successfully',
    };
  }
}