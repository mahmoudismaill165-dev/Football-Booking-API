import request from "supertest";
import { jest } from "@jest/globals";

jest.unstable_mockModule("../src/services/cloudinary.service.js", () => ({
  uploadImage: jest.fn(),
}));

const { uploadImage } = await import(
  "../src/services/cloudinary.service.js"
);

const { default: app } = await import("../src/app.js");
const { db } = await import("../src/prisma/db.js");

const mockedUploadImage = uploadImage as jest.MockedFunction<
  typeof uploadImage
>;

describe("Payment Module", () => {
  let ownerToken: string;
  let ownerId: number;
  let ownerEmail: string;

  let playerToken: string;
  let playerId: number;

  let secondPlayerToken: string;
  let secondPlayerId: number;

  let fieldId: number;

  let bookingId: number;
  let cancelledBookingId: number;

  let paymentId: number;

  let rejectedPaymentId: number;
  let rejectedBookingId: number;

  beforeAll(async () => {
    // =========================
    // OWNER
    // =========================

    ownerEmail = `payment-owner-${Date.now()}@test.com`;

    const ownerRegister = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Payment Owner",
        email: ownerEmail,
        password: "12345678",
        phone: "01111111111",
      });

    expect(ownerRegister.status).toBe(201);

    ownerId = ownerRegister.body.user.id;

    // نحول المستخدم لـ OWNER مباشرة من الـ DB
    // عشان التست ما يعتمدش على Admin credentials
    await db.orm.public.User
      .where({ id: ownerId })
      .update({
        role: "OWNER",
      });

    const ownerLogin = await request(app)
      .post("/api/auth/login")
      .send({
        email: ownerEmail,
        password: "12345678",
      });

    expect(ownerLogin.status).toBe(200);

    ownerToken = ownerLogin.body.token;

    // =========================
    // PLAYER
    // =========================

    const playerEmail = `payment-player-${Date.now()}@test.com`;

    const playerRegister = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Payment Player",
        email: playerEmail,
        password: "12345678",
        phone: "01222222222",
      });

    expect(playerRegister.status).toBe(201);

    playerId = playerRegister.body.user.id;

    const playerLogin = await request(app)
      .post("/api/auth/login")
      .send({
        email: playerEmail,
        password: "12345678",
      });

    expect(playerLogin.status).toBe(200);

    playerToken = playerLogin.body.token;

    // =========================
    // SECOND PLAYER
    // =========================

    const secondPlayerEmail =
      `payment-player-2-${Date.now()}@test.com`;

    const secondPlayerRegister = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Second Payment Player",
        email: secondPlayerEmail,
        password: "12345678",
        phone: "01333333333",
      });

    expect(secondPlayerRegister.status).toBe(201);

    secondPlayerId = secondPlayerRegister.body.user.id;

    const secondPlayerLogin = await request(app)
      .post("/api/auth/login")
      .send({
        email: secondPlayerEmail,
        password: "12345678",
      });

    expect(secondPlayerLogin.status).toBe(200);

    secondPlayerToken = secondPlayerLogin.body.token;

    // =========================
    // FIELD
    // =========================

    const fieldResponse = await request(app)
      .post("/api/fields")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        name: "Payment Test Field",
        description: "Field for payment tests",
        address: "Payment Test Address",
        pricePerHour: 500,
      });

    expect(fieldResponse.status).toBe(201);

    fieldId = fieldResponse.body.field.id;

    // =========================
    // BOOKING
    // =========================

    const bookingResponse = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({
        fieldId,
        startTime: "2030-01-10T10:00:00.000Z",
        endTime: "2030-01-10T12:00:00.000Z",
      });

    expect(bookingResponse.status).toBe(201);

    bookingId = bookingResponse.body.booking.id;

    // =========================
    // CANCELLED BOOKING
    // =========================

    const cancelledBookingResponse = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({
        fieldId,
        startTime: "2030-01-11T10:00:00.000Z",
        endTime: "2030-01-11T12:00:00.000Z",
      });

    expect(cancelledBookingResponse.status).toBe(201);

    cancelledBookingId =
      cancelledBookingResponse.body.booking.id;

    const cancelResponse = await request(app)
      .patch(`/api/bookings/${cancelledBookingId}/cancel`)
      .set("Authorization", `Bearer ${playerToken}`);

    expect(cancelResponse.status).toBe(200);
  });

  // =====================================================
  // CREATE PAYMENT
  // =====================================================

  it("should reject unauthenticated payment creation", async () => {
    const response = await request(app)
      .post("/api/payments")
      .send({
        bookingId,
        method: "INSTAPAY",
      });

    expect(response.status).toBe(401);
  });

  it("should reject payment for non-existing booking", async () => {
    const response = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({
        bookingId: 999999,
        method: "INSTAPAY",
      });

    expect(response.status).toBe(404);

    expect(response.body.message).toBe(
      "Booking not found"
    );
  });

  it("should reject payment by another player", async () => {
    const response = await request(app)
      .post("/api/payments")
      .set(
        "Authorization",
        `Bearer ${secondPlayerToken}`
      )
      .send({
        bookingId,
        method: "INSTAPAY",
      });

    expect(response.status).toBe(403);

    expect(response.body.message).toBe(
      "You are not allowed to pay for this booking"
    );
  });

  it("should reject payment for cancelled booking", async () => {
    const response = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({
        bookingId: cancelledBookingId,
        method: "INSTAPAY",
      });

    expect(response.status).toBe(400);

    expect(response.body.message).toBe(
      "Cannot pay for a cancelled booking"
    );
  });

  it("should create payment successfully", async () => {
    const response = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({
        bookingId,
        method: "INSTAPAY",
        transactionId: "TXN-PAYMENT-001",
      });

    expect(response.status).toBe(201);

    expect(response.body.message).toBe(
      "Payment created successfully"
    );

    expect(response.body.payment).toBeDefined();

    expect(response.body.payment.bookingId).toBe(
      bookingId
    );

    expect(response.body.payment.amount).toBe(1000);

    expect(response.body.payment.method).toBe(
      "INSTAPAY"
    );

    expect(response.body.payment.transactionId).toBe(
      "TXN-PAYMENT-001"
    );

    expect(response.body.payment.status).toBe(
      "PENDING"
    );

    paymentId = response.body.payment.id;
  });

  // =====================================================
  // PAYMENT PROOF
  // =====================================================

  it("should reject unauthenticated proof upload", async () => {
    const response = await request(app)
      .post(`/api/payments/${paymentId}/proof`);

    expect(response.status).toBe(401);
  });

  it("should reject proof upload without file", async () => {
    const response = await request(app)
      .post(`/api/payments/${paymentId}/proof`)
      .set("Authorization", `Bearer ${playerToken}`);

    expect(response.status).toBe(400);
  });

  it("should reject proof upload for non-existing payment", async () => {
    const response = await request(app)
      .post("/api/payments/999999/proof")
      .set("Authorization", `Bearer ${playerToken}`)
      .attach(
        "proofImage",
        Buffer.from("fake-image"),
        "proof.jpg"
      );

    expect(response.status).toBe(404);

    expect(response.body.message).toBe(
      "Payment not found"
    );
  });

  it("should reject proof upload by another player", async () => {
    const response = await request(app)
      .post(`/api/payments/${paymentId}/proof`)
      .set(
        "Authorization",
        `Bearer ${secondPlayerToken}`
      )
      .attach(
        "proofImage",
        Buffer.from("fake-image"),
        "proof.jpg"
      );

    expect(response.status).toBe(403);

    expect(response.body.message).toBe(
      "You are not allowed to upload proof for this payment"
    );
  });

  it("should upload payment proof successfully", async () => {
    mockedUploadImage.mockResolvedValueOnce({
      secure_url:
        "https://res.cloudinary.com/test/payment-proof.jpg",
    });

    const response = await request(app)
      .post(`/api/payments/${paymentId}/proof`)
      .set("Authorization", `Bearer ${playerToken}`)
      .attach(
        "proofImage",
        Buffer.from("fake-image"),
        "proof.jpg"
      );

    expect(response.status).toBe(200);

    expect(response.body.message).toBe(
      "Payment proof uploaded successfully"
    );

    expect(
      response.body.payment.proofImage
    ).toBe(
      "https://res.cloudinary.com/test/payment-proof.jpg"
    );

    expect(mockedUploadImage).toHaveBeenCalledTimes(1);
  });

  // =====================================================
  // VERIFY PAYMENT
  // =====================================================

  it("should reject unauthenticated payment verification", async () => {
    const response = await request(app)
      .patch(`/api/payments/${paymentId}/verify`)
      .send({
        status: "VERIFIED",
      });

    expect(response.status).toBe(401);
  });

  it("should reject payment verification by player", async () => {
    const response = await request(app)
      .patch(`/api/payments/${paymentId}/verify`)
      .set("Authorization", `Bearer ${playerToken}`)
      .send({
        status: "VERIFIED",
      });

    expect(response.status).toBe(403);
  });

  it("should reject verification for non-existing payment", async () => {
    const response = await request(app)
      .patch("/api/payments/999999/verify")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        status: "VERIFIED",
      });

    expect(response.status).toBe(404);

    expect(response.body.message).toBe(
      "Payment not found"
    );
  });

  it("should reject verification by another owner", async () => {
    const otherOwnerEmail =
      `other-owner-${Date.now()}@test.com`;

    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Other Owner",
        email: otherOwnerEmail,
        password: "12345678",
        phone: "01444444444",
      });

    expect(registerResponse.status).toBe(201);

    const otherOwnerId =
      registerResponse.body.user.id;

    await db.orm.public.User
      .where({ id: otherOwnerId })
      .update({
        role: "OWNER",
      });

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: otherOwnerEmail,
        password: "12345678",
      });

    expect(loginResponse.status).toBe(200);

    const otherOwnerToken =
      loginResponse.body.token;

    const response = await request(app)
      .patch(`/api/payments/${paymentId}/verify`)
      .set(
        "Authorization",
        `Bearer ${otherOwnerToken}`
      )
      .send({
        status: "VERIFIED",
      });

    expect(response.status).toBe(403);

    expect(response.body.message).toBe(
      "You are not allowed to verify this payment"
    );

   const notifications =
  await db.orm.public.Notification
    .where({ userId: otherOwnerId })
    .all();

