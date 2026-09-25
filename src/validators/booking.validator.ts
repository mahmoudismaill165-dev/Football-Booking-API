import { z } from "zod";

export const createBookingSchema = z.object({
  fieldId: z
    .number()
    .int()
    .positive("Field ID must be a positive number"),

  startTime: z
    .string()
    .datetime("Invalid start time"),

  endTime: z
    .string()
    .datetime("Invalid end time"),
});