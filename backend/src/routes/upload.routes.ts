import { Router } from "express";
import multer from "multer";
import { uploadImage } from "../controllers/upload.controller.js";
import { authenticate, requireAdmin } from "../middlewares/auth.js";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
});

router.post("/", authenticate, requireAdmin, upload.single("image"), uploadImage);

export default router;
