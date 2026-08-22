import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth.js";
import {
  getProductReviews,
  createReview,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
} from "../controllers/review.controller.js";

const router = Router();

// Public
router.get("/product/:productId", getProductReviews);

// Customer
router.post("/", authenticate, createReview);

// Admin
router.get("/admin/all", authenticate, requireAdmin, getAllReviews);
router.put("/:id/status", authenticate, requireAdmin, updateReviewStatus);
router.delete("/:id", authenticate, requireAdmin, deleteReview);

export default router;
