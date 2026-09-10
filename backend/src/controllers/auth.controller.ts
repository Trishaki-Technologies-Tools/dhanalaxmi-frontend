import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { AuthRequest } from "../middlewares/auth.js";
import { sendMsg91Otp } from "../services/sms.service.js";
import { validateIndianMobileNumber, checkOtpRateLimit } from "../utils/phone-validator.js";

// In-memory OTP storage with 10-minute expiry (phone -> { otp, expiresAt })
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

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
    const { phone, name } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required." });
    }

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    let user = await prisma.user.findFirst({ where: { phone: cleanPhone } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name && name.trim() ? name.trim() : `Customer ${cleanPhone.slice(-4)}`,
          phone: cleanPhone,
          role: "CUSTOMER",
        },
      });
    } else if (name && name.trim() && (user.name.startsWith("Customer ") || !user.name)) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name: name.trim() },
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "dhanalaxmi_secret",
      { expiresIn: "365d" }
    );

    const { password: _, ...userWithoutPassword } = user;

    return res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("OTP Login Error:", error);
    return res.status(500).json({ message: "Internal server error during OTP login." });
  }
};

export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    // 1. Strict Indian Mobile Validation (TRAI standards & anti-dummy check)
    const validation = validateIndianMobileNumber(phone);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.error || "Invalid mobile number." });
    }

    const cleanPhone = validation.cleanPhone;
    const rawForwarded = req.headers["x-forwarded-for"];
    const clientIp = typeof rawForwarded === "string"
      ? rawForwarded.split(",")[0]?.trim()
      : Array.isArray(rawForwarded)
      ? rawForwarded[0]?.trim()
      : req.socket.remoteAddress || req.ip;

    // 2. Anti-Bot & Dual Rate Limiter (by Phone & IP)
    const rateCheck = checkOtpRateLimit(cleanPhone, clientIp);
    if (!rateCheck.allowed) {
      return res.status(429).json({ message: rateCheck.error, retryAfter: rateCheck.retryAfterSeconds });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes validity
    otpStore.set(cleanPhone, { otp, expiresAt });

    const smsResult = await sendMsg91Otp(cleanPhone, otp);

    if (!smsResult.success) {
      console.error("[OTP] MSG91 SMS delivery failed:", smsResult.error);
      return res.status(500).json({ message: "Failed to send SMS OTP. Please try again." });
    }

    return res.json({ message: "OTP sent successfully to +91 " + cleanPhone });
  } catch (error: any) {
    console.error("[OTP] sendOtp error:", error);
    return res.status(500).json({ message: "Internal server error sending OTP." });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { phone, otp, name } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP are required." });
    }

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    const cleanOtp = otp.toString().trim();

    const record = otpStore.get(cleanPhone);
    if (!record) {
      return res.status(400).json({ message: "No active OTP found. Please request a new one." });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(cleanPhone);
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    if (record.otp !== cleanOtp) {
      return res.status(400).json({ message: "Incorrect OTP. Please check and try again." });
    }

    // OTP is valid - consume it
    otpStore.delete(cleanPhone);

    let user = await prisma.user.findFirst({ where: { phone: cleanPhone } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name && name.trim() ? name.trim() : `Customer ${cleanPhone.slice(-4)}`,
          phone: cleanPhone,
          role: "CUSTOMER",
        },
      });
    } else if (name && name.trim() && (user.name.startsWith("Customer ") || !user.name)) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name: name.trim() },
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "dhanalaxmi_secret",
      { expiresIn: "365d" }
    );

    const { password: _, ...userWithoutPassword } = user;
    return res.json({ user: userWithoutPassword, token, message: "Signed in successfully" });
  } catch (error) {
    console.error("[OTP] verifyOtp error:", error);
    return res.status(500).json({ message: "Internal server error verifying OTP." });
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
