import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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

  console.log('Seeding default user...');
  const adminRole = await prisma.role.findUnique({ where: { code: 'admin' } });
  if (adminRole) {
    await prisma.user.upsert({
      where: { email: 'admin@cassatix.com' },
      update: { name: 'System Admin' },
      create: {
        email: 'admin@cassatix.com',
        name: 'System Admin',
        roleId: adminRole.id,
      },
    });
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
