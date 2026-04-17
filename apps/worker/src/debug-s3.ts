
import { S3Client, ListBucketsCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import PizZip from 'pizzip';
import { streamToBuffer } from '@app/shared';

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
  const endpoints = ['http://minio:9000'];
  
  for (const endpoint of endpoints) {
    if (!endpoint) continue;
    try {
      console.log(`\n--- Testing S3 Endpoint: ${endpoint} ---`);
      const testClient = new S3Client({
        endpoint: endpoint,
        region: 'us-east-1',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY!,
          secretAccessKey: process.env.S3_SECRET_KEY!,
        },
        forcePathStyle: true,
      });

      const buckets = await testClient.send(new ListBucketsCommand({}));
      console.log('Success! Available buckets:', buckets.Buckets?.map(b => b.Name));

      const latestVersion = await prisma.templateVersion.findFirst({
        where: { storagePath: { not: null } },
        orderBy: { createdAt: 'desc' },
      });

      if (!latestVersion) {
        console.log('No template versions found with storagePath');
        return;
      }

      console.log('Testing template version:', latestVersion.id);
      console.log('Storage Path:', latestVersion.storagePath);

      const response = await testClient.send(new GetObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: latestVersion.storagePath!,
      }));

      console.log('S3 ContentLength:', response.ContentLength);
      console.log('S3 ContentType:', response.ContentType);

      if (response.Body) {
        const body = await streamToBuffer(response.Body);
        console.log('Retrieved buffer length:', body.length);
        
        if (body.length > 0) {
          try {
            const zip = new PizZip(body);
            console.log('PizZip successfully loaded the buffer');
            console.log('Files in ZIP:', Object.keys(zip.files).slice(0, 5), '...');
          } catch (e) {
            console.error('PizZip failed to load the buffer:', e.message);
            console.error('Buffer start (UTF8):', body.slice(0, 100).toString('utf8'));
          }
        }
      }
      
      // If we reach here, we found a working endpoint
      break; 
    } catch (e) {
      console.error(`Failed connecting to ${endpoint}:`, e.message);
    }
  }
}

debugS3();
