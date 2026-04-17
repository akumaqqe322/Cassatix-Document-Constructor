import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    const { S3Client, PutObjectCommand, CreateBucketCommand, HeadBucketCommand } = await import('@aws-sdk/client-s3');
    
    const s3Client = new S3Client({
      endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
      },
      forcePathStyle: true,
    });

    const BUCKET = process.env.S3_BUCKET || 'documents';

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

    const demoTemplates = [
      {
        name: 'Power of Attorney',
        code: 'POA-001',
        category: 'LEGAL',
        caseType: 'FAMILY_DISSOLUTION',
      },
      {
        name: 'Claim Statement',
        code: 'CLM-001',
        category: 'LITIGATION',
        caseType: 'COMMERCIAL_LITIGATION',
      },
      {
        name: 'Service Agreement',
        code: 'AGR-001',
        category: 'CONTRACT',
        caseType: 'CORPORATE_M_A',
      },
      {
        name: 'Demand Letter',
        code: 'DL-001',
        category: 'NOTICE',
        caseType: 'COMMERCIAL_LITIGATION',
      }
    ];

    for (const t of demoTemplates) {
      const template = await prisma.template.upsert({
        where: { code: t.code },
        update: { name: t.name, category: t.category, caseType: t.caseType },
        create: {
          name: t.name,
          code: t.code,
          category: t.category,
          caseType: t.caseType,
          createdById: demoUser.id,
        }
      });

      const storagePath = `templates/${t.code}/v1.docx`;
      
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
          fileName: `${t.name}.docx`,
        },
        create: {
          templateId: template.id,
          versionNumber: 1,
          status: 'PUBLISHED',
          validationStatus: 'VALID',
          storagePath,
          fileName: `${t.name}.docx`,
          createdById: demoUser.id,
          changelog: 'Initial demo version',
        }
      });

      await prisma.template.update({
        where: { id: template.id },
        data: { publishedVersionId: version.id }
      });

      // Upload minimal docx (base64 of a very small zip)
      const blankDocxBase64 = 'UEsDBBQAAAAIAAAAIQA9746A7gAAAE4CAAATAAgCW0NvbnRlbnRfVHlwZXNdLnhtbCCiBAIooAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC0ksFOwzAMhu88ReTrcpS2AyIh9XAnuAABiUvMvU2atkbGSSf29kS6m4M0YOLC0S/6+8m2W6/nsh7FmIy1UnZ7JS0Gpz23St7X94vPtLxvSToKNoXGatlo7zGZ7O7uGvYBBSeVyvuaIisOkkvloUPhG7B1Z6wGj7Y4U86BvJ1uH9v2YcAbUuVIsre9ZOn3yByV9jE7Z1j8mXfS53D6O9O17r0K99A2mDR86m3r9T6R0W8lPOnR9A9jZ5uD+aG389/fznm+5Hl29P5nB3Z1C7z5iAnY5Bv8B1BLAwQUAAAACAAAACEAt9p7p8MAAABXAAALAAgCW3JlbHNdLnJlbHOCiBAIooAACAAAAAAAAAA';
      const buf = Buffer.from(blankDocxBase64, 'base64');

      try {
        await s3Client.send(new PutObjectCommand({
          Bucket: BUCKET,
          Key: storagePath,
          Body: buf,
          ContentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }));
      } catch (err) {
        console.warn(`Could not upload template to S3 for ${t.code}`);
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
