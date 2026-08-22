import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category, occasion, collection, search, minPrice, maxPrice, sort } = req.query;

    const where: any = {};

    if (category) where.categorySlug = String(category);
    if (occasion) where.occasion = String(occasion);
    if (collection) where.collection = String(collection);
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-low") orderBy = { price: "asc" };
    if (sort === "price-high") orderBy = { price: "desc" };
    if (sort === "popularity") orderBy = { popularity: "desc" };
    if (sort === "rating") orderBy = { rating: "desc" };

    const products = await prisma.product.findMany({
      where,
      orderBy,
    });

    const setting = await prisma.systemSetting.findUnique({ where: { key: "silverRate" } });
    const silverRate = setting ? Number(setting.value) : 100;

    const computedProducts = products.map((p) => {
      const subtotal = p.weight * silverRate + p.weight * Number(p.makingCharges);
      const grandTotal = subtotal * 1.05;
      return {
        ...p,
        price: grandTotal,
        mrp: grandTotal * 1.2, // MRP could be arbitrarily higher, e.g. 20% more for display
      };
    });

    // If there is minPrice/maxPrice filtering or sorting, doing it on the JS side is required if based on computed price
    let filteredProducts = computedProducts;
    if (minPrice || maxPrice) {
      filteredProducts = filteredProducts.filter((p) => {
        if (minPrice && p.price < Number(minPrice)) return false;
        if (maxPrice && p.price > Number(maxPrice)) return false;
        return true;
      });
    }

    if (sort === "price-low") filteredProducts.sort((a, b) => a.price - b.price);
    if (sort === "price-high") filteredProducts.sort((a, b) => b.price - a.price);

    return res.json({ products: filteredProducts });
  } catch (error) {
    console.error("getProducts Error:", error);
    return res.status(500).json({ message: "Failed to fetch products." });
  }
};

export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug);
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { reviews: { orderBy: { createdAt: "desc" } } },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const setting = await prisma.systemSetting.findUnique({ where: { key: "silverRate" } });
    const silverRate = setting ? Number(setting.value) : 100;

    const subtotal = product.weight * silverRate + product.weight * Number(product.makingCharges);
    const grandTotal = subtotal * 1.05;

    return res.json({ 
      product: {
        ...product,
        price: grandTotal,
        mrp: grandTotal * 1.2,
      } 
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch product details." });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      slug,
      categorySlug,
      categoryLabel,
      price,
      mrp,
      image,
      weight,
      makingCharges,
      metal,
      occasion,
      collection,
      badge,
      stock,
      description,
    } = req.body;

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const resolvedCategorySlug = categorySlug || req.body.category;

    const setting = await prisma.systemSetting.findUnique({ where: { key: "silverRate" } });
    const silverRate = setting ? Number(setting.value) : 100;
    const computedPrice = (Number(weight) * silverRate + Number(weight) * Number(makingCharges || 0)) * 1.05;

    const product = await prisma.product.create({
      data: {
        name,
        slug: generatedSlug,
        categorySlug: resolvedCategorySlug,
        categoryLabel: categoryLabel || resolvedCategorySlug,
        price: Number(price) || computedPrice,
        mrp: Number(mrp) || computedPrice * 1.2,
        makingCharges: Number(makingCharges) || 0,
        image,
        weight: Number(weight),
        metal: metal || "925 Sterling Silver",
        occasion: occasion || "Everyday",
        collection: collection || "Signature",
        badge: badge || null,
        stock: Number(stock) || 10,
        description,
      },
    });

    return res.status(201).json({ product });
  } catch (error) {
    console.error("createProduct Error:", error);
    return res.status(500).json({ message: "Failed to create product." });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.mrp) updateData.mrp = Number(updateData.mrp);
    if (updateData.weight) updateData.weight = Number(updateData.weight);
    if (updateData.makingCharges !== undefined) updateData.makingCharges = Number(updateData.makingCharges);
    if (updateData.stock) updateData.stock = Number(updateData.stock);
    if (updateData.category) {
      updateData.categorySlug = updateData.category;
      delete updateData.category;
    }

    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return res.json({ product });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update product." });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id: Number(id) } });
    return res.json({ message: "Product deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete product." });
  }
};
