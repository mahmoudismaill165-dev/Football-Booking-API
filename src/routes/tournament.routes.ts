import { Router } from "express";

import {
  createTournamentController,
  getAllTournamentsController,
  getTournamentByIdController,
  joinTournamentController,
  updateTournamentController,
  deleteTournamentController,
  getTournamentParticipantsController,
} from "../controllers/tournament.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

// Create tournament
router.post(
  "/",
  authMiddleware,
  authorizeRoles("ORGANIZER"),
  createTournamentController
);

// Get all tournaments
router.get(
  "/",
  getAllTournamentsController
);

// Join tournament
router.post(
  "/:id/join",
  authMiddleware,
  joinTournamentController
);

// Update tournament
router.patch(
  "/:id",
  authMiddleware,
  authorizeRoles("ORGANIZER"),
  updateTournamentController
);

// Delete tournament
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("ORGANIZER"),
  deleteTournamentController
);
router.get(
  "/:id/participants",
  getTournamentParticipantsController
);
// Get tournament by ID
router.get(
  "/:id",
  getTournamentByIdController
);

export default router;