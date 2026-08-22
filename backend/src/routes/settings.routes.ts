import { Router } from "express";
import { getSilverRate, updateSilverRate } from "../controllers/settings.controller.js";
import { authenticate, requireAdmin } from "../middlewares/auth.js";

const router = Router();

router.get("/silver-rate", getSilverRate);
router.post("/silver-rate", authenticate, requireAdmin, updateSilverRate);

export default router;
