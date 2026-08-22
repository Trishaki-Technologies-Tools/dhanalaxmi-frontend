import { Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middlewares/auth.js";

export const getWishlist = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ wishlist });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch wishlist." });
  }
};

export const toggleWishlistItem = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required." });
    }

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: Number(productId),
        },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { id: existing.id },
      });
      return res.json({ action: "removed", message: "Removed from wishlist." });
    } else {
      const added = await prisma.wishlist.create({
        data: {
          userId: req.user.id,
          productId: Number(productId),
        },
        include: { product: true },
      });
      return res.status(201).json({ action: "added", message: "Added to wishlist.", item: added });
    }
  } catch (error) {
    console.error("Error toggling wishlist item:", error);
    return res.status(500).json({ message: "Failed to update wishlist." });
  }
};
