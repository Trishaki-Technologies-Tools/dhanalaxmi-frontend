import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middlewares/auth.js";

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      paymentMethod,
      items,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart items cannot be empty." });
    }

    const orderNumber = `DSL-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    let totalAmount = 0;
    const orderItemsData = items.map((item: any) => {
      const itemTotal = Number(item.price) * Number(item.quantity);
      totalAmount += itemTotal;
      return {
        productId: item.productId || null,
        productName: item.productName,
        productSlug: item.productSlug,
        productImage: item.productImage,
        price: Number(item.price),
        quantity: Number(item.quantity),
        total: itemTotal,
      };
    });

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: req.user?.id || null,
        customerName,
        customerEmail,
        customerPhone,
        addressLine1,
        addressLine2: addressLine2 || null,
        city,
        state,
        pincode,
        totalAmount,
        paymentMethod: paymentMethod || "COD",
        paymentStatus: paymentMethod === "COD" ? "PENDING" : "PAID",
        status: "PROCESSING",
        items: {
          create: orderItemsData,
        },
      },
      include: { items: true },
    });

    return res.status(201).json({ order });
  } catch (error) {
    console.error("createOrder Error:", error);
    return res.status(500).json({ message: "Failed to place order." });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const identifier = String(req.params.identifier);

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: identifier },
          { id: isNaN(Number(identifier)) ? undefined : Number(identifier) },
        ],
      },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    return res.json({ order });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch order." });
  }
};

export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ orders });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user orders." });
  }
};

export const getAllOrdersAdmin = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ orders });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch all orders." });
  }
};

export const updateOrderStatusAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, paymentStatus } = req.body;

    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: {
        ...(status && { status }),
        ...(trackingNumber !== undefined && { trackingNumber }),
        ...(paymentStatus && { paymentStatus }),
      },
    });

    return res.json({ order });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update order status." });
  }
};

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: { not: "CANCELLED" } },
      select: { totalAmount: true, createdAt: true },
      orderBy: { createdAt: "asc" }
    });

    const revenueByDay: Record<string, number> = {};
    let totalRevenue = 0;
    
    orders.forEach(order => {
      const day = order.createdAt.toISOString().split("T")[0]!;
      const amt = Number(order.totalAmount);
      revenueByDay[day] = (revenueByDay[day] || 0) + amt;
      totalRevenue += amt;
    });

    const chartData = Object.entries(revenueByDay).map(([date, revenue]) => ({
      date,
      revenue
    }));

    return res.json({ 
      totalRevenue,
      totalOrders: orders.length,
      averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
      chartData
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    return res.status(500).json({ message: "Failed to fetch analytics." });
  }
};
