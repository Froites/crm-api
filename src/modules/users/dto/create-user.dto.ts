import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Full name of the user',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'joao@crm.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @ApiProperty({
    example: 'AGENT',
    description: 'User role in the system',
    enum: Role,
  })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({
    example: '+55 11 99999-9999',
    description: 'User phone number',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: 'https://avatar.url.com/user.jpg',
    description: 'User avatar URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar?: string;
}
