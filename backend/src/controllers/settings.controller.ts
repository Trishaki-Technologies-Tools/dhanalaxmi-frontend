import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export const getSilverRate = async (req: Request, res: Response) => {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "silverRate" },
    });
    
    // Default to 100 Rs/g if not set
    const rate = setting ? Number(setting.value) : 100;
    
    return res.json({ silverRate: rate });
  } catch (error) {
    console.error("getSilverRate Error:", error);
    return res.status(500).json({ message: "Failed to fetch silver rate." });
  }
};

export const updateSilverRate = async (req: Request, res: Response) => {
  try {
    const { rate } = req.body;
    
    if (!rate || isNaN(Number(rate))) {
      return res.status(400).json({ message: "Valid silver rate is required." });
    }

    await prisma.systemSetting.upsert({
      where: { key: "silverRate" },
      update: { value: String(rate) },
      create: { key: "silverRate", value: String(rate) },
    });

    return res.json({ message: "Silver rate updated successfully.", silverRate: Number(rate) });
  } catch (error) {
    console.error("updateSilverRate Error:", error);
    return res.status(500).json({ message: "Failed to update silver rate." });
  }
};
