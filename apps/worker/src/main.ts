import { Worker } from 'bullmq';
import { QUEUE_NAME } from '@app/shared';
import 'dotenv/config';

async function startWorker() {
  console.log(`Starting worker for queue: ${QUEUE_NAME}`);
  
  const worker = new Worker(QUEUE_NAME, async (job) => {
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

  worker.on('completed', (job) => {
    console.log(`${job.id} has completed!`);
  });

  worker.on('failed', (job, err) => {
    console.log(`${job?.id} has failed with ${err.message}`);
  });

  console.log('Worker is running...');
  return worker;
}

startWorker().catch(err => {
  console.error('Worker failed to start:', err);
  process.exit(1);
});
