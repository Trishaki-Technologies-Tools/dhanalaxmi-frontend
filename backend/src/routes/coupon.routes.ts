import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth.js";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from "../controllers/coupon.controller.js";

const router = Router();

router.post("/validate", validateCoupon); // Public endpoint for checkout

router.get("/", authenticate, requireAdmin, getCoupons);
router.post("/", authenticate, requireAdmin, createCoupon);
router.put("/:id", authenticate, requireAdmin, updateCoupon);
router.delete("/:id", authenticate, requireAdmin, deleteCoupon);

export default router;
