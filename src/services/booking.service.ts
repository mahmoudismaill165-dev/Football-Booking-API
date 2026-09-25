import { db } from "../prisma/db.js";
import { ApiError } from "../utils/ApiError.js";
import { createNotification } from "./notification.service.js";

interface CreateBookingData {
  userId: number;
  fieldId: number;
  startTime: string;
  endTime: string;
}

export async function createBooking(data: CreateBookingData) {
  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);

  if (endTime <= startTime) {
    throw new ApiError(
      "End time must be after start time",
      400
    );
  }

  const field = await db.orm.public.Field
    .where({ id: data.fieldId })
    .first();

  if (!field) {
    throw new ApiError(
      "Field not found",
      404
    );
  }

  const existingBookings = await db.orm.public.Booking
    .where({ fieldId: data.fieldId })
    .all();

  const hasConflict = existingBookings.some((booking) => {
    const existingStart = new Date(booking.startTime);
    const existingEnd = new Date(booking.endTime);

    return (
      startTime < existingEnd &&
      endTime > existingStart
    );
  });

  if (hasConflict) {
    throw new ApiError(
      "Field is already booked during this time",
      409
    );
  }

  const durationInHours =
    (endTime.getTime() - startTime.getTime()) /
    (1000 * 60 * 60);

  const totalPrice =
    durationInHours * field.pricePerHour;

  const booking = await db.orm.public.Booking.create({
    userId: data.userId,
    fieldId: data.fieldId,
    startTime: data.startTime,
    endTime: data.endTime,
    totalPrice,
  });

  // Notification for player
  await createNotification(
    data.userId,
    "Booking Created",
    `Your booking for ${field.name} has been created successfully and is waiting for confirmation.`
  );

  // Notification for field owner
  await createNotification(
    field.ownerId,
    "New Booking",
    `You have a new booking for ${field.name}.`
  );

  return booking;
}

export async function getUserBookings(userId: number) {
  const bookings = await db.orm.public.Booking
    .where({ userId })
    .all();

  return bookings;
}

export async function getOwnerBookings(ownerId: number) {
  const fields = await db.orm.public.Field
    .where({ ownerId })
    .all();

  if (fields.length === 0) {
    return [];
  }

  const fieldIds = fields.map((field) => field.id);

  const bookings = await db.orm.public.Booking
    .where((booking) =>
      booking.fieldId.in(fieldIds)
    )
    .all();

  return bookings;
}

export async function confirmBooking(
  bookingId: number,
  ownerId: number
) {
  const booking = await db.orm.public.Booking
    .where({ id: bookingId })
    .first();

  if (!booking) {
    throw new ApiError(
      "Booking not found",
      404
    );
  }

  const field = await db.orm.public.Field
    .where({ id: booking.fieldId })
    .first();

  if (!field) {
    throw new ApiError(
      "Field not found",
      404
    );
  }

  if (field.ownerId !== ownerId) {
    throw new ApiError(
      "You are not allowed to confirm this booking",
      403
    );
  }

  if (booking.status !== "PENDING") {
    throw new ApiError(
      "Only pending bookings can be confirmed",
      400
    );
  }

  const updatedBooking =
    await db.orm.public.Booking
      .where({ id: booking.id })
      .update({
        status: "CONFIRMED",
      });

  // Notification for player
  await createNotification(
    booking.userId,
    "Booking Confirmed",
    `Your booking for ${field.name} has been confirmed successfully.`
  );

  return updatedBooking;
}

export async function cancelBooking(
  bookingId: number,
  userId: number,
  role: string
) {
  const booking = await db.orm.public.Booking
    .where({ id: bookingId })
    .first();

  if (!booking) {
    throw new ApiError(
      "Booking not found",
      404
    );
  }

  const field = await db.orm.public.Field
    .where({ id: booking.fieldId })
    .first();

  if (!field) {
    throw new ApiError(
      "Field not found",
      404
    );
  }

  // PLAYER can cancel only his own booking
  if (role === "PLAYER" && booking.userId !== userId) {
    throw new ApiError(
      "You are not allowed to cancel this booking",
      403
    );
  }

  // OWNER can cancel only bookings for his own field
  if (role === "OWNER") {
    if (field.ownerId !== userId) {
      throw new ApiError(
        "You are not allowed to cancel this booking",
        403
      );
    }
  }

  if (booking.status === "CANCELLED") {
    throw new ApiError(
      "Booking is already cancelled",
      400
    );
  }

  const updatedBooking =
    await db.orm.public.Booking
      .where({ id: booking.id })
      .update({
        status: "CANCELLED",
      });

  // Player cancelled the booking
  if (role === "PLAYER") {
    await createNotification(
      field.ownerId,
      "Booking Cancelled",
      `A booking for ${field.name} has been cancelled by the player.`
    );
  }

  // Owner cancelled the booking
  if (role === "OWNER") {
    await createNotification(
      booking.userId,
      "Booking Cancelled",
      `Your booking for ${field.name} has been cancelled by the field owner.`
    );
  }

  return updatedBooking;
}