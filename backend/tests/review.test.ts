
import request from "supertest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import app from "../src/app.js";
import { db } from "../src/prisma/db.js";

describe("Review Module", () => {
  let ownerId: number;
  let playerId: number;
  let player2Id: number;
  let adminId: number;

  let fieldId: number;
  let reviewId!: number;

  let ownerToken: string;
  let playerToken: string;
  let player2Token: string;
  let adminToken: string;

  beforeAll(async () => {
    const password = await bcrypt.hash("123456", 10);

    const owner = await db.orm.public.User.create({
      name: "Review Test Owner",
      email: `review-owner-${Date.now()}@test.com`,
      password,
      role: "OWNER",
    });

    const player = await db.orm.public.User.create({
      name: "Review Test Player",
      email: `review-player-${Date.now()}@test.com`,
      password,
      role: "PLAYER",
    });

    const player2 = await db.orm.public.User.create({
      name: "Review Test Player 2",
      email: `review-player2-${Date.now()}@test.com`,
      password,
      role: "PLAYER",
    });

    const admin = await db.orm.public.User.create({
      name: "Review Test Admin",
      email: `review-admin-${Date.now()}@test.com`,
      password,
      role: "ADMIN",
    });

    ownerId = owner.id;
    playerId = player.id;
    player2Id = player2.id;
    adminId = admin.id;

    ownerToken = jwt.sign(
      { id: owner.id, role: owner.role },
      process.env.JWT_SECRET!
    );

    playerToken = jwt.sign(
      { id: player.id, role: player.role },
      process.env.JWT_SECRET!
    );

    player2Token = jwt.sign(
      { id: player2.id, role: player2.role },
      process.env.JWT_SECRET!
    );

    adminToken = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET!
    );

    const field = await db.orm.public.Field.create({
      name: "Review Test Stadium",
      description: "Review testing field",
      address: "Mansoura",
      pricePerHour: 300,
      ownerId,
    });

    fieldId = field.id;

    await db.orm.public.Booking.create({
      userId: playerId,
      fieldId,
      startTime: "2026-01-10T10:00:00Z",
      endTime: "2026-01-10T11:00:00Z",
      totalPrice: 300,
      status: "COMPLETED",
    });

    await db.orm.public.Booking.create({
      userId: player2Id,
      fieldId,
      startTime: "2026-01-11T10:00:00Z",
      endTime: "2026-01-11T11:00:00Z",
      totalPrice: 300,
      status: "PENDING",
    });
  });

  afterAll(async () => {
     const notifications =
    await db.orm.public.Notification.all();

  for (const notification of notifications) {
    await db.orm.public.Notification
      .where({ id: notification.id })
      .delete();
  }
    const reviews = await db.orm.public.Review
      .where({ fieldId })
      .all();

    for (const review of reviews) {
      await db.orm.public.Review
        .where({ id: review.id })
        .delete();
    }

    const bookings = await db.orm.public.Booking
      .where({ fieldId })
      .all();

    for (const booking of bookings) {
      await db.orm.public.Booking
        .where({ id: booking.id })
        .delete();
    }

    await db.orm.public.Field
      .where({ id: fieldId })
      .delete();

    await db.orm.public.User
      .where({ id: ownerId })
      .delete();

    await db.orm.public.User
      .where({ id: playerId })
      .delete();

    await db.orm.public.User
      .where({ id: player2Id })
      .delete();

    await db.orm.public.User
      .where({ id: adminId })
      .delete();
  });

  // ==========================================
  // CREATE REVIEW
  // ==========================================

  it("should reject unauthenticated review creation", async () => {
    await request(app)
      .post("/api/reviews")
      .send({
        fieldId,
        rating: 5,
        comment: "Great field",
      })
      .expect(401);
  });

  it("should reject review when booking is not completed", async () => {
    const response = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${player2Token}`)
      .send({
        fieldId,
        rating: 5,
        comment: "Great field",
      })
      .expect(403);

    expect(response.body.message).toBe(
      "You can only review a field after completing a booking"
    );
  });

  it("should reject rating below 1", async () => {
    await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({
        fieldId,
        rating: 0,
        comment: "Bad",
      })
      .expect(400);
  });

  it("should reject rating above 5", async () => {
    await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({
        fieldId,
        rating: 6,
        comment: "Excellent",
      })
      .expect(400);
  });

  it("should create a review after completed booking", async () => {
    const response = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({
        fieldId,
        rating: 5,
        comment: "Great field",
      })
      .expect(201);

    expect(response.body.review).toBeDefined();

    reviewId = response.body.review.id;

    expect(response.body.review.rating).toBe(5);
    expect(response.body.review.comment).toBe("Great field");
    expect(response.body.review.userId).toBe(playerId);
    expect(response.body.review.fieldId).toBe(fieldId);
  });

  it("should reject duplicate review", async () => {
    const response = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({
        fieldId,
        rating: 4,
        comment: "Another review",
      })
      .expect(400);

    expect(response.body.message).toBe(
      "You have already reviewed this field"
    );
  });

  // ==========================================
  // GET REVIEWS
  // ==========================================

  it("should get field reviews", async () => {
    const response = await request(app)
      .get(`/api/reviews/field/${fieldId}`)
      .expect(200);

    expect(response.body.reviews).toBeDefined();
    expect(Array.isArray(response.body.reviews)).toBe(true);
    expect(response.body.totalReviews).toBeGreaterThanOrEqual(1);
    expect(response.body.averageRating).toBeDefined();
  });

  it("should return reviewer name with field reviews", async () => {
    const response = await request(app)
      .get(`/api/reviews/field/${fieldId}`)
      .expect(200);

    const review = response.body.reviews.find(
      (item: any) => item.id === reviewId
    );

    expect(review).toBeDefined();
    expect(review.user).toBeDefined();
    expect(review.user.name).toBe("Review Test Player");
  });

  // ==========================================
  // UPDATE REVIEW
  // ==========================================

  it("should reject unauthenticated review update", async () => {
    await request(app)
      .patch(`/api/reviews/${reviewId}`)
      .send({
        rating: 4,
        comment: "Updated review",
      })
      .expect(401);
  });

  it("should reject another player from updating the review", async () => {
    const response = await request(app)
      .patch(`/api/reviews/${reviewId}`)
      .set("Authorization", `Bearer ${player2Token}`)
      .send({
        rating: 4,
        comment: "Updated by another player",
      })
      .expect(403);

    expect(response.body.message).toBe(
      "You are not allowed to update this review"
    );
  });

  it("should allow review owner to update the review", async () => {
    const response = await request(app)
      .patch(`/api/reviews/${reviewId}`)
      .set("Authorization", `Bearer ${playerToken}`)
      .send({
        rating: 4,
        comment: "Updated review",
      })
      .expect(200);

    expect(response.body.review).toBeDefined();
    expect(response.body.review.rating).toBe(4);
    expect(response.body.review.comment).toBe("Updated review");
  });

  // ==========================================
  // ADMIN REVIEWS
  // ==========================================

  it("should reject player from accessing admin reviews", async () => {
    await request(app)
      .get("/api/reviews/admin/all")
      .set("Authorization", `Bearer ${playerToken}`)
      .expect(403);
  });

  it("should allow admin to get all reviews", async () => {
    const response = await request(app)
      .get("/api/reviews/admin/all")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.reviews).toBeDefined();
    expect(Array.isArray(response.body.reviews)).toBe(true);
  });

  // ==========================================
  // DELETE REVIEW
  // ==========================================

  it("should reject another player from deleting the review", async () => {
    const response = await request(app)
      .delete(`/api/reviews/${reviewId}`)
      .set("Authorization", `Bearer ${player2Token}`)
      .expect(403);

    expect(response.body.message).toBe(
      "You are not allowed to delete this review"
    );
  });

  it("should allow review owner to delete the review", async () => {
    await request(app)
      .delete(`/api/reviews/${reviewId}`)
      .set("Authorization", `Bearer ${playerToken}`)
      .expect(200);
  });
});