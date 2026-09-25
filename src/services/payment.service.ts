import { db } from "../prisma/db.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadImage } from "./cloudinary.service.js";
import { createNotification } from "./notification.service.js";

interface CreatePaymentData {
  bookingId: number;
  method: string;
  transactionId?: string;
}

export async function createPayment(
  data: CreatePaymentData,
  userId: number
) {
  const booking = await db.orm.public.Booking
    .where({ id: data.bookingId })
    .first();

  if (!booking) {
    throw new ApiError(
      "Booking not found",
      404
    );
  }

  if (booking.userId !== userId) {
    throw new ApiError(
      "You are not allowed to pay for this booking",
      403
    );
  }

  if (booking.status === "CANCELLED") {
    throw new ApiError(
      "Cannot pay for a cancelled booking",
      400
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

  const payment = await db.orm.public.Payment.create({
    bookingId: booking.id,
    amount: booking.totalPrice,
    method: data.method,
    transactionId: data.transactionId,
  });

  await createNotification(
    field.ownerId,
    "New Payment",
    `A new payment has been submitted for a booking at ${field.name}.`
  );

  return payment;
}

export async function uploadPaymentProof(
  paymentId: number,
  userId: number,
  file: Express.Multer.File
) {
  const payment = await db.orm.public.Payment
    .where({ id: paymentId })
    .first();

  if (!payment) {
    throw new ApiError(
      "Payment not found",
      404
    );
  }

  const booking = await db.orm.public.Booking
    .where({ id: payment.bookingId })
    .first();

  if (!booking) {
    throw new ApiError(
      "Booking not found",
      404
    );
  }

  if (booking.userId !== userId) {
    throw new ApiError(
      "You are not allowed to upload proof for this payment",
      403
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

  const result = await uploadImage(
    file.buffer,
    "football-booking/payment-proofs"
  );

  const updatedPayment =
    await db.orm.public.Payment
      .where({ id: payment.id })
      .update({
        proofImage: result.secure_url,
      });

  await createNotification(
    field.ownerId,
    "Payment Proof Uploaded",
    `A payment proof has been uploaded for a booking at ${field.name}.`
  );

  return updatedPayment;
}

export async function verifyPayment(
  paymentId: number,
  ownerId: number,
  status: "VERIFIED" | "REJECTED"
) {
  const payment = await db.orm.public.Payment
    .where({ id: paymentId })
    .first();

  if (!payment) {
    throw new ApiError(
      "Payment not found",
      404
    );
  }

  const booking = await db.orm.public.Booking
    .where({ id: payment.bookingId })
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
      "You are not allowed to verify this payment",
      403
    );
  }

  if (payment.status !== "PENDING") {
    throw new ApiError(
      "Only pending payments can be verified",
      400
    );
  }

  const updatedPayment =
    await db.orm.public.Payment
      .where({ id: payment.id })
      .update({
        status,
      });

  if (status === "VERIFIED") {
    await db.orm.public.Booking
      .where({ id: booking.id })
      .update({
        status: "CONFIRMED",
      });

    await createNotification(
      booking.userId,
      "Payment Verified",
      `Your payment for ${field.name} has been verified successfully. Your booking is now confirmed.`
    );
  }

  if (status === "REJECTED") {
    await createNotification(
      booking.userId,
      "Payment Rejected",
      `Your payment for ${field.name} has been rejected. Please check your payment information and try again.`
    );
  }

  return updatedPayment;
}