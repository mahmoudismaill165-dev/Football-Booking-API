import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import {
  createReview,
  getFieldReviews,
  deleteReview,
  updateReview,
  getAllReviews,
} from "../services/review.service.js";

export async function createReviewController(
  req: AuthRequest,
  res: Response
) {
  const review = await createReview({
    userId: req.user!.id,
    fieldId: Number(req.body.fieldId),
    rating: Number(req.body.rating),
    comment: req.body.comment,
  });

  res.status(201).json({
    message: "Review created successfully",
    review,
  });
}

export async function getFieldReviewsController(
  req: AuthRequest,
  res: Response
) {
  const result = await getFieldReviews(
    Number(req.params.fieldId)
  );

  res.status(200).json({
    message: "Reviews fetched successfully",
    averageRating: result.averageRating,
    totalReviews: result.totalReviews,
    reviews: result.reviews,
  });
}
export async function deleteReviewController(
  req: AuthRequest,
  res: Response
) {
  const review = await deleteReview(
    Number(req.params.id),
    req.user!.id,
    req.user!.role
  );

  res.status(200).json({
    message: "Review deleted successfully",
    review,
  });
}
export async function updateReviewController(
  req: AuthRequest,
  res: Response
) {
  const review = await updateReview(
    Number(req.params.id),
    req.user!.id,
    req.user!.role,
    req.body.rating !== undefined
      ? Number(req.body.rating)
      : undefined,
    req.body.comment
  );

  res.status(200).json({
    message: "Review updated successfully",
    review,
  });
}
export async function getAllReviewsController(
  req: AuthRequest,
  res: Response
) {
  const reviews = await getAllReviews();

  res.status(200).json({
    message: "All reviews fetched successfully",
    reviews,
  });
}