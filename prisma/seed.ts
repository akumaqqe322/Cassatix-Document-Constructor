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
