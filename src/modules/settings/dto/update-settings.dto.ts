import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsObject,
  IsEnum,
} from 'class-validator';

export class UpdateSettingsDto {
  @ApiProperty({
    example: 'America/Sao_Paulo',
    description: 'User timezone',
    required: false,
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({
    example: 'pt-BR',
    description: 'User language preference',
    enum: ['pt-BR', 'en-US', 'es-ES'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['pt-BR', 'en-US', 'es-ES'])
  language?: string;

  @ApiProperty({
    example: 'BRL',
    description: 'User currency preference',
    enum: ['BRL', 'USD', 'EUR'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['BRL', 'USD', 'EUR'])
  currency?: string;

  @ApiProperty({
    example: 'DD/MM/YYYY',
    description: 'Date format preference',
    enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'])
  dateFormat?: string;

  @ApiProperty({
    example: {
      email: true,
      push: true,
      newLeads: true,
      leadUpdates: true,
      dailyReport: false,
      weeklyReport: true,
    },
    description: 'Notification preferences',
    required: false,
  })
  @IsOptional()
  @IsObject()
  notifications?: {
    email?: boolean;
    push?: boolean;
    newLeads?: boolean;
    leadUpdates?: boolean;
    dailyReport?: boolean;
    weeklyReport?: boolean;
  };

  @ApiProperty({
    example: {
      theme: 'light',
      leadsPerPage: 10,
      defaultView: 'list',
      autoAssignLeads: false,
    },
    description: 'User preferences',
    required: false,
  })
  @IsOptional()
  @IsObject()
  preferences?: {
    theme?: 'light' | 'dark';
    leadsPerPage?: number;
    defaultView?: 'list' | 'grid' | 'kanban';
    autoAssignLeads?: boolean;
  };
}