import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { TemplateStatus } from '@prisma/client';

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  caseType: string;

  @IsEnum(TemplateStatus)
  @IsOptional()
  status?: TemplateStatus;

  @IsString()
  @IsNotEmpty()
  createdById: string; // Temporary until auth is implemented
}
