import { db } from "../prisma/db.js";
import { ApiError } from "../utils/ApiError.js";

export async function createNotification(
  userId: number,
  title: string,
  message: string
) {
  return await db.orm.public.Notification.create({
    userId,
    title,
    message,
  });
}

export async function getUserNotifications(
  userId: number
) {
  return await db.orm.public.Notification
    .where({ userId })
    .all();
}

export async function markNotificationAsRead(
  notificationId: number,
  userId: number
) {
  const notification =
    await db.orm.public.Notification
      .where({
        id: notificationId,
        userId,
      })
      .first();

  if (!notification) {
    throw new ApiError(
      "Notification not found",
      404
    );
  }

  return await db.orm.public.Notification
    .where({
      id: notificationId,
      userId,
    })
    .update({
      isRead: true,
    });
}