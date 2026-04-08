import { Controller, Get, Post, Body, Param, UsePipes, ValidationPipe, UseInterceptors, UploadedFile, ParseFilePipe, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TemplateVersionsService } from './template-versions.service';
import { CreateTemplateVersionDto } from './dto/create-template-version.dto';

const SYSTEM_ACTOR_ID = '00000000-0000-0000-0000-000000000000';

@Controller('templates/:templateId/versions')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class TemplateVersionsController {
  constructor(private readonly versionsService: TemplateVersionsService) {}

  @Post()
  create(
    @Param('templateId') templateId: string,
    @Body() dto: CreateTemplateVersionDto,
  ) {
    return this.versionsService.create(templateId, dto, SYSTEM_ACTOR_ID);
  }

  @Get()
  findAll(@Param('templateId') templateId: string) {
    return this.versionsService.findAll(templateId);
  }

  @Get(':versionId')
  findOne(
    @Param('templateId') templateId: string,
    @Param('versionId') versionId: string,
  ) {
    return this.versionsService.findById(templateId, versionId);
  }

  @Post(':versionId/file')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @Param('templateId') templateId: string,
    @Param('versionId') versionId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.versionsService.uploadFile(templateId, versionId, file);
  }

  @Post(':versionId/publish')
  publish(
    @Param('templateId') templateId: string,
    @Param('versionId') versionId: string,
  ) {
    return this.versionsService.publish(templateId, versionId);
  }

  @Post(':versionId/archive')
  archive(
    @Param('templateId') templateId: string,
    @Param('versionId') versionId: string,
  ) {
    return this.versionsService.archive(templateId, versionId);
  }
}
