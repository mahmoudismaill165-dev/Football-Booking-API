import { Router } from "express";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { createBookingSchema } from "../validators/booking.validator.js";

import {
  createBookingController,
  getUserBookingsController,
  getOwnerBookingsController,
  confirmBookingController,
  cancelBookingController,
} from "../controllers/booking.controller.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  getUserBookingsController
);
router.get(
  "/owner",
  authMiddleware,
  authorizeRoles("OWNER"),
  getOwnerBookingsController
);
router.patch(
  "/:id/confirm",
  authMiddleware,
  authorizeRoles("OWNER"),
  confirmBookingController
);
router.patch(
  "/:id/cancel",
  authMiddleware,
  cancelBookingController
);
router.post(
  "/",
  authMiddleware,
  validate(createBookingSchema),
  createBookingController
);

export default router;