import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export const getBannersAndPromos = async (req: Request, res: Response) => {
  try {
    const banners = await prisma.banner.findMany();
    const promos = await prisma.promoTile.findMany();
    return res.json({ banners, promos });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch banners and promos." });
  }
};

export const createBanner = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const banner = await prisma.banner.create({ data });
    return res.status(201).json({ banner });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create banner." });
  }
};

export const updateBanner = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const data = req.body;
    const banner = await prisma.banner.update({
      where: { id },
      data,
    });
    return res.json({ banner });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update banner." });
  }
};

export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.banner.delete({ where: { id } });
    return res.json({ message: "Banner deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete banner." });
  }
};

// Promos
export const createPromo = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const promo = await prisma.promoTile.create({ data });
    return res.status(201).json({ promo });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create promo." });
  }
};

export const updatePromo = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const data = req.body;
    const promo = await prisma.promoTile.update({
      where: { id },
      data,
    });
    return res.json({ promo });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update promo." });
  }
};

export const deletePromo = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.promoTile.delete({ where: { id } });
    return res.json({ message: "Promo deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete promo." });
  }
};
