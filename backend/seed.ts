import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  // create admin user with hashed password
  const hashed = await bcrypt.hash('admin1234', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@icpc.local' },
    update: {},
    create: {
      email: 'admin@icpc.local',
      password: hashed,
      role: 'ADMIN',
      approved: true,
    },
  });

  console.log('Seeded admin:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
