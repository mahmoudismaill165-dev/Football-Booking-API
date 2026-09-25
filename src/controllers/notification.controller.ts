import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import {
  getUserNotifications,
  markNotificationAsRead,
} from "../services/notification.service.js";

export const getNotifications = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const notifications = await getUserNotifications(
      req.user!.id
    );

    return res.status(200).json({
      message: "Notifications fetched successfully",
      notifications,
    });
  }
);

export const markAsRead = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const notification = await markNotificationAsRead(
      Number(req.params.id),
      req.user!.id
    );

    return res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  }
);