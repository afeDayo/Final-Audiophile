// Order endpoints - some public, some require login

import express from "express";
import {
  createOrder,
  getOrderById,
  getUserOrders,
} from "../controllers/orderController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// POST /api/orders -> place an order (guests and logged-in users)
// We use "protect" optionally - if token exists, we attach userId; if not, its a guest order
router.post("/", createOrder);

// GET /api/orders/my-orders -> user uses their own orders (login required)
router.get("my-orders", protect, getUserOrders);

// GET /api/orders/:id -> view a specific order
router.get("/:id", protect, getOrderById);

export default router;
