import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { 
  createPayment,
  uploadPaymentProof,
  verifyPayment,
 } from "../services/payment.service.js";
import { ApiError } from "../utils/ApiError.js";

export async function createPaymentController(
  req: AuthRequest,
  res: Response
) {
  const payment = await createPayment(
    {
      bookingId: Number(req.body.bookingId),
      method: req.body.method,
      transactionId: req.body.transactionId,
    },
    req.user!.id
  );

  res.status(201).json({
    message: "Payment created successfully",
    payment,
  });
}
export async function uploadPaymentProofController(
  req: AuthRequest,
  res: Response
) {
  if (!req.file) {
    throw new ApiError(
      "Payment proof image is required",
      400
    );
  }

  const payment = await uploadPaymentProof(
    Number(req.params.id),
    req.user!.id,
    req.file
  );

  res.status(200).json({
    message: "Payment proof uploaded successfully",
    payment,
  });
}
export async function verifyPaymentController(
  req: AuthRequest,
  res: Response
) {
  const payment = await verifyPayment(
    Number(req.params.id),
    req.user!.id,
    req.body.status
  );

  res.status(200).json({
    message: "Payment status updated successfully",
    payment,
  });
}