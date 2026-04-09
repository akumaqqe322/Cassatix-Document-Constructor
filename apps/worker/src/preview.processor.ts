import { Worker, Job } from 'bullmq';
import { PrismaClient, DocumentStatus } from '@prisma/client';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { QUEUE_NAME, getRedisConnection } from '@app/shared';
import { CasesService } from './cases/cases.service';

const prisma = new PrismaClient();
const casesService = new CasesService();
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

export async function startPreviewWorker() {
  console.log(`Starting preview worker for queue: ${QUEUE_NAME}`);

  const worker = new Worker(QUEUE_NAME, async (job: Job) => {
    // Only process preview generation jobs
    if (job.name !== 'generate-preview') {
      return;
    }

    const { templateId, versionId, caseId, documentId } = job.data;
    console.log(`Generating preview for document: ${documentId}`);

    try {
      // 1. Update status to PROCESSING
      await prisma.generatedDocument.update({
        where: { id: documentId },
        data: { status: DocumentStatus.PROCESSING },
      });

      // 2. Fetch version and case data
      const version = await prisma.templateVersion.findUnique({
        where: { id: versionId },
      });

      if (!version || !version.storagePath) {
        throw new Error('Template version or storage path not found');
      }

      const caseData = await casesService.getCaseData(caseId);

      // 3. Load template from S3
      const templateResponse = await s3Client.send(new GetObjectCommand({
        Bucket: bucket,
        Key: version.storagePath,
      }));

      const templateBuffer = await templateResponse.Body?.transformToByteArray();
      if (!templateBuffer) {
        throw new Error('Could not read template from storage');
      }

      // 4. Render DOCX
      const zip = new PizZip(templateBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      doc.render(caseData);
      const outputBuffer = doc.getZip().generate({ type: 'nodebuffer' });

      // 5. Save preview to S3
      const previewKey = `previews/${documentId}.docx`;
      await s3Client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: previewKey,
        Body: outputBuffer,
        ContentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      }));

      // 6. Update document status to COMPLETED
      await prisma.generatedDocument.update({
        where: { id: documentId },
        data: {
          status: DocumentStatus.COMPLETED,
          storagePath: previewKey,
          completedAt: new Date(),
        },
      });

      console.log(`Preview generated successfully for document: ${documentId}`);
    } catch (error) {
      console.error(`Preview generation failed for document: ${documentId}`, error);
      try {
        await prisma.generatedDocument.update({
          where: { id: documentId },
          data: {
            status: DocumentStatus.FAILED,
            errorMessage: error.message,
          },
        });
      } catch (dbError) {
        console.error('Failed to update document status in DB', dbError);
      }
    }
  }, {
    connection: getRedisConnection(),
  });

  worker.on('completed', (job) => {
    console.log(`Preview job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Preview job ${job?.id} failed: ${err.message}`);
  });

  return worker;
}
