import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    return res.json({ categories });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch categories." });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { slug, name, tagline, image } = req.body;
    const category = await prisma.category.create({
      data: { slug, name, tagline, image },
    });
    return res.status(201).json({ category });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create category." });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug);
    const { name, tagline, image } = req.body;
    const category = await prisma.category.update({
      where: { slug },
      data: { name, tagline, image },
    });
    return res.json({ category });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update category." });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug);
    await prisma.category.delete({ where: { slug } });
    return res.json({ message: "Category deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete category." });
  }
};
