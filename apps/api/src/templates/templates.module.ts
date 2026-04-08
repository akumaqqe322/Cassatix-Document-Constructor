import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TemplatesService } from './templates.service';
import { TemplateVersionsService } from './template-versions.service';
import { TemplateValidationQueueService } from './template-validation-queue.service';
import { DocumentGenerationQueueService } from './document-generation-queue.service';
import { CasesService } from '../cases/cases.service';
import { TemplatesController } from './templates.controller';
import { TemplateVersionsController } from './template-versions.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { TEMPLATE_VALIDATION_QUEUE, DOCUMENT_GENERATION_QUEUE } from './constants';

@Module({
  imports: [
    PrismaModule,
    StorageModule,
    BullModule.registerQueue(
      { name: TEMPLATE_VALIDATION_QUEUE },
      { name: DOCUMENT_GENERATION_QUEUE },
    ),
  ],
  controllers: [TemplatesController, TemplateVersionsController],
  providers: [
    TemplatesService,
    TemplateVersionsService,
    TemplateValidationQueueService,
    DocumentGenerationQueueService,
    CasesService,
  ],
  exports: [TemplatesService, TemplateVersionsService],
})
export class TemplatesModule {}
