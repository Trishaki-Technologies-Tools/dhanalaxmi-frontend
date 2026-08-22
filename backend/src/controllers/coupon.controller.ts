import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await (prisma as any).coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json({ coupons });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const coupon = await (prisma as any).coupon.create({ data });
    return res.status(201).json({ coupon });
  } catch (error: any) {
    console.error("Error creating coupon:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Coupon code already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const coupon = await (prisma as any).coupon.update({
      where: { id },
      data,
    });
    return res.json({ coupon });
  } catch (error) {
    console.error("Error updating coupon:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await (prisma as any).coupon.delete({ where: { id } });
    return res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code, cartValue } = req.body;
    if (!code) return res.status(400).json({ message: "Coupon code required" });

    const coupon = await (prisma as any).coupon.findUnique({ where: { code } });
    if (!coupon) return res.status(404).json({ message: "Invalid coupon code" });

    if (!coupon.active) return res.status(400).json({ message: "Coupon is no longer active" });

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    if (coupon.minOrderValue && cartValue < coupon.minOrderValue) {
      return res.status(400).json({ message: `Minimum order value of ₹${coupon.minOrderValue} required` });
    }

    return res.json({ coupon });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
