import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { slug: "rings", name: "Silver Rings", tagline: "Hand-finished bands" },
  { slug: "chains", name: "Silver Chains", tagline: "Everyday heirlooms" },
  { slug: "bracelets", name: "Bracelets", tagline: "Sculpted for the wrist" },
  { slug: "kada", name: "Kada", tagline: "Solid silver strength" },
  { slug: "payal", name: "Payal", tagline: "Anklets that sing" },
  { slug: "anklets", name: "Anklets", tagline: "Quiet movement" },
  { slug: "pendants", name: "Pendants", tagline: "Signature motifs" },
  { slug: "earrings", name: "Earrings", tagline: "Light and luminous" },
  { slug: "idols", name: "Silver Idols", tagline: "Devotion in 92.5" },
];

const products = [
  {
    name: "Nithya Cuff Bracelet",
    slug: "nithya-cuff-bracelet",
    categorySlug: "bracelets",
    categoryLabel: "Bracelets",
    price: 5990,
    mrp: 7200,
    image: "/assets/p-bracelets-1.jpg",
    weight: 14.8,
    occasion: "Everyday",
    collection: "Signature",
    badge: "Bestseller",
    description: "Crafted in 925 hallmarked sterling silver and hand-polished across 14 stages.",
  },
  {
    name: "Aarohi Eternity Band",
    slug: "aarohi-eternity-band",
    categorySlug: "rings",
    categoryLabel: "Silver Rings",
    price: 4290,
    mrp: 5200,
    image: "/assets/p-rings-1.jpg",
    weight: 6.2,
    occasion: "Wedding",
    collection: "Wedding",
    badge: "Bestseller",
    description: "Crafted in 925 hallmarked sterling silver and hand-polished across 14 stages.",
  },
  {
    name: "Kanaka Link Chain",
    slug: "kanaka-link-chain",
    categorySlug: "chains",
    categoryLabel: "Silver Chains",
    price: 6890,
    mrp: 8400,
    image: "/assets/p-chains-1.jpg",
    weight: 18.4,
    occasion: "Everyday",
    collection: "Signature",
    badge: "Trending",
    description: "Crafted in 925 hallmarked sterling silver and hand-polished across 14 stages.",
  },
  {
    name: "Veer Classic Silver Kada",
    slug: "veer-classic-silver-kada",
    categorySlug: "kada",
    categoryLabel: "Kada",
    price: 8990,
    mrp: 10800,
    image: "/assets/p-kada-1.jpg",
    weight: 42.5,
    occasion: "Everyday",
    collection: "Signature",
    badge: "Bestseller",
    description: "Crafted in 925 hallmarked sterling silver and hand-polished across 14 stages.",
  },
  {
    name: "Ghungroo Bell Payal",
    slug: "ghungroo-bell-payal",
    categorySlug: "payal",
    categoryLabel: "Payal",
    price: 5490,
    mrp: 6600,
    image: "/assets/p-payal-1.jpg",
    weight: 24.6,
    occasion: "Festive",
    collection: "Signature",
    badge: "Bestseller",
    description: "Crafted in 925 hallmarked sterling silver and hand-polished across 14 stages.",
  },
  {
    name: "Laxmi Devotional Idol",
    slug: "laxmi-devotional-idol",
    categorySlug: "idols",
    categoryLabel: "Silver Idols",
    price: 18900,
    mrp: 22500,
    image: "/assets/cat-idols.jpg",
    weight: 96.0,
    occasion: "Gifting",
    collection: "Temple",
    badge: "Devotional",
    description: "Crafted in 925 hallmarked sterling silver for temple and home worship.",
  },
];

async function main() {
  console.log("🌱 Starting Database Seed...");

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  for (const prod of products) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: prod,
      create: prod,
    });
  }

  console.log("✅ Database Seed Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
