import request from "supertest";

const password = "12345678";

const organizerData = {
  name: "Tournament Organizer Test",
  email: `tournament-organizer-${Date.now()}@gmail.com`,
  password,
};

const playerData = {
  name: "Tournament Player Test",
  email: `tournament-player-${Date.now()}@gmail.com`,
  password,
};

const secondPlayerData = {
  name: "Tournament Second Player Test",
  email: `tournament-player-2-${Date.now()}@gmail.com`,
  password,
};

let app: any;
let db: any;

let organizerToken: string;
let playerToken: string;
let secondPlayerToken: string;

let organizerId: number;
let playerId: number;
let secondPlayerId: number;

let tournamentId: number;

const startDate = "2030-01-10T10:00:00.000Z";
const endDate = "2030-01-10T12:00:00.000Z";

beforeAll(async () => {
  const appModule = await import("../src/app.js");
  const dbModule = await import("../src/prisma/db.js");

  app = appModule.default;
  db = dbModule.db;

  // =========================
  // Create Organizer
  // =========================

  const organizerRegister = await request(app)
    .post("/api/auth/register")
    .send(organizerData);

  expect(organizerRegister.status).toBe(201);

  organizerId = organizerRegister.body.user.id;

  await db.orm.public.User
    .where({ id: organizerId })
    .update({
      role: "ORGANIZER",
    });

  const organizerLogin = await request(app)
    .post("/api/auth/login")
    .send({
      email: organizerData.email,
      password,
    });

  expect(organizerLogin.status).toBe(200);

  organizerToken = organizerLogin.body.token;

  // =========================
  // Create Player
  // =========================

  const playerRegister = await request(app)
    .post("/api/auth/register")
    .send(playerData);

  expect(playerRegister.status).toBe(201);

  playerId = playerRegister.body.user.id;

  const playerLogin = await request(app)
    .post("/api/auth/login")
    .send({
      email: playerData.email,
      password,
    });

  expect(playerLogin.status).toBe(200);

  playerToken = playerLogin.body.token;

  // =========================
  // Create Second Player
  // =========================

  const secondPlayerRegister = await request(app)
    .post("/api/auth/register")
    .send(secondPlayerData);

  expect(secondPlayerRegister.status).toBe(201);

  secondPlayerId = secondPlayerRegister.body.user.id;

  const secondPlayerLogin = await request(app)
    .post("/api/auth/login")
    .send({
      email: secondPlayerData.email,
      password,
    });

  expect(secondPlayerLogin.status).toBe(200);

  secondPlayerToken = secondPlayerLogin.body.token;
});

afterAll(async () => {
  const notifications =
  await db.orm.public.Notification.all();

for (const notification of notifications) {
  await db.orm.public.Notification
    .where({ id: notification.id })
    .delete();
}
  if (tournamentId) {
    const participants =
      await db.orm.public.TournamentParticipant
        .where({ tournamentId })
        .all();

    for (const participant of participants) {
      await db.orm.public.TournamentParticipant
        .where({ id: participant.id })
        .delete();
    }
  }

  // Delete any remaining tournaments
  if (organizerId) {
    const tournaments =
      await db.orm.public.Tournament
        .where({ organizerId })
        .all();

    for (const tournament of tournaments) {
      const participants =
        await db.orm.public.TournamentParticipant
          .where({
            tournamentId: tournament.id,
          })
          .all();

      for (const participant of participants) {
        await db.orm.public.TournamentParticipant
          .where({ id: participant.id })
          .delete();
      }

      await db.orm.public.Tournament
        .where({ id: tournament.id })
        .delete();
    }
  }

  // Delete test users
  if (organizerId) {
    await db.orm.public.User
      .where({ id: organizerId })
      .delete();
  }

  if (playerId) {
    await db.orm.public.User
      .where({ id: playerId })
      .delete();
  }

  if (secondPlayerId) {
    await db.orm.public.User
      .where({ id: secondPlayerId })
      .delete();
  }
});

