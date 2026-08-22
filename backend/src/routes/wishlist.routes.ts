import { Router } from "express";
import { getWishlist, toggleWishlistItem } from "../controllers/wishlist.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", getWishlist);
router.post("/toggle", toggleWishlistItem);

export default router;
