import { Router } from "express";

import {
  authMiddleware,
  type AuthRequest,
} from "../middlewares/auth.middleware.js";

import { authorizeRoles } from "../middlewares/role.middleware.js";
import { authRateLimiter } from "../middlewares/rateLimit.middleware.js";

import {
  register,
  login,
  refreshToken,
  getProfile,
  getUsers,
  getUser,
  changeUserRole,
  removeUser,
  getStats,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", authRateLimiter, register);

router.post("/login", authRateLimiter, login);

router.post("/refresh", refreshToken);

router.get(
  "/profile",
  authMiddleware,
  getProfile
);

router.get(
  "/admin-test",
  authMiddleware,
  authorizeRoles("ADMIN"),
  (req: AuthRequest, res) => {
    res.json({
      message: "Welcome Admin",
    });
  }
);

router.get(
  "/admin/users",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getUsers
);

router.get(
  "/admin/users/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getUser
);

router.patch(
  "/admin/users/:id/role",
  authMiddleware,
  authorizeRoles("ADMIN"),
  changeUserRole
);

router.delete(
  "/admin/users/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  removeUser
);
router.get(
  "/admin/stats",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getStats
);

export default router;