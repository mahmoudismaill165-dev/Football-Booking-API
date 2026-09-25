import { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

import { asyncHandler } from "../utils/asyncHandler.js";

import {
  createField,
  getAllFields,
  getFieldById,
} from "../services/field.service.js";

export const createFieldController = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const field = await createField({
      name: req.body.name,
      description: req.body.description,
      address: req.body.address,
      pricePerHour: req.body.pricePerHour,
      ownerId: req.user.id,
    });

    return res.status(201).json({
      message: "Field created successfully",
      field,
    });
  }
);

export const getAllFieldsController = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      search,
      minPrice,
      maxPrice,
      page,
      limit,
      sort,
    } = res.locals.validatedQuery;

    const result = await getAllFields(
      search,
      minPrice,
      maxPrice,
      page,
      limit,
      sort
    );

    return res.status(200).json({
      message: "Fields fetched successfully",
      ...result,
    });
  }
);

export const getFieldByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid field ID",
      });
    }

    const field = await getFieldById(id);

    return res.status(200).json({
      message: "Field fetched successfully",
      field,
    });
  }
);