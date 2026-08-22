import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth.js";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

const router = Router();

router.get("/", getCategories);
router.post("/", authenticate, requireAdmin, createCategory);
router.put("/:slug", authenticate, requireAdmin, updateCategory);
router.delete("/:slug", authenticate, requireAdmin, deleteCategory);

export default router;
