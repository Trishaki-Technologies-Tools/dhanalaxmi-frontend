import { Request, Response } from "express";
import { uploadToR2 } from "../config/r2.js";

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided." });
    }

    const { buffer, originalname, mimetype } = req.file;

    // Validate file type
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
    if (!allowedMimeTypes.includes(mimetype)) {
      return res.status(400).json({
        message: "Invalid file type. Only JPEG, PNG, WEBP, GIF, and AVIF images are allowed.",
      });
    }

    // Upload to Cloudflare R2
    const imageUrl = await uploadToR2(buffer, originalname, mimetype);

    return res.status(200).json({
      message: "Image uploaded successfully to Cloudflare R2",
      url: imageUrl,
    });
  } catch (error) {
    console.error("Cloudflare R2 Upload Error:", error);
    return res.status(500).json({
      message: "Failed to upload image to Cloudflare R2.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
