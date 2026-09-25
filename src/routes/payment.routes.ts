import { Router } from "express";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
  createPaymentController,
  uploadPaymentProofController,
  verifyPaymentController,
} from "../controllers/payment.controller.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  createPaymentController
);

router.post(
  "/:id/proof",
  authMiddleware,
  upload.single("proofImage"),
  uploadPaymentProofController
);
router.patch(
  "/:id/verify",
  authMiddleware,
  authorizeRoles("OWNER"),
  verifyPaymentController
);

export default router;