import { QUEUE_NAME, TEMPLATE_VALIDATION_QUEUE } from '@app/shared';
import 'dotenv/config';
import { startTemplateValidationWorker } from './template-validation.processor';
import { startPreviewWorker } from './preview.processor';

async function startWorker() {
  console.log('Starting workers...');
  
  // Start template validation worker
  const validationWorker = await startTemplateValidationWorker();

  // Start preview generation worker
  const previewWorker = await startPreviewWorker();

  console.log('Workers are running...');
  return { validationWorker, previewWorker };
}

startWorker().catch(err => {
  console.error('Worker failed to start:', err);
  process.exit(1);
});
