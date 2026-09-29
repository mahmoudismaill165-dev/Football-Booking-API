import request from "supertest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import app from "../src/app.js";
import { db } from "../src/prisma/db.js";

describe("Field Module", () => {
  let ownerId: number;
  let playerId: number;

  let ownerToken: string;
  let playerToken: string;

  let fieldId: number;

  beforeAll(async () => {
    const password = await bcrypt.hash("123456", 10);

    const owner = await db.orm.public.User.create({
      name: "Field Test Owner",
      email: `field-owner-${Date.now()}@test.com`,
      password,
      role: "OWNER",
    });

    const player = await db.orm.public.User.create({
      name: "Field Test Player",
      email: `field-player-${Date.now()}@test.com`,
      password,
      role: "PLAYER",
    });

    ownerId = owner.id;
    playerId = player.id;

    ownerToken = jwt.sign(
      {
        id: owner.id,
        role: owner.role,
      },
      process.env.JWT_SECRET!
    );

    playerToken = jwt.sign(
      {
        id: player.id,
        role: player.role,
      },
      process.env.JWT_SECRET!
    );
  });

afterAll(async () => {
  const fields = await db.orm.public.Field
    .where({ ownerId })
    .all();

  for (const field of fields) {
    await db.orm.public.Field
      .where({ id: field.id })
      .delete();
  }

  await db.orm.public.User
    .where({ id: ownerId })
    .delete();

  await db.orm.public.User
    .where({ id: playerId })
    .delete();
});

  describe("POST /api/fields", () => {
    it("should reject unauthenticated user", async () => {
      const response = await request(app)
        .post("/api/fields")
        .send({
          name: "Test Stadium",
          description: "Test field",
          address: "Mansoura",
          pricePerHour: 300,
        });

      expect(response.status).toBe(401);
    });

    it("should reject PLAYER from creating a field", async () => {
      const response = await request(app)
        .post("/api/fields")
        .set("Authorization", `Bearer ${playerToken}`)
        .send({
          name: "Player Stadium",
          description: "Test field",
          address: "Mansoura",
          pricePerHour: 300,
        });

      expect(response.status).toBe(403);
    });

    it("should allow OWNER to create a field", async () => {
      const response = await request(app)
        .post("/api/fields")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Test Stadium",
          description: "Test field",
          address: "Mansoura",
          pricePerHour: 300,
        });

      expect(response.status).toBe(201);

      expect(response.body.field).toBeDefined();
      expect(response.body.field.name).toBe("Test Stadium");
      expect(response.body.field.address).toBe("Mansoura");
      expect(response.body.field.pricePerHour).toBe(300);
      expect(response.body.field.ownerId).toBe(ownerId);

      fieldId = response.body.field.id;
    });

    it("should reject invalid field data", async () => {
      const response = await request(app)
        .post("/api/fields")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "",
          address: "",
          pricePerHour: -100,
        });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/fields", () => {
    beforeAll(async () => {
      await db.orm.public.Field.create({
        name: "Cheap Stadium",
        description: "Cheap field",
        address: "Mansoura",
        pricePerHour: 100,
        ownerId,
      });

      await db.orm.public.Field.create({
        name: "Premium Stadium",
        description: "Premium field",
        address: "Cairo",
        pricePerHour: 500,
        ownerId,
      });

      await db.orm.public.Field.create({
        name: "Football Arena",
        description: "Arena",
        address: "Alexandria",
        pricePerHour: 300,
        ownerId,
      });
    });

    it("should fetch all fields", async () => {
      const response = await request(app)
        .get("/api/fields");

      expect(response.status).toBe(200);
      expect(response.body.fields).toBeDefined();
      expect(Array.isArray(response.body.fields)).toBe(true);
    });

    it("should search fields by name", async () => {
      const response = await request(app)
        .get("/api/fields")
        .query({
          search: "Premium",
        });

      expect(response.status).toBe(200);
      expect(response.body.fields.length).toBeGreaterThan(0);
      expect(response.body.fields[0].name).toBe("Premium Stadium");
    });

    it("should search fields by address", async () => {
      const response = await request(app)
        .get("/api/fields")
        .query({
          search: "Alexandria",
        });

      expect(response.status).toBe(200);
      expect(response.body.fields.length).toBeGreaterThan(0);
      expect(response.body.fields[0].address).toBe("Alexandria");
    });

    it("should filter by minimum price", async () => {
      const response = await request(app)
        .get("/api/fields")
        .query({
          minPrice: 300,
        });

      expect(response.status).toBe(200);

      for (const field of response.body.fields) {
        expect(field.pricePerHour).toBeGreaterThanOrEqual(300);
      }
    });

    it("should filter by maximum price", async () => {
      const response = await request(app)
        .get("/api/fields")
        .query({
          maxPrice: 300,
        });

      expect(response.status).toBe(200);

      for (const field of response.body.fields) {
        expect(field.pricePerHour).toBeLessThanOrEqual(300);
      }
    });

    it("should filter by minimum and maximum price", async () => {
      const response = await request(app)
        .get("/api/fields")
        .query({
          minPrice: 200,
          maxPrice: 400,
        });

      expect(response.status).toBe(200);

      for (const field of response.body.fields) {
        expect(field.pricePerHour).toBeGreaterThanOrEqual(200);
        expect(field.pricePerHour).toBeLessThanOrEqual(400);
      }
    });

    it("should sort fields by price ascending", async () => {
      const response = await request(app)
        .get("/api/fields")
        .query({
          sort: "priceAsc",
        });

      expect(response.status).toBe(200);

      const prices = response.body.fields.map(
        (field: { pricePerHour: number }) =>
          field.pricePerHour
      );

      expect(prices).toEqual(
        [...prices].sort((a, b) => a - b)
      );
    });

    it("should sort fields by price descending", async () => {
      const response = await request(app)
        .get("/api/fields")
        .query({
          sort: "priceDesc",
        });

      expect(response.status).toBe(200);

      const prices = response.body.fields.map(
        (field: { pricePerHour: number }) =>
          field.pricePerHour
      );

      expect(prices).toEqual(
        [...prices].sort((a, b) => b - a)
      );
    });

    it("should paginate fields", async () => {
      const response = await request(app)
        .get("/api/fields")
        .query({
          page: 1,
          limit: 2,
        });

      expect(response.status).toBe(200);

      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.fields.length).toBeLessThanOrEqual(2);
    });

    it("should return empty result when search matches nothing", async () => {
      const response = await request(app)
        .get("/api/fields")
        .query({
          search: "THIS_FIELD_DOES_NOT_EXIST",
        });

      expect(response.status).toBe(200);
      expect(response.body.fields).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
    });
  });

  describe("GET /api/fields/:id", () => {
    it("should fetch field by ID", async () => {
      const response = await request(app)
        .get(`/api/fields/${fieldId}`);

      expect(response.status).toBe(200);
      expect(response.body.field).toBeDefined();
      expect(response.body.field.id).toBe(fieldId);
    });

    it("should return 404 for non-existing field", async () => {
      const response = await request(app)
        .get("/api/fields/999999999");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Field not found");
    });

    it("should reject invalid field ID", async () => {
      const response = await request(app)
        .get("/api/fields/abc");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Invalid field ID");
    });
  });
});