import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { TEMPLATE_VALIDATION_QUEUE, TemplateValidationJob } from './constants';

@Injectable()
export class TemplateValidationQueueService {
  constructor(
    @InjectQueue(TEMPLATE_VALIDATION_QUEUE) private validationQueue: Queue,
  ) {}

  async enqueueValidation(templateId: string, versionId: string) {
    await this.validationQueue.add(
      TemplateValidationJob.VALIDATE,
      {
        templateId,
        versionId,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
      },
    );
  }
}
