import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { LeadStatus, LeadSource, Priority } from '@prisma/client';

export class UpdateLeadDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Lead full name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    example: 'joao@empresa.com',
    description: 'Lead email address',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: '+55 11 99999-9999',
    description: 'Lead phone number',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: 'Empresa ABC Ltda',
    description: 'Lead company name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  company?: string;

  @ApiProperty({
    example: 'CEO',
    description: 'Lead position/role',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @ApiProperty({
    example: 'CONTACTED',
    description: 'Lead status',
    enum: LeadStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiProperty({
    example: 'SOCIAL_MEDIA',
    description: 'Lead source',
    enum: LeadSource,
    required: false,
  })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @ApiProperty({
    example: 75000.00,
    description: 'Potential deal value',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @ApiProperty({
    example: 'HIGH',
    description: 'Lead priority',
    enum: Priority,
    required: false,
  })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiProperty({
    example: 'Atualização: Cliente demonstrou interesse em upgrade',
    description: 'Lead description',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    example: 'Reunião agendada para próxima semana',
    description: 'Internal notes about the lead',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    example: ['vip', 'enterprise', 'hot-lead'],
    description: 'Lead tags',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    example: '2024-03-20T14:00:00Z',
    description: 'Next contact date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  nextContact?: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'Assigned agent ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  assignedAgentId?: string;
}