for (const notification of notifications) {
  await db.orm.public.Notification
    .where({ id: notification.id })
    .delete();
}

await db.orm.public.User
  .where({ id: otherOwnerId })
  .delete();
  });

  it("should verify payment and confirm booking", async () => {
    const response = await request(app)
      .patch(`/api/payments/${paymentId}/verify`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        status: "VERIFIED",
      });

    expect(response.status).toBe(200);

    expect(response.body.message).toBe(
      "Payment status updated successfully"
    );

    expect(response.body.payment.status).toBe(
      "VERIFIED"
    );

    const booking = await db.orm.public.Booking
      .where({ id: bookingId })
      .first();

    expect(booking).toBeDefined();

    expect(booking?.status).toBe("CONFIRMED");
  });

  it("should reject verification of an already verified payment", async () => {
    const response = await request(app)
      .patch(`/api/payments/${paymentId}/verify`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        status: "VERIFIED",
      });

    expect(response.status).toBe(400);

    expect(response.body.message).toBe(
      "Only pending payments can be verified"
    );
  });

  // =====================================================
  // REJECT PAYMENT
  // =====================================================

  it("should reject payment and keep booking pending", async () => {
    const rejectedBookingResponse = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({
        fieldId,
        startTime: "2030-01-12T10:00:00.000Z",
        endTime: "2030-01-12T12:00:00.000Z",
      });

    expect(rejectedBookingResponse.status).toBe(201);

    rejectedBookingId =
      rejectedBookingResponse.body.booking.id;

    const rejectedPaymentResponse = await request(app)
      .post("/api/payments")
      .set("Authorization", `Bearer ${playerToken}`)
      .send({
        bookingId: rejectedBookingId,
        method: "INSTAPAY",
        transactionId: "TXN-REJECT-001",
      });

    expect(rejectedPaymentResponse.status).toBe(201);

    rejectedPaymentId =
      rejectedPaymentResponse.body.payment.id;

    const verifyResponse = await request(app)
      .patch(
        `/api/payments/${rejectedPaymentId}/verify`
      )
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        status: "REJECTED",
      });

    expect(verifyResponse.status).toBe(200);

    expect(
      verifyResponse.body.payment.status
    ).toBe("REJECTED");

    const booking = await db.orm.public.Booking
      .where({ id: rejectedBookingId })
      .first();

    expect(booking).toBeDefined();

    expect(booking?.status).toBe("PENDING");
  });

  // =====================================================
  // CLEANUP
  // =====================================================

  afterAll(async () => {
    const notifications =
  await db.orm.public.Notification.all();

for (const notification of notifications) {
  await db.orm.public.Notification
    .where({ id: notification.id })
    .delete();
}
    // Payments
    if (paymentId) {
      await db.orm.public.Payment
        .where({ id: paymentId })
        .delete();
    }

    if (rejectedPaymentId) {
      await db.orm.public.Payment
        .where({ id: rejectedPaymentId })
        .delete();
    }

    // Bookings
    if (bookingId) {
      await db.orm.public.Booking
        .where({ id: bookingId })
        .delete();
    }

    if (cancelledBookingId) {
      await db.orm.public.Booking
        .where({ id: cancelledBookingId })
        .delete();
    }

    if (rejectedBookingId) {
      await db.orm.public.Booking
        .where({ id: rejectedBookingId })
        .delete();
    }

    // Field
    if (fieldId) {
      await db.orm.public.Field
        .where({ id: fieldId })
        .delete();
    }

   // Users
if (ownerId) {
  for (const notification of notifications) {
    await db.orm.public.Notification
      .where({ id: notification.id })
      .delete();
  }

  await db.orm.public.User
    .where({ id: ownerId })
    .delete();
}

if (playerId) {
  const notifications =
    await db.orm.public.Notification
      .where({ userId: playerId })
      .all();

  for (const notification of notifications) {
    await db.orm.public.Notification
      .where({ id: notification.id })
      .delete();
  }

  await db.orm.public.User
    .where({ id: playerId })
    .delete();
}

if (secondPlayerId) {
  const notifications =
    await db.orm.public.Notification
      .where({ userId: secondPlayerId })
      .all();

  for (const notification of notifications) {
    await db.orm.public.Notification
      .where({ id: notification.id })
      .delete();
  }

  await db.orm.public.User
    .where({ id: secondPlayerId })
    .delete();
}
  });
});