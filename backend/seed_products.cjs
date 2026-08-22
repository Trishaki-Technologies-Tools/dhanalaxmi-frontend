const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));
const prisma = new PrismaClient();

async function main() {
  for (const p of products) {
    p.description = "Crafted in 925 hallmarked sterling silver and hand-polished across 14 stages, this piece is finished with a rhodium seal that resists tarnish and keeps its mirror lustre for years.";
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p
    });
  }
  console.log(`Seeded ${products.length} products successfully.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
