import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
  createReviewController,
  getFieldReviewsController,
  deleteReviewController,
  updateReviewController,
  getAllReviewsController,
} from "../controllers/review.controller.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  createReviewController
);

router.get(
  "/field/:fieldId",
  getFieldReviewsController
);
router.delete(
  "/:id",
  authMiddleware,
  deleteReviewController
);
router.patch(
  "/:id",
  authMiddleware,
  updateReviewController
);
router.get(
  "/admin/all",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getAllReviewsController
);
export default router;