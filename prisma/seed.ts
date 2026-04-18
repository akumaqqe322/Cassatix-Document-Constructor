import { PrismaClient } from '@prisma/client';
import PizZip from 'pizzip';
import { S3Client, PutObjectCommand, GetObjectCommand, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import * as fsPromises from 'node:fs/promises';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import * as path from 'node:path';
import { Buffer } from 'node:buffer';
import { generateTemplates } from '../scripts/generate-demo-templates';

const prisma = new PrismaClient();

async function streamToBuffer(stream: any): Promise<Buffer> {
  if (stream instanceof Buffer) return stream;
  if (stream instanceof Uint8Array) return Buffer.from(stream);
  
  // Handle S3 SDK transformToByteArray if present
  if (stream?.transformToByteArray) {
    const bytes = await stream.transformToByteArray();
    return Buffer.from(bytes);
  }

  const chunks: Buffer[] = [];
  
  if (typeof stream[Symbol.asyncIterator] === 'function') {
    for await (const chunk of stream) {
      if (typeof chunk === 'string') {
        throw new Error("Stream emitted a string instead of a Buffer. Check configuration.");
      }
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
  } else {
    await new Promise((resolve, reject) => {
      stream.on('data', (c: any) => {
        if (typeof c === 'string') {
          reject(new Error("Stream emitted a string instead of a Buffer. Check configuration."));
          return;
        }
        chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c));
      });
      stream.on('error', reject);
      stream.on('end', resolve);
    });
  }
  
  return Buffer.concat(chunks);
}