describe("Tournament API", () => {
  // =========================
  // CREATE
  // =========================

  test("should reject unauthenticated tournament creation", async () => {
    const response = await request(app)
      .post("/api/tournaments")
      .send({
        name: "Unauthorized Tournament",
        description: "Test",
        startDate,
        endDate,
      });

    expect(response.status).toBe(401);
  });

  test("should reject player from creating tournament", async () => {
    const response = await request(app)
      .post("/api/tournaments")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({
        name: "Player Tournament",
        description: "Should not be created",
        startDate,
        endDate,
      });

    expect(response.status).toBe(403);
  });

  test("should reject organizer when end date is before start date", async () => {
    const response = await request(app)
      .post("/api/tournaments")
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({
        name: "Invalid Tournament",
        description: "Invalid dates",
        startDate: "2030-01-10T12:00:00.000Z",
        endDate: "2030-01-10T10:00:00.000Z",
      });

    expect(response.status).toBe(400);

    expect(response.body.message).toBe(
      "End date must be after start date"
    );
  });

  test("should create tournament successfully", async () => {
    const response = await request(app)
      .post("/api/tournaments")
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({
        name: "Champions Football Tournament",
        description: "Tournament testing",
        startDate,
        endDate,
      });

    expect(response.status).toBe(201);

    expect(response.body.message).toBe(
      "Tournament created successfully"
    );

    expect(response.body.tournament).toHaveProperty("id");

    expect(response.body.tournament.name).toBe(
      "Champions Football Tournament"
    );

    expect(response.body.tournament.organizerId).toBe(
      organizerId
    );

    tournamentId = response.body.tournament.id;
  });

  // =========================
  // GET
  // =========================

  test("should get all tournaments", async () => {
    const response = await request(app)
      .get("/api/tournaments");

    expect(response.status).toBe(200);

    expect(response.body.message).toBe(
      "Tournaments fetched successfully"
    );

    expect(
      Array.isArray(response.body.tournaments)
    ).toBe(true);

    const tournament =
      response.body.tournaments.find(
        (item: any) => item.id === tournamentId
      );

    expect(tournament).toBeDefined();
  });

  test("should get tournament by id", async () => {
    const response = await request(app)
      .get(`/api/tournaments/${tournamentId}`);

    expect(response.status).toBe(200);

    expect(response.body.message).toBe(
      "Tournament fetched successfully"
    );

    expect(response.body.tournament.id).toBe(
      tournamentId
    );
  });

  test("should return 404 for non-existing tournament", async () => {
    const response = await request(app)
      .get("/api/tournaments/99999999");

    expect(response.status).toBe(404);

    expect(response.body.message).toBe(
      "Tournament not found"
    );
  });

  // =========================
  // JOIN
  // =========================

  test("should allow player to join tournament", async () => {
    const response = await request(app)
      .post(
        `/api/tournaments/${tournamentId}/join`
      )
      .set(
        "Authorization",
        `Bearer ${playerToken}`
      );

    expect(response.status).toBe(201);

    expect(response.body.message).toBe(
      "Joined tournament successfully"
    );

    expect(
      response.body.participant
    ).toHaveProperty("id");

    expect(
      response.body.participant.tournamentId
    ).toBe(tournamentId);

    expect(
      response.body.participant.userId
    ).toBe(playerId);
  });

  test("should reject unauthenticated tournament join", async () => {
    const response = await request(app)
      .post(
        `/api/tournaments/${tournamentId}/join`
      );

    expect(response.status).toBe(401);
  });

  test("should reject duplicate tournament join", async () => {
    const response = await request(app)
      .post(
        `/api/tournaments/${tournamentId}/join`
      )
      .set(
        "Authorization",
        `Bearer ${playerToken}`
      );

    expect(response.status).toBe(400);

    expect(response.body.message).toBe(
      "You already joined this tournament"
    );
  });

  test("should allow another player to join tournament", async () => {
    const response = await request(app)
      .post(
        `/api/tournaments/${tournamentId}/join`
      )
      .set(
        "Authorization",
        `Bearer ${secondPlayerToken}`
      );

    expect(response.status).toBe(201);

    expect(response.body.message).toBe(
      "Joined tournament successfully"
    );

    expect(
      response.body.participant.userId
    ).toBe(secondPlayerId);
  });

  test("should return 404 when joining non-existing tournament", async () => {
    const response = await request(app)
      .post(
        "/api/tournaments/99999999/join"
      )
      .set(
        "Authorization",
        `Bearer ${playerToken}`
      );

    expect(response.status).toBe(404);

    expect(response.body.message).toBe(
      "Tournament not found"
    );
  });

  // =========================
  // PARTICIPANTS
  // =========================

  test("should get tournament participants", async () => {
    const response = await request(app)
      .get(
        `/api/tournaments/${tournamentId}/participants`
      );

    expect(response.status).toBe(200);

    expect(response.body.message).toBe(
      "Tournament participants fetched successfully"
    );

    expect(
      Array.isArray(response.body.participants)
    ).toBe(true);

    expect(
      response.body.participants.length
    ).toBe(2);

    const participantIds =
      response.body.participants.map(
        (participant: any) =>
          participant.userId
      );

    expect(participantIds).toContain(
      playerId
    );

    expect(participantIds).toContain(
      secondPlayerId
    );
  });

  test("should return 404 when getting participants for non-existing tournament", async () => {
    const response = await request(app)
      .get(
        "/api/tournaments/99999999/participants"
      );

    expect(response.status).toBe(404);

    expect(response.body.message).toBe(
      "Tournament not found"
    );
  });

  // =========================
  // UPDATE
  // =========================

  test("should reject unauthenticated tournament update", async () => {
    const response = await request(app)
      .patch(
        `/api/tournaments/${tournamentId}`
      )
      .send({
        name: "Updated Tournament",
      });

    expect(response.status).toBe(401);
  });

  test("should reject player from updating tournament", async () => {
    const response = await request(app)
      .patch(
        `/api/tournaments/${tournamentId}`
      )
      .set(
        "Authorization",
        `Bearer ${playerToken}`
      )
      .send({
        name: "Player Updated Tournament",
      });

    expect(response.status).toBe(403);
  });

  test("should reject another organizer from updating tournament", async () => {
    const otherOrganizerData = {
      name: "Other Organizer",
      email: `other-organizer-${Date.now()}@gmail.com`,
      password,
    };

    const register = await request(app)
      .post("/api/auth/register")
      .send(otherOrganizerData);

    expect(register.status).toBe(201);

    const otherOrganizerId =
      register.body.user.id;

    await db.orm.public.User
      .where({ id: otherOrganizerId })
      .update({
        role: "ORGANIZER",
      });

    const login = await request(app)
      .post("/api/auth/login")
      .send({
        email: otherOrganizerData.email,
        password,
      });

    expect(login.status).toBe(200);

    const otherOrganizerToken =
      login.body.token;

    const response = await request(app)
      .patch(
        `/api/tournaments/${tournamentId}`
      )
      .set(
        "Authorization",
        `Bearer ${otherOrganizerToken}`
      )
      .send({
        name: "Unauthorized Update",
      });

    expect(response.status).toBe(403);

    const notifications =
  await db.orm.public.Notification
    .where({ userId: otherOrganizerId })
    .all();

for (const notification of notifications) {
  await db.orm.public.Notification
    .where({ id: notification.id })
    .delete();
}

await db.orm.public.User
  .where({ id: otherOrganizerId })
  .delete();
  });

  test("should update tournament successfully", async () => {
    const response = await request(app)
      .patch(
        `/api/tournaments/${tournamentId}`
      )
      .set(
        "Authorization",
        `Bearer ${organizerToken}`
      )
      .send({
        name: "Updated Champions Tournament",
        description: "Updated description",
      });

    expect(response.status).toBe(200);

    expect(response.body.message).toBe(
      "Tournament updated successfully"
    );

    expect(
      response.body.tournament.name
    ).toBe(
      "Updated Champions Tournament"
    );

    expect(
      response.body.tournament.description
    ).toBe("Updated description");
  });

  test("should reject invalid dates during update", async () => {
    const response = await request(app)
      .patch(
        `/api/tournaments/${tournamentId}`
      )
      .set(
        "Authorization",
        `Bearer ${organizerToken}`
      )
      .send({
        startDate:
          "2030-01-10T15:00:00.000Z",
        endDate:
          "2030-01-10T10:00:00.000Z",
      });

    expect(response.status).toBe(400);

    expect(response.body.message).toBe(
      "End date must be after start date"
    );
  });

  test("should return 404 when updating non-existing tournament", async () => {
    const response = await request(app)
      .patch(
        "/api/tournaments/99999999"
      )
      .set(
        "Authorization",
        `Bearer ${organizerToken}`
      )
      .send({
        name: "Not Found Tournament",
      });

    expect(response.status).toBe(404);

    expect(response.body.message).toBe(
      "Tournament not found"
    );
  });

  // =========================
  // DELETE
  // =========================

  test("should reject unauthenticated tournament deletion", async () => {
    const response = await request(app)
      .delete(
        `/api/tournaments/${tournamentId}`
      );

    expect(response.status).toBe(401);
  });

  test("should reject player from deleting tournament", async () => {
    const response = await request(app)
      .delete(
        `/api/tournaments/${tournamentId}`
      )
      .set(
        "Authorization",
        `Bearer ${playerToken}`
      );

    expect(response.status).toBe(403);
  });

  test("should reject another organizer from deleting tournament", async () => {
    const otherOrganizerData = {
      name: "Delete Other Organizer",
      email: `delete-organizer-${Date.now()}@gmail.com`,
      password,
    };

    const register = await request(app)
      .post("/api/auth/register")
      .send(otherOrganizerData);

    expect(register.status).toBe(201);

    const otherOrganizerId =
      register.body.user.id;

    await db.orm.public.User
      .where({ id: otherOrganizerId })
      .update({
        role: "ORGANIZER",
      });

    const login = await request(app)
      .post("/api/auth/login")
      .send({
        email: otherOrganizerData.email,
        password,
      });

    expect(login.status).toBe(200);

    const otherOrganizerToken =
      login.body.token;

    const response = await request(app)
      .delete(
        `/api/tournaments/${tournamentId}`
      )
      .set(
        "Authorization",
        `Bearer ${otherOrganizerToken}`
      );

    expect(response.status).toBe(403);

   const notifications =
  await db.orm.public.Notification
    .where({ userId: otherOrganizerId })
    .all();

for (const notification of notifications) {
  await db.orm.public.Notification
    .where({ id: notification.id })
    .delete();
}

await db.orm.public.User
  .where({ id: otherOrganizerId })
  .delete();
  });

  test("should delete tournament successfully", async () => {
    const response = await request(app)
      .delete(
        `/api/tournaments/${tournamentId}`
      )
      .set(
        "Authorization",
        `Bearer ${organizerToken}`
      );

    expect(response.status).toBe(200);

    expect(response.body.message).toBe(
      "Tournament deleted successfully"
    );

    expect(
      response.body.tournament.id
    ).toBe(tournamentId);

    const check =
      await db.orm.public.Tournament
        .where({ id: tournamentId })
        .first();

    expect(check).toBeNull();

    tournamentId = 0;
  });

  test("should return 404 when deleting non-existing tournament", async () => {
    const response = await request(app)
      .delete(
        "/api/tournaments/99999999"
      )
      .set(
        "Authorization",
        `Bearer ${organizerToken}`
      );

    expect(response.status).toBe(404);

    expect(response.body.message).toBe(
      "Tournament not found"
    );
  });
});