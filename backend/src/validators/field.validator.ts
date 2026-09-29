import { z } from "zod";

export const createFieldSchema = z.object({
  name: z
    .string()
    .min(2, "Field name must be at least 2 characters"),

  description: z
    .string()
    .optional(),

  address: z
    .string()
    .min(3, "Address must be at least 3 characters"),

  pricePerHour: z
    .number()
    .positive("Price must be greater than 0"),
});

export const getFieldsQuerySchema = z.object({
  search: z
    .string()
    .optional(),

  minPrice: z.coerce
    .number()
    .nonnegative("Minimum price cannot be negative")
    .optional(),

  maxPrice: z.coerce
    .number()
    .nonnegative("Maximum price cannot be negative")
    .optional(),

  page: z.coerce
    .number()
    .int()
    .positive()
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(10),

  sort: z
    .enum(["priceAsc", "priceDesc"])
    .optional(),
});