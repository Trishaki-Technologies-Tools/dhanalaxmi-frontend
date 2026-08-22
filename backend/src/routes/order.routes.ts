import { Router } from "express";
import {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  getAnalytics,
} from "../controllers/order.controller.js";
import { authenticate, requireAdmin, optionalAuthenticate } from "../middlewares/auth.js";

const router = Router();

router.post("/", optionalAuthenticate, createOrder);
router.get("/user", authenticate, getUserOrders);
router.get("/track/:identifier", getOrderById);
router.get("/admin/analytics", authenticate, requireAdmin, getAnalytics);
router.get("/admin/all", authenticate, requireAdmin, getAllOrdersAdmin);
router.put("/admin/:id", authenticate, requireAdmin, updateOrderStatusAdmin);

export default router;
