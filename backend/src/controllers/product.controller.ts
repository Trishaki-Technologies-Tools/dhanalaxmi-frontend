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
      const grandTotal = Math.round(subtotal * 1.03);
      return {
        ...p,
        price: grandTotal,
        mrp: Math.round(grandTotal * 1.2),
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
    const grandTotal = Math.round(subtotal * 1.03);

    return res.json({ 
      product: {
        ...product,
        price: grandTotal,
        mrp: Math.round(grandTotal * 1.2),
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
    const resolvedCategorySlug = categorySlug || req.body.category || "rings";

    const setting = await prisma.systemSetting.findUnique({ where: { key: "silverRate" } });
    const silverRate = setting ? Number(setting.value) : 100;
    const computedPrice = Math.round((Number(weight || 0) * silverRate + Number(weight || 0) * Number(makingCharges || 0)) * 1.03);

    const existing = await prisma.product.findUnique({ where: { slug: generatedSlug } });

    const payload: any = {
      name,
      slug: generatedSlug,
      categorySlug: resolvedCategorySlug,
      categoryLabel: categoryLabel || resolvedCategorySlug,
      price: Number(price) || computedPrice,
      mrp: Number(mrp) || computedPrice * 1.2,
      makingCharges: Number(makingCharges) || 0,
      image: image || "",
      weight: Number(weight) || 0,
      metal: metal || "925 Sterling Silver",
      occasion: occasion || "Everyday",
      collection: collection || "Signature",
      badge: badge || null,
      stock: Number(stock) || 0,
      description: description || "",
    };

    let product;
    if (existing) {
      product = await prisma.product.update({
        where: { id: existing.id },
        data: payload,
      });
    } else {
      product = await prisma.product.create({
        data: payload,
      });
    }

    return res.status(201).json({ product });
  } catch (error) {
    console.error("createProduct Error:", error);
    return res.status(500).json({ message: "Failed to create or update product." });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isNum = !isNaN(Number(id));
    const where = isNum ? { id: Number(id) } : { slug: String(id) };

    const {
      name,
      slug,
      category,
      categorySlug,
      categoryLabel,
      price,
      mrp,
      makingCharges,
      image,
      weight,
      metal,
      occasion,
      collection,
      badge,
      stock,
      description,
      popularity,
      isFeatured,
    } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (categorySlug !== undefined) updateData.categorySlug = categorySlug;
    else if (category !== undefined) updateData.categorySlug = category;
    if (categoryLabel !== undefined) updateData.categoryLabel = categoryLabel;
    if (price !== undefined) updateData.price = Number(price);
    if (mrp !== undefined) updateData.mrp = Number(mrp);
    if (makingCharges !== undefined) updateData.makingCharges = Number(makingCharges);
    if (image !== undefined) updateData.image = image;
    if (weight !== undefined) updateData.weight = Number(weight);
    if (metal !== undefined) updateData.metal = metal;
    if (occasion !== undefined) updateData.occasion = occasion;
    if (collection !== undefined) updateData.collection = collection;
    if (badge !== undefined) updateData.badge = badge;
    if (stock !== undefined) updateData.stock = Number(stock);
    if (description !== undefined) updateData.description = description;
    if (popularity !== undefined) updateData.popularity = Number(popularity);
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);

    const product = await prisma.product.update({
      where,
      data: updateData,
    });

    return res.json({ product });
  } catch (error) {
    console.error("updateProduct Error:", error);
    return res.status(500).json({ message: "Failed to update product." });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isNum = !isNaN(Number(id));
    const where = isNum ? { id: Number(id) } : { slug: String(id) };
    await prisma.product.delete({ where });
    return res.json({ message: "Product deleted successfully." });
  } catch (error) {
    console.error("deleteProduct Error:", error);
    return res.status(500).json({ message: "Failed to delete product." });
  }
};
