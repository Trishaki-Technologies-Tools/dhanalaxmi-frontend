import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middlewares/auth.js";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "Email, password, and name are required." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "User with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        role: "CUSTOMER",
      },
      select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "dhanalaxmi_secret",
      { expiresIn: "7d" }
    );

    return res.status(201).json({ user, token });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Internal server error during registration." });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "dhanalaxmi_secret",
      { expiresIn: "7d" }
    );

    const { password: _, ...userWithoutPassword } = user;

    return res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal server error during login." });
  }
};

export const loginOtp = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required." });
    }

    let user = await prisma.user.findFirst({ where: { phone } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: `Customer ${phone.slice(-4)}`,
          phone,
          role: "CUSTOMER",
        },
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "dhanalaxmi_secret",
      { expiresIn: "7d" }
    );

    const { password: _, ...userWithoutPassword } = user;

    return res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("OTP Login Error:", error);
    return res.status(500).json({ message: "Internal server error during OTP login." });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, phone: true, birthday: true, role: true, createdAt: true, addresses: true, wishlist: { include: { product: true } } },
    });

    if (!user) return res.status(404).json({ message: "User not found." });

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching profile." });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { name, email, birthday } = req.body;
    let birthdayDate = null;
    if (birthday) {
      birthdayDate = new Date(birthday);
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name !== undefined ? name : undefined,
        email: email !== undefined ? email : undefined,
        birthday: birthdayDate !== undefined ? birthdayDate : undefined,
      },
      select: { id: true, email: true, name: true, phone: true, birthday: true, role: true, createdAt: true, addresses: true, wishlist: { include: { product: true } } },
    });

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Error updating profile." });
  }
};
