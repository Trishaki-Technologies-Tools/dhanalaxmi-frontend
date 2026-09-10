import { Router } from "express";
import {
  register,
  login,
  loginOtp,
  sendOtp,
  verifyOtp,
  getProfile,
  updateProfile,
  getAllCustomers,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/login-otp", loginOtp);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);
router.get("/customers", getAllCustomers);

export default router;
