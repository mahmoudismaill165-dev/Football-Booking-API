
import request from "supertest";
import app from "../src/app.js";
import { db } from "../src/prisma/db.js";

const password = "12345678";

let playerId: number;
let adminId: number;
let playerToken: string;
let adminToken: string;

const playerEmail = `auth-player-${Date.now()}@test.com`;
const adminEmail = `auth-admin-${Date.now()}@test.com`;

describe("Auth API", () => {
  // ==========================================
  // REGISTER
  // ==========================================

  test("should register a new user successfully", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Auth Player",
        email: playerEmail,
        password,
        phone: "01000000000",
      });

    expect(res.status).toBe(201);

    expect(res.body).toHaveProperty(
      "message",
      "User registered successfully"
    );

    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user.name).toBe("Auth Player");
    expect(res.body.user.email).toBe(playerEmail);
    expect(res.body.user.phone).toBe("01000000000");
    expect(res.body.user.role).toBe("PLAYER");

    // Password must never be returned
    expect(res.body.user.password).toBeUndefined();

    playerId = res.body.user.id;
  });

  test("should reject duplicate email registration", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Another Player",
        email: playerEmail,
        password,
      });

    expect(res.status).toBe(409);

    expect(res.body.message).toBe("Email already exists");
  });

  test("should reject registration with duplicate email even without password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: playerEmail,
      });

    expect(res.status).toBe(409);

    expect(res.body.message).toBe(
      "Email already exists"
    );
  });

  // ==========================================
  // LOGIN
  // ==========================================

  test("should login successfully with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: playerEmail,
        password,
      });

    expect(res.status).toBe(200);

    expect(res.body).toHaveProperty(
      "message",
      "Login successful"
    );

    expect(res.body).toHaveProperty("token");

    expect(res.body.user.email).toBe(playerEmail);
    expect(res.body.user.id).toBe(playerId);

    expect(res.body.user.password).toBeUndefined();

    playerToken = res.body.token;
  });

  test("should reject login with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: playerEmail,
        password: "wrong-password",
      });

    expect(res.status).toBe(401);

    expect(res.body.message).toBe(
      "Invalid email or password"
    );
  });

  test("should reject login with non-existing email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: `does-not-exist-${Date.now()}@test.com`,
        password,
      });

    expect(res.status).toBe(401);

    expect(res.body.message).toBe(
      "Invalid email or password"
    );
  });

  // ==========================================
  // PROFILE
  // ==========================================

  test("should reject profile request without token", async () => {
    const res = await request(app)
      .get("/api/auth/profile");

    expect(res.status).toBe(401);
  });

  test("should reject profile request with invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/profile")
      .set(
        "Authorization",
        "Bearer invalid-token"
      );

    expect(res.status).toBe(401);
  });

  test("should get profile with valid token", async () => {
    const res = await request(app)
      .get("/api/auth/profile")
      .set(
        "Authorization",
        `Bearer ${playerToken}`
      );

    expect(res.status).toBe(200);

    expect(res.body).toHaveProperty(
      "message",
      "You are authenticated"
    );

    expect(res.body.user.id).toBe(playerId);
    expect(res.body.user.email).toBe(playerEmail);

    expect(res.body.user.password).toBeUndefined();
  });

  // ==========================================
  // ADMIN SETUP
  // ==========================================

  test("should create admin user for admin tests", async () => {
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Auth Admin",
        email: adminEmail,
        password,
      });

    expect(registerRes.status).toBe(201);

    adminId = registerRes.body.user.id;

    await db.orm.public.User
      .where({ id: adminId })
      .update({
        role: "ADMIN",
      });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: adminEmail,
        password,
      });

    expect(loginRes.status).toBe(200);

    adminToken = loginRes.body.token;
  });

  // ==========================================
  // ADMIN TEST
  // ==========================================

  test("should reject admin endpoint for player", async () => {
    const res = await request(app)
      .get("/api/auth/admin-test")
      .set(
        "Authorization",
        `Bearer ${playerToken}`
      );

    expect(res.status).toBe(403);
  });

  test("should allow admin to access admin-test endpoint", async () => {
    const res = await request(app)
      .get("/api/auth/admin-test")
      .set(
        "Authorization",
        `Bearer ${adminToken}`
      );

    expect(res.status).toBe(200);
  });

  // ==========================================
  // GET ALL USERS
  // ==========================================

  test("should reject get all users for player", async () => {
    const res = await request(app)
      .get("/api/auth/admin/users")
      .set(
        "Authorization",
        `Bearer ${playerToken}`
      );

    expect(res.status).toBe(403);
  });

  test("should allow admin to get all users", async () => {
    const res = await request(app)
      .get("/api/auth/admin/users")
      .set(
        "Authorization",
        `Bearer ${adminToken}`
      );

    expect(res.status).toBe(200);

    expect(res.body).toHaveProperty(
      "message",
      "Users fetched successfully"
    );

    expect(Array.isArray(res.body.users)).toBe(true);

    const player = res.body.users.find(
      (user: any) => user.id === playerId
    );

    expect(player).toBeDefined();

    // Password must never be exposed
    expect(player.password).toBeUndefined();
  });

  // ==========================================
  // GET USER BY ID
  // ==========================================

  test("should reject get user by id for player", async () => {
    const res = await request(app)
      .get(`/api/auth/admin/users/${playerId}`)
      .set(
        "Authorization",
        `Bearer ${playerToken}`
      );

    expect(res.status).toBe(403);
  });

  test("should allow admin to get user by id", async () => {
    const res = await request(app)
      .get(`/api/auth/admin/users/${playerId}`)
      .set(
        "Authorization",
        `Bearer ${adminToken}`
      );

    expect(res.status).toBe(200);

    expect(res.body).toHaveProperty(
      "message",
      "User fetched successfully"
          );

    expect(res.body.user.id).toBe(playerId);
    expect(res.body.user.email).toBe(playerEmail);

    expect(res.body.user.password).toBeUndefined();
  });

  test("should return 404 when admin requests non-existing user", async () => {
    const res = await request(app)
      .get("/api/auth/admin/users/999999999")
      .set(
        "Authorization",
        `Bearer ${adminToken}`
      );

    expect(res.status).toBe(404);

    expect(res.body.message).toBe(
      "User not found"
    );
  });

  // ==========================================
  // UPDATE ROLE
  // ==========================================

  test("should reject role update for player", async () => {
    const res = await request(app)
      .patch(`/api/auth/admin/users/${playerId}/role`)
      .set(
        "Authorization",
        `Bearer ${playerToken}`
      )
      .send({
        role: "OWNER",
      });

    expect(res.status).toBe(403);
  });

  test("should reject invalid role", async () => {
    const res = await request(app)
      .patch(`/api/auth/admin/users/${playerId}/role`)
      .set(
        "Authorization",
        `Bearer ${adminToken}`
      )
      .send({
        role: "SUPER_ADMIN",
      });

    expect(res.status).toBe(400);

    expect(res.body.message).toBe(
      "Invalid role"
    );
  });

  test("should allow admin to update user role", async () => {
    const res = await request(app)
      .patch(`/api/auth/admin/users/${playerId}/role`)
      .set(
        "Authorization",
        `Bearer ${adminToken}`
      )
      .send({
        role: "OWNER",
      });

    expect(res.status).toBe(200);

    expect(res.body).toHaveProperty(
      "message",
      "User role updated successfully"
    );

    expect(res.body.user.id).toBe(playerId);
    expect(res.body.user.role).toBe("OWNER");
  });

  // ==========================================
  // DELETE USER
  // ==========================================

  test("should reject delete user for player", async () => {
    const res = await request(app)
      .delete(`/api/auth/admin/users/${playerId}`)
      .set(
        "Authorization",
        `Bearer ${playerToken}`
      );

    expect(res.status).toBe(403);
  });

  test("should allow admin to delete user", async () => {
    const res = await request(app)
      .delete(`/api/auth/admin/users/${playerId}`)
      .set(
        "Authorization",
        `Bearer ${adminToken}`
      );

    expect(res.status).toBe(200);

    expect(res.body).toHaveProperty(
      "message",
      "User deleted successfully"
    );

    expect(res.body.user.id).toBe(playerId);
  });

  test("should return 404 when deleting non-existing user", async () => {
    const res = await request(app)
      .delete("/api/auth/admin/users/999999999")
      .set(
        "Authorization",
        `Bearer ${adminToken}`
      );

    expect(res.status).toBe(404);

    expect(res.body.message).toBe(
      "User not found"
    );
  });

  // ==========================================
  // CLEANUP
  // ==========================================

  afterAll(async () => {
    const notifications =
  await db.orm.public.Notification.all();

for (const notification of notifications) {
  await db.orm.public.Notification
    .where({ id: notification.id })
    .delete();
}
    if (playerId) {
      await db.orm.public.User
        .where({ id: playerId })
        .delete();
    }

    if (adminId) {
      await db.orm.public.User
        .where({ id: adminId })
        .delete();
    }
  });
});
test("should allow admin to get statistics", async () => {
  const res = await request(app)
    .get("/api/auth/admin/stats")
    .set(
      "Authorization",
      `Bearer ${adminToken}`
    );

  expect(res.status).toBe(200);

  expect(res.body).toHaveProperty(
    "message",
    "Statistics fetched successfully"
  );

  expect(res.body.stats).toHaveProperty("users");
  expect(res.body.stats).toHaveProperty("fields");
  expect(res.body.stats).toHaveProperty("bookings");
  expect(res.body.stats).toHaveProperty("payments");
  expect(res.body.stats).toHaveProperty("reviews");
  expect(res.body.stats).toHaveProperty("tournaments");
  expect(res.body.stats).toHaveProperty("revenue");
});

test("should reject statistics for player", async () => {
  const res = await request(app)
    .get("/api/auth/admin/stats")
    .set(
      "Authorization",
      `Bearer ${playerToken}`
    );

  expect(res.status).toBe(403);
});