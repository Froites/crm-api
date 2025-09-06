import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { LeadStatus } from '@prisma/client';

export class UpdateLeadStatusDto {
  @ApiProperty({
    example: 'QUALIFIED',
    description: 'New lead status',
    enum: LeadStatus,
  })
  @IsEnum(LeadStatus)
  status: LeadStatus;

  @ApiProperty({
    example: 'Lead qualificado após reunião de discovery',
    description: 'Notes about the status change',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
