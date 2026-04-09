import { Worker, Job } from 'bullmq';
import { PrismaClient, ValidationStatus } from '@prisma/client';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import * as JSZip from 'jszip';
import { TEMPLATE_VALIDATION_QUEUE } from '@app/shared';

const prisma = new PrismaClient();
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true,
});
const bucket = process.env.S3_BUCKET!;

export async function startTemplateValidationWorker() {
  console.log(`Starting worker for queue: ${TEMPLATE_VALIDATION_QUEUE}`);

  const worker = new Worker(TEMPLATE_VALIDATION_QUEUE, async (job: Job) => {
    const { templateId, versionId } = job.data;
    console.log(`Validating template version: ${versionId}`);

    try {
      const version = await prisma.templateVersion.findUnique({
        where: { id: versionId },
      });

      if (!version || !version.storagePath) {
        throw new Error('Version or storage path not found');
      }

      // 1. Fetch from S3
      const response = await s3Client.send(new GetObjectCommand({
        Bucket: bucket,
        Key: version.storagePath,
      }));

      const body = await response.Body?.transformToByteArray();
      if (!body) {
        throw new Error('Could not read file from storage');
      }

      // 2. Basic DOCX validation (is it a valid zip?)
      try {
        const zip = await JSZip.loadAsync(body);
        if (!zip.file('word/document.xml')) {
          throw new Error('Invalid DOCX: Missing word/document.xml');
        }
      } catch (err) {
        throw new Error(`DOCX processing failed: ${err.message}`);
      }

      // 3. Update DB
      await prisma.templateVersion.update({
        where: { id: versionId },
        data: {
          validationStatus: ValidationStatus.VALID,
          validatedAt: new Date(),
          validationError: null,
        },
      });

      console.log(`Validation successful for version: ${versionId}`);
    } catch (error) {
      console.error(`Validation failed for version: ${versionId}`, error);
      try {
        await prisma.templateVersion.update({
          where: { id: versionId },
          data: {
            validationStatus: ValidationStatus.INVALID,
            validatedAt: new Date(),
            validationError: error.message,
          },
        });
      } catch (dbError) {
        console.error('Failed to update validation status in DB', dbError);
      }
    }
  }, {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    },
  });

  worker.on('completed', (job) => {
    console.log(`Validation job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Validation job ${job?.id} failed: ${err.message}`);
  });

  return worker;
}
