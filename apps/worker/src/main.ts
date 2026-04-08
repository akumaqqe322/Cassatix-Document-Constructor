import { Worker } from 'bullmq';
import { QUEUE_NAME } from '@app/shared';
import 'dotenv/config';
import { startTemplateValidationWorker } from './template-validation.processor';

async function startWorker() {
  console.log(`Starting worker for queue: ${QUEUE_NAME}`);
  
  const docWorker = new Worker(QUEUE_NAME, async (job) => {
    console.log(`Processing job ${job.id}:`, job.data);
    
    // Simulate document generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`Job ${job.id} completed`);
    return { success: true, url: 'https://example.com/doc.pdf' };
  }, {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
  });

  docWorker.on('completed', (job) => {
    console.log(`${job.id} has completed!`);
  });

  docWorker.on('failed', (job, err) => {
    console.log(`${job?.id} has failed with ${err.message}`);
  });

  // Start template validation worker
  const validationWorker = await startTemplateValidationWorker();

  console.log('Workers are running...');
  return { docWorker, validationWorker };
}

startWorker().catch(err => {
  console.error('Worker failed to start:', err);
  process.exit(1);
});
