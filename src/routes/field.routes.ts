import { Router } from "express";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  createFieldSchema,
  getFieldsQuerySchema,
} from "../validators/field.validator.js";

import {
  createFieldController,
  getAllFieldsController,
  getFieldByIdController,
} from "../controllers/field.controller.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  authorizeRoles("OWNER"),
  validate(createFieldSchema),
  createFieldController
);

router.get(
  "/",
  validate(getFieldsQuerySchema, "query"),
  getAllFieldsController
);

router.get("/:id", getFieldByIdController);

export default router;