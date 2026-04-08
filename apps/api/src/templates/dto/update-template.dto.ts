import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TemplateStatus } from '@prisma/client';

export class UpdateTemplateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  caseType?: string;

  @IsEnum(TemplateStatus)
  @IsOptional()
  status?: TemplateStatus;
}
