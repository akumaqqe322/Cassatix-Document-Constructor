import { Module } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { TemplateVersionsService } from './template-versions.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [TemplatesService, TemplateVersionsService],
  exports: [TemplatesService, TemplateVersionsService],
})
export class TemplatesModule {}
