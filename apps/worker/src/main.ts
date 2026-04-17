import 'reflect-metadata';
import { QUEUE_NAME, TEMPLATE_VALIDATION_QUEUE } from '@app/shared';
import 'dotenv/config';
import { startTemplateValidationWorker } from './template-validation.processor';
import { startGenerationWorker } from './generation.processor';

async function startWorker() {
  console.log('Starting workers...');
  
  // Start template validation worker
  const validationWorker = await startTemplateValidationWorker();

  // Start combined generation worker (handles preview and final)
  const generationWorker = await startGenerationWorker();

  console.log('Workers are running...');
  return { validationWorker, generationWorker };
}

startWorker().catch(err => {
  console.error('Worker failed to start:', err);
  process.exit(1);
});
