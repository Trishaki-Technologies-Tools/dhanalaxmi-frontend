import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tablesToRename = [
    { from: 'user', to: 'User' },
    { from: 'category', to: 'Category' },
    { from: 'product', to: 'Product' },
    { from: 'order', to: 'Order' },
    { from: 'orderitem', to: 'OrderItem' },
    { from: 'review', to: 'Review' },
    { from: 'address', to: 'Address' },
    { from: 'banner', to: 'Banner' },
    { from: 'promotile', to: 'PromoTile' },
    { from: 'wishlist', to: 'Wishlist' },
    { from: 'systemsetting', to: 'SystemSetting' },
    { from: 'coupon', to: 'Coupon' },
    { from: '_prisma_migrations', to: '_prisma_migrations' }
  ];

  for (const { from, to } of tablesToRename) {
    try {
      await prisma.$executeRawUnsafe(`RENAME TABLE \`${from}\` TO \`${to}\``);
      console.log(`Renamed ${from} to ${to}`);
    } catch (e) {
      console.log(`Failed to rename ${from} to ${to}:`, e.message);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
