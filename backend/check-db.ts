import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const productsCount = await prisma.product.count();
  const usersCount = await prisma.user.count();
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const allProducts = await prisma.product.findMany({ select: { slug: true } });
  
  console.log('--- DATABASE STATUS ---');
  console.log('Total Products:', productsCount);
  console.log('Total Users:', usersCount);
  console.log('Admin Email:', admin ? admin.email : 'No admin found!');
  console.log('Product Slugs:', allProducts.map(p => p.slug).join(', '));
}

main().catch(console.error).finally(() => prisma.$disconnect());
