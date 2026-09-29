
import { db } from "../prisma/db.js";
import { ApiError } from "../utils/ApiError.js";
import { createNotification } from "./notification.service.js";

interface CreateTournamentData {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  organizerId: number;
}

export async function createTournament(
  data: CreateTournamentData
) {
  if (
    new Date(data.startDate) >=
    new Date(data.endDate)
  ) {
    throw new ApiError(
      "End date must be after start date",
      400
    );
  }

  const tournament =
    await db.orm.public.Tournament.create({
      name: data.name,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      organizerId: data.organizerId,
    });

  await createNotification(
    data.organizerId,
    "Tournament Created",
    `Your tournament "${data.name}" has been created successfully.`
  );

  return tournament;
}

export async function getAllTournaments() {
  return await db.orm.public.Tournament.all();
}

export async function getTournamentById(
  tournamentId: number
) {
  const tournament =
    await db.orm.public.Tournament
      .where({ id: tournamentId })
      .first();

  if (!tournament) {
    throw new ApiError(
      "Tournament not found",
      404
    );
  }

  return tournament;
}

export async function joinTournament(
  tournamentId: number,
  userId: number
) {
  const tournament =
    await db.orm.public.Tournament
      .where({ id: tournamentId })
      .first();

  if (!tournament) {
    throw new ApiError(
      "Tournament not found",
      404
    );
  }

  const existingParticipant =
    await db.orm.public.TournamentParticipant
      .where({
        tournamentId,
        userId,
      })
      .first();

  if (existingParticipant) {
    throw new ApiError(
      "You already joined this tournament",
      400
    );
  }

  const participant =
    await db.orm.public.TournamentParticipant.create({
      tournamentId,
      userId,
    });

  await createNotification(
    tournament.organizerId,
    "New Tournament Participant",
    `A new player has joined your tournament "${tournament.name}".`
  );

  await createNotification(
    userId,
    "Tournament Joined",
    `You have successfully joined "${tournament.name}".`
  );

  return participant;
}

export async function updateTournament(
  tournamentId: number,
  organizerId: number,
  data: {
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
  }
) {
  const tournament =
    await db.orm.public.Tournament
      .where({ id: tournamentId })
      .first();

  if (!tournament) {
    throw new ApiError(
      "Tournament not found",
      404
    );
  }

  if (
    tournament.organizerId !== organizerId
  ) {
    throw new ApiError(
      "You are not allowed to update this tournament",
      403
    );
  }

  const startDate =
    data.startDate ?? tournament.startDate;

  const endDate =
    data.endDate ?? tournament.endDate;

  if (
    new Date(startDate) >=
    new Date(endDate)
  ) {
    throw new ApiError(
      "End date must be after start date",
      400
    );
  }

  const updatedTournament =
    await db.orm.public.Tournament
      .where({ id: tournamentId })
      .update({
        name: data.name ?? tournament.name,
        description:
          data.description ??
          tournament.description,
        startDate,
        endDate,
      });

  await createNotification(
  organizerId,
  "Tournament Updated",
  `Your tournament "${data.name ?? tournament.name}" has been updated successfully.`
);

  return updatedTournament;
}

export async function deleteTournament(
  tournamentId: number,
  organizerId: number
) {
  const tournament =
    await db.orm.public.Tournament
      .where({ id: tournamentId })
      .first();

  if (!tournament) {
    throw new ApiError(
      "Tournament not found",
      404
    );
  }

  if (
    tournament.organizerId !== organizerId
  ) {
    throw new ApiError(
      "You are not allowed to delete this tournament",
      403
    );
  }

  const participants =
    await db.orm.public.TournamentParticipant
      .where({ tournamentId })
      .all();

  for (const participant of participants) {
    await db.orm.public.TournamentParticipant
      .where({ id: participant.id })
      .delete();
  }

  await db.orm.public.Tournament
    .where({ id: tournamentId })
    .delete();

  return tournament;
}

export async function getTournamentParticipants(
  tournamentId: number
) {
  const tournament =
    await db.orm.public.Tournament
      .where({ id: tournamentId })
      .first();

  if (!tournament) {
    throw new ApiError(
      "Tournament not found",
      404
    );
  }

  return await db.orm.public.TournamentParticipant
    .where({ tournamentId })
    .all();
}