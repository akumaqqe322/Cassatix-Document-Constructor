import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TemplateStatus } from '@prisma/client';

export class TemplateQueryDto {
  @IsEnum(TemplateStatus)
  @IsOptional()
  status?: TemplateStatus;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  caseType?: string;
}
