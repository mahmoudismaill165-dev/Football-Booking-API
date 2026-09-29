import { db } from "../prisma/db.js";
import { ApiError } from "../utils/ApiError.js";
import { createNotification } from "./notification.service.js";

interface CreateReviewData {
  userId: number;
  fieldId: number;
  rating: number;
  comment?: string;
}

export async function createReview(
  data: CreateReviewData
) {
  const field = await db.orm.public.Field
    .where({ id: data.fieldId })
    .first();

  if (!field) {
    throw new ApiError(
      "Field not found",
      404
    );
  }

  const bookings = await db.orm.public.Booking
    .where({
      userId: data.userId,
      fieldId: data.fieldId,
    })
    .all();

  const completedBooking = bookings.find(
    (booking) => booking.status === "COMPLETED"
  );

  if (!completedBooking) {
    throw new ApiError(
      "You can only review a field after completing a booking",
      403
    );
  }

  const existingReview =
    await db.orm.public.Review
      .where({
        userId: data.userId,
        fieldId: data.fieldId,
      })
      .first();

  if (existingReview) {
    throw new ApiError(
      "You have already reviewed this field",
      400
    );
  }

  if (data.rating < 1 || data.rating > 5) {
    throw new ApiError(
      "Rating must be between 1 and 5",
      400
    );
  }

  const review = await db.orm.public.Review.create({
    userId: data.userId,
    fieldId: data.fieldId,
    rating: data.rating,
    comment: data.comment,
  });

  await createNotification(
    field.ownerId,
    "New Review",
    `A player has left a ${data.rating}/5 review for ${field.name}.`
  );

  return review;
}

export async function getFieldReviews(
  fieldId: number
) {
  const field = await db.orm.public.Field
    .where({ id: fieldId })
    .first();

  if (!field) {
    throw new ApiError(
      "Field not found",
      404
    );
  }

  const reviews = await db.orm.public.Review
    .where({ fieldId })
    .all();

  const reviewsWithUsers = await Promise.all(
    reviews.map(async (review) => {
      const user = await db.orm.public.User
        .where({ id: review.userId })
        .first();

      return {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        user: user
          ? {
              id: user.id,
              name: user.name,
            }
          : null,
      };
    })
  );

  const totalReviews = reviewsWithUsers.length;

  const averageRating =
    totalReviews === 0
      ? 0
      : reviewsWithUsers.reduce(
          (sum, review) => sum + review.rating,
          0
        ) / totalReviews;

  return {
    averageRating: Number(
      averageRating.toFixed(1)
    ),
    totalReviews,
    reviews: reviewsWithUsers,
  };
}

export async function deleteReview(
  reviewId: number,
  userId: number,
  role: string
) {
  const review = await db.orm.public.Review
    .where({ id: reviewId })
    .first();

  if (!review) {
    throw new ApiError(
      "Review not found",
      404
    );
  }

  if (
    role !== "ADMIN" &&
    review.userId !== userId
  ) {
    throw new ApiError(
      "You are not allowed to delete this review",
      403
    );
  }

  await db.orm.public.Review
    .where({ id: reviewId })
    .delete();

  return review;
}

export async function updateReview(
  reviewId: number,
  userId: number,
  role: string,
  rating?: number,
  comment?: string
) {
  const review = await db.orm.public.Review
    .where({ id: reviewId })
    .first();

  if (!review) {
    throw new ApiError(
      "Review not found",
      404
    );
  }

  if (
    role !== "ADMIN" &&
    review.userId !== userId
  ) {
    throw new ApiError(
      "You are not allowed to update this review",
      403
    );
  }

  if (
    rating !== undefined &&
    (rating < 1 || rating > 5)
  ) {
    throw new ApiError(
      "Rating must be between 1 and 5",
      400
    );
  }

  const updatedReview =
    await db.orm.public.Review
      .where({ id: reviewId })
      .update({
        rating: rating ?? review.rating,
        comment: comment ?? review.comment,
      });

  return updatedReview;
}

export async function getAllReviews() {
  const reviews =
    await db.orm.public.Review.all();

  return reviews;
}