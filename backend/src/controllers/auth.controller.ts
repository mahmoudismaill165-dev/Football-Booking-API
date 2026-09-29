import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getAdminStats,
} from "../services/auth.service.js";

export const register = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await registerUser({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      phone: req.body.phone,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user,
    });
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await loginUser(
      email,
      password
    );

    return res.status(200).json({
      message: "Login successful",
      ...result,
    });
  }
);

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.body.refreshToken || req.headers["x-refresh-token"];

    const result = await refreshAccessToken(String(token));

    return res.status(200).json({
      message: "Token refreshed successfully",
      ...result,
    });
  }
);
export const getUsers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const users = await getAllUsers();

    return res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  }
);

export const getUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await getUserById(
      Number(req.params.id)
    );

    return res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  }
);

export const changeUserRole = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await updateUserRole(
      Number(req.params.id),
      req.body.role
    );

    return res.status(200).json({
      message: "User role updated successfully",
      user,
    });
  }
);

export const removeUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await deleteUser(
      Number(req.params.id)
    );

    return res.status(200).json({
      message: "User deleted successfully",
      user,
    });
  }
);
export const getProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await getUserById(req.user!.id);

    return res.status(200).json({
      message: "You are authenticated",
      user,
    });
  }
);
export const getStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const stats = await getAdminStats();

    return res.status(200).json({
      message: "Statistics fetched successfully",
      stats,
    });
  }
);
