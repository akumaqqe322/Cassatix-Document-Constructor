import 'reflect-metadata';
import { QUEUE_NAME, TEMPLATE_VALIDATION_QUEUE } from '@app/shared';
import 'dotenv/config';
import { startTemplateValidationWorker } from './template-validation.processor';
import { startPreviewWorker } from './preview.processor';
import { startFinalGenerationWorker } from './final-generation.processor';

async function startWorker() {
  console.log('Starting workers...');
  
  // Start template validation worker
  const validationWorker = await startTemplateValidationWorker();

  // Start preview generation worker
  const previewWorker = await startPreviewWorker();

  // Start final generation worker
  const finalWorker = await startFinalGenerationWorker();

  console.log('Workers are running...');
  return { validationWorker, previewWorker, finalWorker };
}

startWorker().catch(err => {
  console.error('Worker failed to start:', err);
  process.exit(1);
});
