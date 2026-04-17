
import { S3Client, ListBucketsCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import PizZip from 'pizzip';

dotenv.config();

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

async function debugS3() {
  try {
    console.log('--- S3 Debug Start ---');
    console.log('Endpoint:', process.env.S3_ENDPOINT);
    console.log('Bucket:', process.env.S3_BUCKET);

    const buckets = await s3Client.send(new ListBucketsCommand({}));
    console.log('Available buckets:', buckets.Buckets?.map(b => b.Name));

    const latestVersion = await prisma.templateVersion.findFirst({
      where: { storagePath: { not: null } },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestVersion) {
      console.log('No template versions found with storagePath');
      return;
    }

    console.log('Testing latest template version:', latestVersion.id);
    console.log('Storage Path:', latestVersion.storagePath);

    const response = await s3Client.send(new GetObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: latestVersion.storagePath!,
    }));

    const body = await response.Body?.transformToByteArray();
    console.log('Retrieved body length:', body?.length);

    if (body) {
      try {
        const zip = new PizZip(Buffer.from(body));
        console.log('PizZip successfully loaded the buffer');
        console.log('Files in ZIP:', Object.keys(zip.files));
      } catch (e) {
        console.error('PizZip failed to load the buffer:', e.message);
      }
    }
  } catch (e) {
    console.error('Debug script failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

debugS3();
