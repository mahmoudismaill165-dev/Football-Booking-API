import { Response } from "express";

import { AuthRequest } from "../middlewares/auth.middleware.js";

import {
  createTournament,
  getAllTournaments,
  getTournamentById,
  joinTournament,
  updateTournament,
  deleteTournament,
  getTournamentParticipants,
} from "../services/tournament.service.js";

export async function createTournamentController(
  req: AuthRequest,
  res: Response
) {
  const tournament = await createTournament({
    name: req.body.name,
    description: req.body.description,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    organizerId: req.user!.id,
  });

  res.status(201).json({
    message: "Tournament created successfully",
    tournament,
  });
}

export async function getAllTournamentsController(
  req: AuthRequest,
  res: Response
) {
  const tournaments = await getAllTournaments();

  res.status(200).json({
    message: "Tournaments fetched successfully",
    tournaments,
  });
}

export async function getTournamentByIdController(
  req: AuthRequest,
  res: Response
) {
  const tournament = await getTournamentById(
    Number(req.params.id)
  );

  res.status(200).json({
    message: "Tournament fetched successfully",
    tournament,
  });
}
export async function joinTournamentController(
  req: AuthRequest,
  res: Response
) {
  const participant = await joinTournament(
    Number(req.params.id),
    req.user!.id
  );

  res.status(201).json({
    message: "Joined tournament successfully",
    participant,
  });
}
export async function updateTournamentController(
  req: AuthRequest,
  res: Response
) {
  const tournament = await updateTournament(
    Number(req.params.id),
    req.user!.id,
    {
      name: req.body.name,
      description: req.body.description,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
    }
  );

  res.status(200).json({
    message: "Tournament updated successfully",
    tournament,
  });
}
export async function deleteTournamentController(
  req: AuthRequest,
  res: Response
) {
  const tournament = await deleteTournament(
    Number(req.params.id),
    req.user!.id
  );

  res.status(200).json({
    message: "Tournament deleted successfully",
    tournament,
  });
}
export async function getTournamentParticipantsController(
  req: AuthRequest,
  res: Response
) {
  const participants = await getTournamentParticipants(
    Number(req.params.id)
  );

  res.status(200).json({
    message: "Tournament participants fetched successfully",
    participants,
  });
}