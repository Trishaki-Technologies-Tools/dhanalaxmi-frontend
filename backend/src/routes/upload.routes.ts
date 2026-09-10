import { Router } from "express";
import multer from "multer";
import { uploadImage, uploadMultipleImages } from "../controllers/upload.controller.js";
import { authenticate, requireAdmin } from "../middlewares/auth.js";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit per file
  },
});

router.post("/", authenticate, requireAdmin, upload.single("image"), uploadImage);
router.post("/multiple", authenticate, requireAdmin, upload.array("images", 50), uploadMultipleImages);

export default router;
