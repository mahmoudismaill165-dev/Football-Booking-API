import { db } from "../prisma/db.js";
import { ApiError } from "../utils/ApiError.js";
import { createNotification } from "./notification.service.js";

interface CreateBookingData {
  userId: number;
  fieldId: number;
  startTime: string;
  endTime: string;
}

interface BookingQueryOptions {
  page?: number;
  limit?: number;
  status?: string;
}

export async function createBooking(data: CreateBookingData) {
  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);

  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    throw new ApiError("Invalid start or end date format", 400);
  }

  if (endTime <= startTime) {
    throw new ApiError(
      "End time must be after start time",
      400
    );
  }

  if (startTime < new Date()) {
    throw new ApiError(
      "Cannot create a booking in the past",
      400
    );
  }

  // Execute within transaction for atomic isolation & advisory lock concurrency control
  return await db.transaction(async (tx) => {
    // Acquire PostgreSQL transaction-level advisory lock on fieldId to prevent race conditions
    try {
      await db.raw.sql`SELECT pg_advisory_xact_lock(${data.fieldId})`.affectedCount();
    } catch {
      // Fallback if database target does not support advisory locks
    }

    const field = await tx.orm.public.Field
      .where({ id: data.fieldId })
      .first();

    if (!field) {
      throw new ApiError(
        "Field not found",
        404
      );
    }

    const existingBookings = await tx.orm.public.Booking
      .where({ fieldId: data.fieldId })
      .all();

    const hasConflict = existingBookings.some((booking) => {
      // Ignore cancelled bookings
      if (booking.status === "CANCELLED") return false;

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

    const booking = await tx.orm.public.Booking.create({
      userId: data.userId,
      fieldId: data.fieldId,
      startTime: data.startTime,
      endTime: data.endTime,
      totalPrice,
      status: "PENDING",
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
  });
}

export async function getUserBookings(userId: number, options: BookingQueryOptions = {}) {
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, Math.min(100, options.limit || 20));
  const skip = (page - 1) * limit;

  let allBookings = await db.orm.public.Booking
    .where({ userId })
    .all();

  if (options.status) {
    allBookings = allBookings.filter((b) => b.status === options.status);
  }

  // Sort descending by startTime
  allBookings.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const total = allBookings.length;
  const paginatedBookings = allBookings.slice(skip, skip + limit);

  return {
    data: paginatedBookings,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getOwnerBookings(ownerId: number, options: BookingQueryOptions = {}) {
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, Math.min(100, options.limit || 20));
  const skip = (page - 1) * limit;

  const fields = await db.orm.public.Field
    .where({ ownerId })
    .all();

  if (fields.length === 0) {
    return {
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }

  const fieldIds = fields.map((field) => field.id);

  let allBookings = await db.orm.public.Booking
    .where((booking) =>
      booking.fieldId.in(fieldIds)
    )
    .all();

  if (options.status) {
    allBookings = allBookings.filter((b) => b.status === options.status);
  }

  // Sort descending by startTime
  allBookings.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const total = allBookings.length;
  const paginatedBookings = allBookings.slice(skip, skip + limit);

  return {
    data: paginatedBookings,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
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

  // Cancellation Policy: Players cannot cancel less than 2 hours before match start time
  if (role === "PLAYER") {
    const bookingStart = new Date(booking.startTime).getTime();
    const now = Date.now();
    const hoursDifference = (bookingStart - now) / (1000 * 60 * 60);

    if (hoursDifference < 2 && hoursDifference > 0) {
      throw new ApiError(
        "Bookings cannot be cancelled less than 2 hours before the start time",
        400
      );
    }
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