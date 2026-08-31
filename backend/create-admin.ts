import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@dhanalaxmi.com' },
    update: {},
    create: {
      email: 'admin@dhanalaxmi.com',
      password: hashed,
      name: 'Admin',
      phone: '0000000000',
      role: 'ADMIN'
    }
  });
  console.log('Admin user created: admin@dhanalaxmi.com / password123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
