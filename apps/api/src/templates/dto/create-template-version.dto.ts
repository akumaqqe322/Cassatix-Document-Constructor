import { IsString, IsOptional, IsObject, IsNotEmpty } from 'class-validator';

export class CreateTemplateVersionDto {
  @IsString()
  @IsOptional()
  changelog?: string;

  @IsObject()
  @IsOptional()
  variablesSchemaJson?: any;

  @IsObject()
  @IsOptional()
  conditionsSchemaJson?: any;

  @IsString()
  @IsOptional()
  fileName?: string;

  @IsString()
  @IsOptional()
  storagePath?: string;
}
