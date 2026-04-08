import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TemplatesService } from './templates.service';
import { TemplateVersionsService } from './template-versions.service';
import { TemplateValidationQueueService } from './template-validation-queue.service';
import { TemplatesController } from './templates.controller';
import { TemplateVersionsController } from './template-versions.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { TEMPLATE_VALIDATION_QUEUE } from './constants';

@Module({
  imports: [
    PrismaModule,
    StorageModule,
    BullModule.registerQueue({
      name: TEMPLATE_VALIDATION_QUEUE,
    }),
  ],
  controllers: [TemplatesController, TemplateVersionsController],
  providers: [TemplatesService, TemplateVersionsService, TemplateValidationQueueService],
  exports: [TemplatesService, TemplateVersionsService],
})
export class TemplatesModule {}
