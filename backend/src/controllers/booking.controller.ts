import { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createBooking,
  getUserBookings,
  getOwnerBookings,
  confirmBooking,
  cancelBooking,
} from "../services/booking.service.js";

export const createBookingController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const booking = await createBooking({
      userId: req.user.id,
      fieldId: req.body.fieldId,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
    });

    return res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  }
);

export const getUserBookingsController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const status = req.query.status as string | undefined;

    const result = await getUserBookings(req.user.id, { page, limit, status });

    return res.status(200).json({
      message: "Bookings fetched successfully",
      bookings: result.data,
      ...result,
    });
  }
);
export const getOwnerBookingsController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const status = req.query.status as string | undefined;

    const result = await getOwnerBookings(req.user.id, { page, limit, status });

    return res.status(200).json({
      message: "Owner bookings fetched successfully",
      bookings: result.data,
      ...result,
    });
  }
);
export const confirmBookingController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const bookingId = Number(req.params.id);

    if (Number.isNaN(bookingId)) {
      return res.status(400).json({
        message: "Invalid booking ID",
      });
    }

    const booking = await confirmBooking(
      bookingId,
      req.user.id
    );

    return res.status(200).json({
      message: "Booking confirmed successfully",
      booking,
    });
  }
);
export const cancelBookingController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const bookingId = Number(req.params.id);

    if (Number.isNaN(bookingId)) {
      return res.status(400).json({
        message: "Invalid booking ID",
      });
    }

    const booking = await cancelBooking(
      bookingId,
      req.user.id,
      req.user.role
    );

    return res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  }
);