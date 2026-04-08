import { 
  TEMPLATE_VALIDATION_QUEUE as SHARED_VALIDATION_QUEUE,
  QUEUE_NAME as SHARED_GENERATION_QUEUE 
} from '@app/shared';

export const TEMPLATE_VALIDATION_QUEUE = SHARED_VALIDATION_QUEUE;
export const DOCUMENT_GENERATION_QUEUE = SHARED_GENERATION_QUEUE;

export enum TemplateValidationJob {
  VALIDATE = 'validate-template',
}

export enum DocumentGenerationJob {
  PREVIEW = 'generate-preview',
}
