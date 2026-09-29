import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  getNotifications,
  markAsRead,
} from "../controllers/notification.controller.js";

const router = Router();

router.get("/", authMiddleware, getNotifications);

router.patch("/:id/read", authMiddleware, markAsRead);

export default router;