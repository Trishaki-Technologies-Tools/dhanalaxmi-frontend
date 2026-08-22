import { Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middlewares/auth.js";

export const getAddresses = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "asc" },
    });

    return res.json({ addresses });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch addresses." });
  }
};

export const createAddress = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { label, name, phone, address, city, pincode, isDefault } = req.body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: req.user.id,
        label,
        name,
        phone,
        address,
        city,
        pincode,
        isDefault: isDefault || false,
      },
    });

    return res.status(201).json({ address: newAddress });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create address." });
  }
};

export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const { label, name, phone, address, city, pincode, isDefault } = req.body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id: Number(id), userId: req.user.id },
      data: {
        label,
        name,
        phone,
        address,
        city,
        pincode,
        ...(isDefault !== undefined && { isDefault }),
      },
    });

    return res.json({ address: updatedAddress });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update address." });
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;

    await prisma.address.delete({
      where: { id: Number(id), userId: req.user.id },
    });

    return res.json({ message: "Address deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete address." });
  }
};
