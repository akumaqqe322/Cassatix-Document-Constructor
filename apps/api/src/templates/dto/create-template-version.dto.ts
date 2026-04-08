import { IsString, IsOptional, IsObject, IsNotEmpty } from 'class-validator';

export class CreateTemplateVersionDto {
  @IsString()
  @IsOptional()
  changelog?: string;

  @IsObject()
  @IsOptional()
  variablesSchemaJson?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  conditionsSchemaJson?: Record<string, unknown>;
}
