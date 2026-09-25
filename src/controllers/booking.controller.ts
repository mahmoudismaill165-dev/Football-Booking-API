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

    const bookings = await getUserBookings(req.user.id);

    return res.status(200).json({
      message: "Bookings fetched successfully",
      bookings,
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

    const bookings = await getOwnerBookings(req.user.id);

    return res.status(200).json({
      message: "Owner bookings fetched successfully",
      bookings,
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