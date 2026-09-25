import swaggerUi from "swagger-ui-express";
import type { Express } from "express";

const swaggerDocument = {
  openapi: "3.0.0",

  info: {
    title: "Football Booking API",
    version: "1.0.0",
    description:
      "REST API for football field booking, payments, reviews, tournaments, authentication, and notifications.",
  },

  servers: [
    {
      url: "http://localhost:8000",
      description: "Local development server",
    },
  ],

  tags: [
    {
      name: "Auth",
      description: "Authentication and user management",
    },
    {
      name: "Fields",
      description: "Football field management",
    },
    {
      name: "Bookings",
      description: "Football field bookings",
    },
    {
      name: "Payments",
      description: "Booking payments and payment proofs",
    },
    {
      name: "Reviews",
      description: "Football field reviews",
    },
    {
      name: "Tournaments",
      description: "Football tournaments",
    },
    {
      name: "Notifications",
      description: "User notifications",
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },

  paths: {
    // =========================
    // AUTH
    // =========================

    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
  required: true,
  content: {
    "application/json": {
      schema: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: {
            type: "string",
            example: "Mahmoud Ismail",
          },
          email: {
            type: "string",
            format: "email",
            example: "mahmoud@example.com",
          },
          password: {
            type: "string",
            format: "password",
            example: "12345678",
          },
          phone: {
            type: "string",
            example: "01012345678",
          },
        },
      },
    },
  },
},
        responses: {
          201: {
            description: "User registered successfully",
          },
          400: {
            description: "Validation error",
          },
        },
      },
    },

    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user",
        requestBody: {
  required: true,
  content: {
    "application/json": {
      schema: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "mahmoud@example.com",
          },
          password: {
            type: "string",
            format: "password",
            example: "12345678",
          },
        },
      },
    },
  },
},
        responses: {
          200: {
            description: "Login successful",
          },
          401: {
            description: "Invalid credentials",
          },
        },
      },
    },

    "/api/auth/profile": {
      get: {
        tags: ["Auth"],
        summary: "Get authenticated user profile",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Profile fetched successfully",
          },
          401: {
            description: "Authentication required",
          },
        },
      },
    },

    "/api/auth/admin-test": {
      get: {
        tags: ["Auth"],
        summary: "Test admin authorization",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Welcome Admin",
          },
          401: {
            description: "Authentication required",
          },
          403: {
            description: "Admin access required",
          },
        },
      },
    },

    "/api/auth/admin/users": {
      get: {
        tags: ["Auth"],
        summary: "Get all users",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Users fetched successfully",
          },
          403: {
            description: "Admin access required",
          },
        },
      },
    },

   "/api/auth/admin/users/{id}": {
  get: {
    tags: ["Auth"],
    summary: "Get user by ID",
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: {
          type: "integer",
        },
      },
    ],
    responses: {
      200: {
        description: "User fetched successfully",
      },
      404: {
        description: "User not found",
      },
    },
  },

  delete: {
    tags: ["Auth"],
    summary: "Delete user",
    security: [{ bearerAuth: [] }],
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: {
          type: "integer",
        },
      },
    ],
    responses: {
      200: {
        description: "User deleted successfully",
      },
      404: {
        description: "User not found",
      },
    },
  },
},
    "/api/auth/admin/users/{id}/role": {
      patch: {
        tags: ["Auth"],
        summary: "Change user role",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          200: {
            description: "User role updated successfully",
          },
          403: {
            description: "Admin access required",
          },
        },
      },
    },

    "/api/auth/admin/stats": {
      get: {
        tags: ["Auth"],
        summary: "Get admin statistics",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Statistics fetched successfully",
          },
          403: {
            description: "Admin access required",
          },
        },
      },
    },

    // =========================
    // FIELDS
    // =========================

    "/api/fields": {
      get: {
        tags: ["Fields"],
        summary: "Get all football fields",
        parameters: [
          {
            name: "search",
            in: "query",
            required: false,
            schema: {
              type: "string",
            },
          },
          {
            name: "city",
            in: "query",
            required: false,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Fields fetched successfully",
          },
        },
      },

      post: {
        tags: ["Fields"],
        summary: "Create football field",
        security: [{ bearerAuth: [] }],
        responses: {
          201: {
            description: "Field created successfully",
          },
          403: {
            description: "Owner access required",
          },
        },
      },
    },

    "/api/fields/{id}": {
      get: {
        tags: ["Fields"],
        summary: "Get football field by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          200: {
            description: "Field fetched successfully",
          },
          404: {
            description: "Field not found",
          },
        },
      },
    },

    // =========================
    // BOOKINGS
    // =========================

