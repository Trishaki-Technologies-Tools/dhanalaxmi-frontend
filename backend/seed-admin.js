import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = "admin@dhanalaxmi.com";
  const password = "admin123";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin already exists. Updating role and password...");
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: { role: "ADMIN", password: hashedPassword },
    });
    console.log("Admin updated.");
  } else {
    console.log("Creating new admin user...");
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name: "Super Admin",
        email,
        phone: "0000000000",
        password: hashedPassword,
        role: "ADMIN",
      },
    });
    console.log("Admin created.");
  }
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
