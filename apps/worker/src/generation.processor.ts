import { Worker, Job } from 'bullmq';
import { PrismaClient, DocumentStatus, OutputFormat } from '@prisma/client';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { QUEUE_NAME, getRedisConnection } from '@app/shared';
import { CasesService } from './cases/cases.service';
import * as libreoffice from 'libreoffice-convert';
import { promisify } from 'util';

const convertAsync = promisify(libreoffice.convert);
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

export async function startGenerationWorker() {
  console.log(`Starting document generation worker for queue: ${QUEUE_NAME}`);

  const worker = new Worker(QUEUE_NAME, async (job: Job) => {
    // Determine job type and prefix
    const isPreview = job.name === 'generate-preview';
    const isFinal = job.name === 'generate-final';

    if (!isPreview && !isFinal) {
      console.warn(`Unknown job name on generation queue: ${job.name}`);
      return;
    }

    const { templateId, versionId, caseId, documentId, outputFormat = OutputFormat.DOCX, customVariables } = job.data;
    const typeLabel = isPreview ? 'preview' : 'final';
    console.log(`Generating ${typeLabel} document: ${documentId} (Format: ${outputFormat})`);

    try {
      // 1. Update status to PROCESSING
      await prisma.generatedDocument.update({
        where: { id: documentId },
        data: { status: DocumentStatus.PROCESSING },
      });

      // 2. Fetch version and context data
      const version = await prisma.templateVersion.findUnique({
        where: { id: versionId },
      });

      if (!version || !version.storagePath) {
        throw new Error('[TEMPLATE_DATA_ERROR] Template version or storage path record is missing in the database.');
      }

      // Determine template variables (normalized context)
      let variables = customVariables;
      if (!variables && caseId) {
        const context = await casesService.getGenerationContext(caseId);
        variables = context.variables;
      }

      if (!variables) {
        throw new Error('[VARIABLE_ERROR] No generation variables provided for manual input and no case associated for auto-fill.');
      }

      // 3. Load template from S3
      let templateResponse;
      try {
        templateResponse = await s3Client.send(new GetObjectCommand({
          Bucket: bucket,
          Key: version.storagePath,
        }));
      } catch (s3Error) {
        throw new Error(`[STORAGE_ERROR] Failed to fetch template from storage: ${s3Error instanceof Error ? s3Error.message : String(s3Error)}`);
      }

      const templateBuffer = await templateResponse.Body?.transformToByteArray();
      if (!templateBuffer || templateBuffer.length === 0) {
        throw new Error('[FILE_READ_ERROR] Template file retrieved from storage is empty (0 bytes). Please re-upload the template.');
      }

      // 4. Render DOCX
      let outputBuffer: Buffer;
      let contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      let extension = 'docx';

      try {
        const zip = new PizZip(templateBuffer);
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
        });

        doc.render(variables);
        outputBuffer = doc.getZip().generate({ type: 'nodebuffer' });

        // 5. Convert to PDF if requested
        if (outputFormat === OutputFormat.PDF) {
          console.log(`Converting ${typeLabel} document ${documentId} to PDF...`);
          try {
            outputBuffer = await convertAsync(outputBuffer, '.pdf', undefined);
            contentType = 'application/pdf';
            extension = 'pdf';
          } catch (convError) {
            console.error(`PDF conversion failed for document: ${documentId}`, convError);
            throw new Error(`[CONVERSION_FAILED] PDF conversion failed. Ensure your server has LibreOffice installed: ${convError instanceof Error ? convError.message : String(convError)}`);
          }
        }
      } catch (renderError) {
        const message = (renderError instanceof Error && renderError.message.includes("Corrupted zip"))
          ? "The template file is corrupted or not a valid Word (.docx) document." 
          : (renderError instanceof Error ? renderError.message : String(renderError));
        throw new Error(`[RENDER_ERROR] Document rendering failed: ${message}`);
      }

      // 6. Save document to S3
      const keyPrefix = isPreview ? 'previews' : 'documents';
      const storagePath = `${keyPrefix}/${documentId}.${extension}`;
      
      await s3Client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: storagePath,
        Body: outputBuffer,
        ContentType: contentType,
      }));

      // 7. Update document status to COMPLETED
      await prisma.generatedDocument.update({
        where: { id: documentId },
        data: {
          status: DocumentStatus.COMPLETED,
          storagePath: storagePath,
          completedAt: new Date(),
        },
      });

      console.log(`${typeLabel} document generated successfully: ${documentId}`);
    } catch (error) {
      console.error(`${typeLabel} generation failed for document: ${documentId}`, error);
      try {
        await prisma.generatedDocument.update({
          where: { id: documentId },
          data: {
            status: DocumentStatus.FAILED,
            errorMessage: error instanceof Error ? error.message : String(error),
          },
        });
      } catch (dbError) {
        console.error('Failed to update document status in DB', dbError);
      }
    }
  }, {
    connection: getRedisConnection(),
    concurrency: 5, // Allow processing multiple jobs in parallel on this worker
  });

  worker.on('completed', (job) => {
    console.log(`Generation job ${job.id} (${job.name}) completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Generation job ${job?.id} (${job?.name}) failed: ${err.message}`);
  });

  return worker;
}