"/api/bookings": {
  get: {
    tags: ["Bookings"],
    summary: "Get current user's bookings",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Bookings fetched successfully",
      },
    },
  },

  post: {
    tags: ["Bookings"],
    summary: "Create booking",
    security: [{ bearerAuth: [] }],

    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: [
              "fieldId",
              "startTime",
              "endTime",
            ],
            properties: {
              fieldId: {
                type: "integer",
                example: 1,
              },
              startTime: {
                type: "string",
                format: "date-time",
                example:
                  "2026-09-26T18:00:00.000Z",
              },
              endTime: {
                type: "string",
                format: "date-time",
                example:
                  "2026-09-26T20:00:00.000Z",
              },
            },
          },
        },
      },
    },

    responses: {
      201: {
        description: "Booking created successfully",
      },
      409: {
        description:
          "Field is already booked during this time",
      },
    },
  },
},
    "/api/bookings/owner": {
      get: {
        tags: ["Bookings"],
        summary: "Get bookings for owner's fields",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Owner bookings fetched successfully",
          },
          403: {
            description: "Owner access required",
          },
        },
      },
    },

    "/api/bookings/{id}/confirm": {
      patch: {
        tags: ["Bookings"],
        summary: "Confirm booking",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          200: {
            description: "Booking confirmed successfully",
          },
          403: {
            description: "Not allowed to confirm this booking",
          },
          404: {
            description: "Booking not found",
          },
        },
      },
    },

    "/api/bookings/{id}/cancel": {
      patch: {
        tags: ["Bookings"],
        summary: "Cancel booking",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          200: {
            description: "Booking cancelled successfully",
          },
          403: {
            description: "Not allowed to cancel this booking",
          },
          404: {
            description: "Booking not found",
          },
        },
      },
    },

    // =========================
    // PAYMENTS
    // =========================

    "/api/payments": {
      post: {
        tags: ["Payments"],
        summary: "Create payment",
        security: [{ bearerAuth: [] }],
        responses: {
          201: {
            description: "Payment created successfully",
          },
        },
      },
    },

    "/api/payments/{id}/proof": {
      post: {
        tags: ["Payments"],
        summary: "Upload payment proof",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  proofImage: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Payment proof uploaded successfully",
          },
        },
      },
    },

    "/api/payments/{id}/verify": {
      patch: {
        tags: ["Payments"],
        summary: "Verify payment",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          200: {
            description: "Payment verification completed",
          },
          403: {
            description: "Owner access required",
          },
        },
      },
    },

    // =========================
    // REVIEWS
    // =========================

    "/api/reviews": {
      post: {
        tags: ["Reviews"],
        summary: "Create review",
        security: [{ bearerAuth: [] }],
        responses: {
          201: {
            description: "Review created successfully",
          },
        },
      },
    },

    "/api/reviews/field/{fieldId}": {
      get: {
        tags: ["Reviews"],
        summary: "Get reviews for a field",
        parameters: [
          {
            name: "fieldId",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          200: {
            description: "Field reviews fetched successfully",
          },
        },
      },
    },

    "/api/reviews/{id}": {
      patch: {
        tags: ["Reviews"],
        summary: "Update review",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          200: {
            description: "Review updated successfully",
          },
        },
      },

      delete: {
        tags: ["Reviews"],
        summary: "Delete review",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          200: {
            description: "Review deleted successfully",
          },
        },
      },
    },

    "/api/reviews/admin/all": {
      get: {
        tags: ["Reviews"],
        summary: "Get all reviews",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "All reviews fetched successfully",
          },
          403: {
            description: "Admin access required",
          },
        },
      },
    },

    // =========================
    // TOURNAMENTS
    // =========================

    "/api/tournaments": {
      get: {
        tags: ["Tournaments"],
        summary: "Get all tournaments",
        responses: {
          200: {
            description: "Tournaments fetched successfully",
          },
        },
      },

      post: {
        tags: ["Tournaments"],
        summary: "Create tournament",
        security: [{ bearerAuth: [] }],
        responses: {
          201: {
            description: "Tournament created successfully",
          },
          403: {
            description: "Organizer access required",
          },
        },
      },
    },

    "/api/tournaments/{id}": {
      get: {
        tags: ["Tournaments"],
        summary: "Get tournament by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          200: {
            description: "Tournament fetched successfully",
          },
          404: {
            description: "Tournament not found",
          },
        },
      },

      patch: {
        tags: ["Tournaments"],
        summary: "Update tournament",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          200: {
            description: "Tournament updated successfully",
          },
        },
      },

      delete: {
        tags: ["Tournaments"],
        summary: "Delete tournament",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          200: {
            description: "Tournament deleted successfully",
          },
        },
      },
    },

    "/api/tournaments/{id}/join": {
      post: {
        tags: ["Tournaments"],
        summary: "Join tournament",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          200: {
            description: "Joined tournament successfully",
          },
        },
      },
    },

    "/api/tournaments/{id}/participants": {
      get: {
        tags: ["Tournaments"],
        summary: "Get tournament participants",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          200: {
            description: "Participants fetched successfully",
          },
        },
      },
    },

    // =========================
    // NOTIFICATIONS
    // =========================

    "/api/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "Get current user's notifications",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Notifications fetched successfully",
          },
          401: {
            description: "Authentication required",
          },
        },
      },
    },

    "/api/notifications/{id}/read": {
      patch: {
        tags: ["Notifications"],
        summary: "Mark notification as read",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer",
            },
          },
        ],
        responses: {
          200: {
            description: "Notification marked as read",
          },
          404: {
            description: "Notification not found",
          },
        },
      },
    },
  },
};

export function setupSwagger(app: Express) {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
  );
}