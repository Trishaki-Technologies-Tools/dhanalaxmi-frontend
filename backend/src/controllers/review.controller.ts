import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middlewares/auth.js";

const prisma = new PrismaClient();

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.productId);
    const reviews = await (prisma as any).review.findMany({
      where: { productId, status: "APPROVED" },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ reviews });
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { productId, rating, comment } = req.body;
    
    // Check if user actually bought the product? We can skip for now or verify against orders.
    const review = await (prisma as any).review.create({
      data: {
        userId: req.user.id,
        productId: Number(productId),
        rating: Number(rating),
        comment,
      },
    });
    return res.status(201).json({ review });
  } catch (error) {
    console.error("Error creating review:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Admin Endpoints
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await (prisma as any).review.findMany({
      include: { 
        user: { select: { name: true, email: true } },
        product: { select: { name: true, slug: true } }
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ reviews });
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateReviewStatus = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    const review = await (prisma as any).review.update({
      where: { id },
      data: { status },
    });
    return res.json({ review });
  } catch (error) {
    console.error("Error updating review status:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await (prisma as any).review.delete({ where: { id } });
    return res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
