import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { uploadToR2 } from "../src/config/r2.js";

dotenv.config();

const prisma = new PrismaClient();
const ASSETS_DIR = path.resolve(process.cwd(), "../src/assets");

async function migrateAssets() {
  console.log("🚀 Starting Image Migration to Cloudflare R2...");
  console.log(`📁 Scanning directory: ${ASSETS_DIR}\n`);

  if (!fs.existsSync(ASSETS_DIR)) {
    console.error(`❌ Assets directory not found at ${ASSETS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(ASSETS_DIR).filter((f) => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(f));
  console.log(`📸 Found ${files.length} images to transfer.\n`);

  const urlMapping: Record<string, string> = {};

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filePath = path.join(ASSETS_DIR, filename);
    const fileBuffer = fs.readFileSync(filePath);

    const ext = path.extname(filename).toLowerCase();
    let mimeType = "image/jpeg";
    if (ext === ".png") mimeType = "image/png";
    if (ext === ".webp") mimeType = "image/webp";
    if (ext === ".gif") mimeType = "image/gif";
    if (ext === ".svg") mimeType = "image/svg+xml";

    console.log(`[${i + 1}/${files.length}] Uploading ${filename}...`);
    try {
      const publicUrl = await uploadToR2(fileBuffer, filename, mimeType);
      urlMapping[filename] = publicUrl;
      console.log(`   ✅ R2 URL: ${publicUrl}`);
    } catch (err) {
      console.error(`   ❌ Failed to upload ${filename}:`, err);
    }
  }

  console.log("\n🔄 Updating MySQL Database Records with Cloudflare R2 URLs...");

  // Update Products in MySQL
  const products = await prisma.product.findMany();
  let updatedProducts = 0;

  for (const product of products) {
    const matchedKey = files.find((f) => product.image.includes(f));
    if (matchedKey && urlMapping[matchedKey]) {
      await prisma.product.update({
        where: { id: product.id },
        data: { image: urlMapping[matchedKey] },
      });
      updatedProducts++;
    }
  }

  console.log(`✅ Updated ${updatedProducts} products in MySQL DB with R2 image URLs.`);
  console.log("🎉 Migration of all existing images to Cloudflare R2 Completed Successfully!");
}

migrateAssets()
  .catch((err) => {
    console.error("Migration Error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
