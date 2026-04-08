import { TEMPLATE_VALIDATION_QUEUE as SHARED_QUEUE } from '@app/shared';

export const TEMPLATE_VALIDATION_QUEUE = SHARED_QUEUE;

export enum TemplateValidationJob {
  VALIDATE = 'validate-template',
}
