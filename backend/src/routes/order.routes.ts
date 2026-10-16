import { Router } from "express";
import {
  createOrder,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getOrderById,
  getUserOrders,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  cancelOrderCustomer,
  getAnalytics,
} from "../controllers/order.controller.js";
import { authenticate, requireAdmin, optionalAuthenticate } from "../middlewares/auth.js";

const router = Router();

router.post("/", optionalAuthenticate, createOrder);
router.post("/razorpay/create-order", optionalAuthenticate, createRazorpayOrder);
router.post("/razorpay/verify", optionalAuthenticate, verifyRazorpayPayment);
router.get("/user", authenticate, getUserOrders);
router.get("/track/:identifier", getOrderById);
router.put("/:identifier/cancel", optionalAuthenticate, cancelOrderCustomer);
router.get("/admin/analytics", authenticate, requireAdmin, getAnalytics);
router.get("/admin/all", authenticate, requireAdmin, getAllOrdersAdmin);
router.put("/admin/:id", authenticate, requireAdmin, updateOrderStatusAdmin);

export default router;
