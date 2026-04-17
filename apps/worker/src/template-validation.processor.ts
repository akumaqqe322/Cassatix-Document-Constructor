import { Worker, Job } from 'bullmq';
import { PrismaClient, ValidationStatus } from '@prisma/client';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import * as JSZip from 'jszip';
import { TEMPLATE_VALIDATION_QUEUE, getRedisConnection, streamToBuffer } from '@app/shared';

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
        throw new Error('[DB_RECORD_MISSING] Template version or storage path record not found.');
      }

      // 1. Fetch from S3
      let response;
      try {
        response = await s3Client.send(new GetObjectCommand({
          Bucket: bucket,
          Key: version.storagePath,
        }));
      } catch (s3Error) {
        throw new Error(`[STORAGE_ERROR] Failed to fetch file from S3: ${s3Error instanceof Error ? s3Error.message : String(s3Error)}`);
      }

      if (!response.Body) {
        throw new Error('[STORAGE_ERROR] S3 response body is empty.');
      }

      const body = await streamToBuffer(response.Body);
      if (!body || body.length === 0) {
        throw new Error('[FILE_READ_ERROR] Could not read file content from storage (0 bytes).');
      }

      // 2. Basic DOCX validation (is it a valid zip?)
      try {
        const zip = await JSZip.loadAsync(body);
        if (!zip.file('word/document.xml')) {
          throw new Error('Missing word/document.xml - the file might not be a valid Word document.');
        }
      } catch (err: any) {
        throw new Error(`[FORMAT_ERROR] DOCX structural validation failed: ${err.message}`);
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
    } catch (error: any) {
      console.error(`Validation failed for version: ${versionId}`, error);
      try {
        // Defensive existence check
        const versionCheck = await prisma.templateVersion.findUnique({ where: { id: versionId } });
        if (versionCheck) {
          await prisma.templateVersion.update({
            where: { id: versionId },
            data: {
              validationStatus: ValidationStatus.INVALID,
              validatedAt: new Date(),
              validationError: error.message,
            },
          });
        }
      } catch (dbError) {
        console.error('Failed to update validation status in DB', dbError);
      }
      // Re-throw to ensure BullMQ correctly handles job failure
      throw error;
    }
  }, {
    connection: getRedisConnection(),
  });

  worker.on('completed', (job) => {
    console.log(`Validation job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Validation job ${job?.id} failed: ${err.message}`);
  });

  return worker;
}
