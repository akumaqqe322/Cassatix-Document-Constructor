import { IsString, IsNotEmpty } from 'class-validator';

export class GeneratePreviewDto {
  @IsString()
  @IsNotEmpty()
  caseId: string;
}