async function main() {
  try {
    await prisma.$connect();
  } catch (e) {
    console.warn('Could not connect to database for seeding. Skipping seed.');
    return;
  }

  const roles = [
    { code: 'admin', name: 'Administrator' },
    { code: 'lawyer', name: 'Lawyer' },
    { code: 'partner', name: 'Partner' },
  ];

  console.log('Seeding roles...');

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: { name: role.name },
      create: {
        code: role.code,
        name: role.name,
      },
    });
  }

  console.log('Seeding mock users...');
  const adminRole = await prisma.role.findUnique({ where: { code: 'admin' } });
  const lawyerRole = await prisma.role.findUnique({ where: { code: 'lawyer' } });
  const partnerRole = await prisma.role.findUnique({ where: { code: 'partner' } });

  const mockUsers = [
    {
      email: 'admin@firm.com',
      name: 'Admin User',
      roleId: adminRole?.id,
    },
    {
      email: 'lawyer@firm.com',
      name: 'Lawyer User',
      roleId: lawyerRole?.id,
    },
    {
      email: 'partner@client.com',
      name: 'Partner User',
      roleId: partnerRole?.id,
    },
    {
      email: 'zFlexxxPlay@gmail.com',
      name: 'Demo Admin',
      roleId: adminRole?.id,
    }
  ];

  for (const user of mockUsers) {
    if (user.roleId) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: { name: user.name, roleId: user.roleId },
        create: {
          email: user.email,
          name: user.name,
          roleId: user.roleId,
        },
      });
    }
  }

  // Demo Templates Setup
  const demoUser = await prisma.user.findUnique({ where: { email: 'zFlexxxPlay@gmail.com' } });
  if (demoUser) {
    // 1. Generate fresh templates
    await generateTemplates().catch(err => {
      console.error('Failed to generate templates:', err);
      process.exit(1);
    });

    const s3Client = new S3Client({
      endpoint: process.env.S3_ENDPOINT || 'http://minio:9000',
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
      },
      forcePathStyle: true,
    });

    const BUCKET = process.env.S3_BUCKET || 'documents';
    const METADATA_DIR = path.join(process.cwd(), 'demo/templates/metadata');
    const TEMPLATES_DIR = path.join(process.cwd(), 'demo/templates');

    // Ensure S3 bucket exists
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET }));
    } catch (e) {
      console.log(`Creating bucket ${BUCKET}...`);
      try {
        await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET }));
      } catch (err) {
        console.warn('Could not create S3 bucket. Generation might fail if Minio is not running.');
      }
    }

    if (existsSync(METADATA_DIR)) {
      const files = readdirSync(METADATA_DIR).filter(f => f.endsWith('.json'));
      console.log(`Found ${files.length} demo templates to seed...`);

      for (const file of files) {
        const id = file.replace('.json', '');
        const metadata = JSON.parse(readFileSync(path.join(METADATA_DIR, file), 'utf-8'));
        const docxPath = path.join(TEMPLATES_DIR, `${id}.docx`);

        if (!existsSync(docxPath)) {
          console.warn(`DOCX file not found for ${id}, skipping...`);
          continue;
        }

        console.log(`Seeding template: ${metadata.name} (${metadata.code})...`);

        const template = await prisma.template.upsert({
          where: { code: metadata.code },
          update: { 
            name: metadata.name, 
            category: metadata.category, 
            caseType: metadata.caseType
          },
          create: {
            name: metadata.name,
            code: metadata.code,
            category: metadata.category,
            caseType: metadata.caseType,
            createdById: demoUser.id,
          }
        });

        const storagePath = `templates/${metadata.code}/v1.docx`;
        const data = await fsPromises.readFile(docxPath);
        const docxBuffer = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
        
        // --- PRE-UPLOAD INTEGRITY CHECKS ---
        
        // 1. Basic size guards (1B - 200KB)
        if (docxBuffer.length === 0) {
          throw new Error(`[SEED_CORRUPTION] Template ${metadata.code} is empty.`);
        }
        if (docxBuffer.length > 200 * 1024) {
          throw new Error(`[SEED_CORRUPTION] Template ${metadata.code} exceeds 200KB limit.`);
        }

        // 2. Double check Signature (504b0304)
        if (docxBuffer[0] !== 0x50 || docxBuffer[1] !== 0x4B || docxBuffer[2] !== 0x03 || docxBuffer[3] !== 0x04) {
          console.error(`!!!! CORRUPTED LOCAL FILE (Signature Mismatch) for ${metadata.code}`);
          console.error(`First 4 bytes: ${docxBuffer.slice(0, 4).toString('hex')}`);
          process.exit(1);
        }

        // 3. Scan for UTF-8 corruption markers (EF BF BD)
        if (docxBuffer.toString('hex').includes('efbfbd')) {
          console.error(`!!!! UTF-8 BINARY CORRUPTION DETECTED in ${metadata.code}.`);
          console.error(`This happens if binary is treated as text. Re-run generator.`);
          process.exit(1);
        }

        // 4. Structural Validation
        try {
          const zip = new PizZip(docxBuffer);
          if (!zip.file('word/document.xml')) {
            throw new Error('Missing word/document.xml - invalid DOCX.');
          }
          // Dry render check (docxtemplater is imported as well)
          const Docxtemplater = (await import('docxtemplater')).default;
          new Docxtemplater(zip, { 
            paragraphLoop: true, 
            linebreaks: true,
            delimiters: {
              start: '{{',
              end: '}}',
            },
          });
        } catch (err: any) {
          console.error(`!!!! STRUCTURAL ERROR in ${metadata.code}: ${err.message}`);
          process.exit(1);
        }

        const version = await prisma.templateVersion.upsert({
          where: {
            templateId_versionNumber: {
              templateId: template.id,
              versionNumber: 1
            }
          },
          update: {
            status: 'PUBLISHED',
            validationStatus: 'VALID',
            storagePath,
            fileName: `${id}.docx`,
            variablesSchemaJson: metadata.schema,
          },
          create: {
            templateId: template.id,
            versionNumber: 1,
            status: 'PUBLISHED',
            validationStatus: 'VALID',
            storagePath,
            fileName: `${id}.docx`,
            variablesSchemaJson: metadata.schema,
            createdById: demoUser.id,
            changelog: 'Initial demo version',
          }
        });

        await prisma.template.update({
          where: { id: template.id },
          data: { publishedVersionId: version.id }
        });

        try {
          console.log(`- Uploading ${metadata.code} (${docxBuffer.length} bytes)...`);
          await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: storagePath,
            Body: docxBuffer,
            ContentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          }));
          console.log(`  Success: Uploaded to S3 at ${storagePath}`);

          // Integrity check: Try to re-download and parse
          // Small delay to ensure MinIO has fully processed the write (usually immediate, but safe for CI)
          await new Promise(r => setTimeout(r, 1000));
          
          const getResponse = await s3Client.send(new GetObjectCommand({
            Bucket: BUCKET,
            Key: storagePath,
          })) as any;
          
          const downloaded = await streamToBuffer(getResponse.Body!);
          console.log(`  Integrity Check: Downloaded ${downloaded.length} bytes`);

          if (downloaded.length === 0) {
            throw new Error('Downloaded file is empty (0 bytes)');
          }

          if (downloaded.length !== docxBuffer.length) {
            console.warn(`  Warning: Byte mismatch! Local: ${docxBuffer.length}, Remote: ${downloaded.length}`);
          }
          
          const zip = new PizZip(downloaded);
          if (!zip.file('word/document.xml')) {
            throw new Error('Downloaded file is missing word/document.xml');
          }
          console.log(`  Integrity Check: PASSED`);
        } catch (err) {
          const bufferSnippet = docxBuffer.slice(0, 16).toString('hex');
          console.error(`!!!! INTEGRITY CHECK FAILED for ${metadata.code}:`, err);
          console.error(`Local Buffer Size: ${docxBuffer.length}, Snippet: ${bufferSnippet}`);
          process.exit(1); 
        }
      }
    }
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
