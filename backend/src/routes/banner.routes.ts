import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth.js";
import {
  getBannersAndPromos,
  createBanner,
  updateBanner,
  deleteBanner,
  createPromo,
  updatePromo,
  deletePromo,
} from "../controllers/banner.controller.js";

const router = Router();

router.get("/", getBannersAndPromos);

// Banners
router.post("/banner", authenticate, requireAdmin, createBanner);
router.put("/banner/:id", authenticate, requireAdmin, updateBanner);
router.delete("/banner/:id", authenticate, requireAdmin, deleteBanner);

// Promos
router.post("/promo", authenticate, requireAdmin, createPromo);
router.put("/promo/:id", authenticate, requireAdmin, updatePromo);
router.delete("/promo/:id", authenticate, requireAdmin, deletePromo);

export default router;
