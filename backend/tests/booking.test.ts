import request from "supertest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import app from "../src/app.js";
import { db } from "../src/prisma/db.js";

describe("Booking API", () => {
  let playerToken: string;
  let player2Token: string;
  let ownerToken: string;
  let owner2Token: string;

  let playerId: number;
  let player2Id: number;
  let ownerId: number;
  let owner2Id: number;

  let fieldId: number;
  let field2Id: number;

  let bookingId: number;
  let booking2Id: number;

  beforeAll(async () => {
    const password = await bcrypt.hash("123456", 10);

    const player = await db.orm.public.User.create({
      name: "Booking Player",
      email: `booking-player-${Date.now()}@test.com`,
      password,
      role: "PLAYER",
    });

    const player2 = await db.orm.public.User.create({
      name: "Booking Player 2",
      email: `booking-player2-${Date.now()}@test.com`,
      password,
      role: "PLAYER",
    });

    const owner = await db.orm.public.User.create({
      name: "Booking Owner",
      email: `booking-owner-${Date.now()}@test.com`,
      password,
      role: "OWNER",
    });

    const owner2 = await db.orm.public.User.create({
      name: "Booking Owner 2",
      email: `booking-owner2-${Date.now()}@test.com`,
      password,
      role: "OWNER",
    });

    playerId = player.id;
    player2Id = player2.id;
    ownerId = owner.id;
    owner2Id = owner2.id;

    playerToken = jwt.sign(
      { id: playerId, role: "PLAYER" },
      process.env.JWT_SECRET!
    );

    player2Token = jwt.sign(
      { id: player2Id, role: "PLAYER" },
      process.env.JWT_SECRET!
    );

    ownerToken = jwt.sign(
      { id: ownerId, role: "OWNER" },
      process.env.JWT_SECRET!
    );

    owner2Token = jwt.sign(
      { id: owner2Id, role: "OWNER" },
      process.env.JWT_SECRET!
    );

    const field = await db.orm.public.Field.create({
      name: "Booking Test Field",
      description: "Test field",
      address: "Tanta",
      pricePerHour: 200,
      ownerId,
    });

    const field2 = await db.orm.public.Field.create({
      name: "Booking Test Field 2",
      description: "Test field 2",
      address: "Mansoura",
      pricePerHour: 300,
      ownerId: owner2Id,
    });

    fieldId = field.id;
    field2Id = field2.id;
  });

afterAll(async () => {

  const notifications =
    await db.orm.public.Notification.all();

  for (const notification of notifications) {
    await db.orm.public.Notification
      .where({ id: notification.id })
      .delete();
  }

  // 2. Delete bookings

  if (bookingId) {
    await db.orm.public.Booking
      .where({ id: bookingId })
      .delete();
  }

  if (booking2Id) {
    await db.orm.public.Booking
      .where({ id: booking2Id })
      .delete();
  }

  // 3. Delete fields

  if (fieldId) {
    await db.orm.public.Field
      .where({ id: fieldId })
      .delete();
  }

  if (field2Id) {
    await db.orm.public.Field
      .where({ id: field2Id })
      .delete();
  }

  // 4. Delete users

  if (playerId) {
    await db.orm.public.User
      .where({ id: playerId })
      .delete();
  }

  if (player2Id) {
    await db.orm.public.User
      .where({ id: player2Id })
      .delete();
  }

  if (ownerId) {
    await db.orm.public.User
      .where({ id: ownerId })
      .delete();
  }

  if (owner2Id) {
    await db.orm.public.User
      .where({ id: owner2Id })
      .delete();
  }
});

  it("should reject unauthenticated booking creation", async () => {
    const response = await request(app)
      .post("/api/bookings")
      .send({
        fieldId,
        startTime: "2026-12-01T10:00:00.000Z",
        endTime: "2026-12-01T12:00:00.000Z",
      });

    expect(response.status).toBe(401);
  });

  it("should create a booking successfully", async () => {
    const response = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({
        fieldId,
        startTime: "2026-12-01T10:00:00.000Z",
        endTime: "2026-12-01T12:00:00.000Z",
      });

    expect(response.status).toBe(201);

    expect(response.body.message).toBe(
      "Booking created successfully"
    );

    expect(response.body.booking).toBeDefined();

    bookingId = response.body.booking.id;

    expect(response.body.booking.userId).toBe(playerId);
    expect(response.body.booking.fieldId).toBe(fieldId);
    expect(response.body.booking.totalPrice).toBe(400);
  });

  it("should reject overlapping booking", async () => {
    const response = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${player2Token}`)
      .send({
        fieldId,
        startTime: "2026-12-01T11:00:00.000Z",
        endTime: "2026-12-01T13:00:00.000Z",
      });

    expect(response.status).toBe(409);

    expect(response.body.message).toBe(
      "Field is already booked during this time"
    );
  });

  it("should get player's bookings", async () => {
    const response = await request(app)
      .get("/api/bookings")
      .set("Authorization", `Bearer ${playerToken}`);

    expect(response.status).toBe(200);

    expect(response.body.message).toBe(
      "Bookings fetched successfully"
    );

    expect(response.body.bookings).toHaveLength(1);
    expect(response.body.bookings[0].id).toBe(bookingId);
  });

  it("should not show another player's bookings", async () => {
    const response = await request(app)
      .get("/api/bookings")
      .set("Authorization", `Bearer ${player2Token}`);

    expect(response.status).toBe(200);

    expect(response.body.bookings).toHaveLength(0);
  });

  it("should allow owner to get bookings for his fields", async () => {
    const response = await request(app)
      .get("/api/bookings/owner")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(response.status).toBe(200);

    expect(response.body.message).toBe(
      "Owner bookings fetched successfully"
    );

    expect(response.body.bookings).toHaveLength(1);
    expect(response.body.bookings[0].id).toBe(bookingId);
  });

  it("should reject player from owner bookings endpoint", async () => {
    const response = await request(app)
      .get("/api/bookings/owner")
      .set("Authorization", `Bearer ${playerToken}`);

    expect(response.status).toBe(403);
  });

  it("should allow the field owner to confirm the booking", async () => {
    const response = await request(app)
      .patch(`/api/bookings/${bookingId}/confirm`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(response.status).toBe(200);

    expect(response.body.message).toBe(
      "Booking confirmed successfully"
    );

    expect(response.body.booking.status).toBe("CONFIRMED");
  });

  it("should reject another owner from confirming the booking", async () => {
    const response = await request(app)
      .patch(`/api/bookings/${bookingId}/confirm`)
      .set("Authorization", `Bearer ${owner2Token}`);

    expect(response.status).toBe(403);
  });

  it("should reject confirming an already confirmed booking", async () => {
    const response = await request(app)
      .patch(`/api/bookings/${bookingId}/confirm`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(response.status).toBe(400);
  });

  it("should reject cancelling another player's booking", async () => {
    const response = await request(app)
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set("Authorization", `Bearer ${player2Token}`);

    expect(response.status).toBe(403);
  });

  it("should allow the booking owner to cancel his booking", async () => {
    const response = await request(app)
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set("Authorization", `Bearer ${playerToken}`);

    expect(response.status).toBe(200);

    expect(response.body.message).toBe(
      "Booking cancelled successfully"
    );

    expect(response.body.booking.status).toBe("CANCELLED");
  });

  it("should reject cancelling an already cancelled booking", async () => {
    const response = await request(app)
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set("Authorization", `Bearer ${playerToken}`);

    expect(response.status).toBe(400);
  });

  it("should allow owner to cancel a booking for his field", async () => {
    const createResponse = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${player2Token}`)
      .send({
        fieldId,
        startTime: "2026-12-02T10:00:00.000Z",
        endTime: "2026-12-02T11:00:00.000Z",
      });

    expect(createResponse.status).toBe(201);

    booking2Id = createResponse.body.booking.id;

    const response = await request(app)
      .patch(`/api/bookings/${booking2Id}/cancel`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(response.status).toBe(200);

    expect(response.body.booking.status).toBe("CANCELLED");
  });

  it("should reject another owner from cancelling the booking", async () => {
    const createResponse = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({
        fieldId: field2Id,
        startTime: "2026-12-03T10:00:00.000Z",
        endTime: "2026-12-03T11:00:00.000Z",
      });

    expect(createResponse.status).toBe(201);

    const thirdBookingId = createResponse.body.booking.id;

    const response = await request(app)
      .patch(`/api/bookings/${thirdBookingId}/cancel`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(response.status).toBe(403);

    await db.orm.public.Booking
      .where({ id: thirdBookingId })
      .delete();
  });
});