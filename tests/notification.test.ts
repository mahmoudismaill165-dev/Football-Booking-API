import request from "supertest";
import app from "../src/app.js";
import jwt from "jsonwebtoken";

describe("Notification API", () => {
  let token: string;
  let userId: number;
  let notificationId: number;

  beforeAll(async () => {
    userId = 1;

    token = jwt.sign(
      {
        id: userId,
        role: "PLAYER",
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1h",
      }
    );
  });

  it("should reject unauthenticated request", async () => {
    const res = await request(app)
      .get("/api/notifications");

    expect(res.status).toBe(401);
  });

  it("should fetch user notifications", async () => {
    const res = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      "Notifications fetched successfully"
    );
    expect(Array.isArray(res.body.notifications)).toBe(true);
  });

  it("should reject invalid notification id", async () => {
    const res = await request(app)
      .patch("/api/notifications/999999/read")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});