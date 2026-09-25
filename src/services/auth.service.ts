import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { db } from "../prisma/db.js";
import { ApiError } from "../utils/ApiError.js";
import { createNotification } from "./notification.service.js";

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

function sanitizeUser(user: any) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function registerUser(data: RegisterData) {
  const existingUser = await db.orm.public.User
    .where({ email: data.email })
    .first();

  if (existingUser) {
    throw new ApiError("Email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(
    data.password,
    10
  );

  const user = await db.orm.public.User.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    phone: data.phone,
  });

  await createNotification(
    user.id,
    "Welcome",
    `Welcome ${user.name}! Your account has been created successfully.`
  );

  return sanitizeUser(user);
}

export async function loginUser(
  email: string,
  password: string
) {
  const user = await db.orm.public.User
    .where({ email })
    .first();

  if (!user) {
    throw new ApiError(
      "Invalid email or password",
      401
    );
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw new ApiError(
      "Invalid email or password",
      401
    );
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "7d",
    }
  );

  return {
    user: sanitizeUser(user),
    token,
  };
}

export async function getAllUsers() {
  const users = await db.orm.public.User.all();

  return users.map(sanitizeUser);
}

export async function getUserById(userId: number) {
  const user = await db.orm.public.User
    .where({ id: userId })
    .first();

  if (!user) {
    throw new ApiError(
      "User not found",
      404
    );
  }

  return sanitizeUser(user);
}

export async function updateUserRole(
  userId: number,
  role: string
) {
  const user = await db.orm.public.User
    .where({ id: userId })
    .first();

  if (!user) {
    throw new ApiError(
      "User not found",
      404
    );
  }

  const allowedRoles = [
    "PLAYER",
    "OWNER",
    "ORGANIZER",
    "ADMIN",
  ];

  if (!allowedRoles.includes(role)) {
    throw new ApiError(
      "Invalid role",
      400
    );
  }

  const updatedUser = await db.orm.public.User
    .where({ id: userId })
    .update({
      role: role as
        | "PLAYER"
        | "OWNER"
        | "ORGANIZER"
        | "ADMIN",
    });

  await createNotification(
    userId,
    "Role Updated",
    `Your account role has been changed to ${role}.`
  );

  return sanitizeUser(updatedUser);
}

export async function deleteUser(userId: number) {
  const user = await db.orm.public.User
    .where({ id: userId })
    .first();

  if (!user) {
    throw new ApiError(
      "User not found",
      404
    );
  }

  const notifications =
    await db.orm.public.Notification
      .where({ userId })
      .all();

  for (const notification of notifications) {
    await db.orm.public.Notification
      .where({ id: notification.id })
      .delete();
  }

  await db.orm.public.User
    .where({ id: userId })
    .delete();

  return sanitizeUser(user);
}

export async function getAdminStats() {
  const users = await db.orm.public.User.all();
  const fields = await db.orm.public.Field.all();
  const bookings = await db.orm.public.Booking.all();
  const payments = await db.orm.public.Payment.all();
  const reviews = await db.orm.public.Review.all();
  const tournaments = await db.orm.public.Tournament.all();

  const totalRevenue = payments
    .filter((payment) => payment.status === "VERIFIED")
    .reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

  return {
    users: users.length,
    fields: fields.length,
    bookings: bookings.length,
    payments: payments.length,
    reviews: reviews.length,
    tournaments: tournaments.length,
    revenue: totalRevenue,
  };
}