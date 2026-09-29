# ⚽ Koora Arena - Football Booking & Tournament API

[![Node.js](https://img.shields.io/badge/Node.js-v20-brightgreen.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v5.0-blue.svg)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.9-blue.svg)](https://www.typescriptlang.org/)
[![Prisma 8](https://img.shields.io/badge/Prisma-v8.0--rc-5A67D8.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16-336791.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![Build & Test](https://github.com/mahmoudismaill165-dev/Football-Booking-API/actions/workflows/ci.yml/badge.svg)](https://github.com/mahmoudismaill165-dev/Football-Booking-API/actions)

A robust, enterprise-grade RESTful API for pitch/field booking, payment verification, tournament organization, and player management. Built with Node.js, Express, TypeScript, Prisma 8, and PostgreSQL.

---

## 🚀 Key Improvements & Architecture Highlights

1. **Race-Condition-Free Concurrency Control**:
   - Uses PostgreSQL **advisory transaction locks** (`pg_advisory_xact_lock(fieldId)`) wrapped inside **atomic database transactions** (`db.transaction`).
   - Prevents double-booking race conditions when multiple concurrent requests attempt to reserve the same field at the exact same millisecond.

2. **Security & Protection**:
   - **Rate Limiting**: Integrated `express-rate-limit` on authentication endpoints (`/api/auth/login`, `/api/auth/register`) to prevent brute-force attacks.
   - **Security Headers & CORS**: Integrated `helmet` and custom CORS policies.
   - **Dual Token Auth**: Access tokens (1h) and Refresh tokens (7d) with `/api/auth/refresh` endpoint.
   - **File Validation**: MIME type (`JPEG`, `PNG`, `WEBP`, `PDF`) & 5MB file size limits on payment proof uploads.
   - **Standardized Error Envelope**: `{ success: false, message: "...", error: { message, statusCode } }`.

3. **Production Readiness**:
   - **Docker & Docker Compose**: Single-command startup (`docker-compose up -d`) with auto-configured PostgreSQL 16 container and healthchecks.
   - **CI / GitHub Actions**: Automated integration tests and build verification pipeline on every commit/PR.

4. **Features & Business Logic**:
   - **Cancellation Policy**: Prevents player cancellations less than 2 hours before the booking start time.
   - **Pagination & Filtering**: Comprehensive search, status filtering, and page/limit support across fields and bookings.

---

## 📊 Database Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--o{ FIELD : "owns"
    USER ||--o{ BOOKING : "makes"
    USER ||--o{ TEAM_MEMBER : "belongs to"
    USER ||--o{ REVIEW : "writes"
    USER ||--o{ TOURNAMENT : "organizes"

    FIELD ||--o{ BOOKING : "has"
    FIELD ||--o{ REVIEW : "receives"
    FIELD ||--o{ MATCH : "hosts"

    BOOKING ||--o| PAYMENT : "generates"

    TEAM ||--o{ TEAM_MEMBER : "contains"
    TEAM ||--o{ TOURNAMENT_TEAM : "participates"
    TEAM ||--o{ MATCH : "homeMatches"
    TEAM ||--o{ MATCH : "awayMatches"

    TOURNAMENT ||--o{ TOURNAMENT_TEAM : "includes"
    TOURNAMENT ||--o{ MATCH : "schedules"

    USER {
        int id PK
        string name
        string email UK
        string password
        string phone
        Role role
        datetime createdAt
    }

    FIELD {
        int id PK
        string name
        string address
        float pricePerHour
        int ownerId FK
    }

    BOOKING {
        int id PK
        int userId FK
        int fieldId FK
        datetime startTime
        datetime endTime
        float totalPrice
        BookingStatus status
    }

    PAYMENT {
        int id PK
        int bookingId FK
        float amount
        string method
        string transactionId
        PaymentStatus status
    }
```

---

## 🛠️ Tech Stack & Dependencies

- **Runtime & Language**: Node.js v20+, TypeScript v5.9+
- **Framework**: Express.js v5.0
- **Database & ORM**: PostgreSQL 16, Prisma 8 (`@prisma/orm-postgres`)
- **Security**: `helmet`, `cors`, `express-rate-limit`, `bcrypt`, `jsonwebtoken`
- **Uploads & Media**: Multer, Cloudinary
- **Documentation**: Swagger UI Express (`/api-docs`)
- **Testing**: Jest, Supertest (100% route and service coverage)
- **Containerization**: Docker, Docker Compose

## 📁 Project Architecture & Monorepo Structure

```text
football-booking-api/
│
├── backend/                       # Express.js REST API & Database Layer
│   ├── src/                       # Application Source Code
│   │   ├── config/                # Swagger & Cloudinary configuration
│   │   ├── controllers/           # HTTP Request Handlers
│   │   ├── middlewares/           # Auth, Roles, Rate Limiting, Uploads, Error Handling
│   │   ├── prisma/                # Prisma 8 Client & DB Connection
│   │   ├── routes/                # Express Route Handlers
│   │   ├── services/              # Business Logic & Advisory Lock Transactions
│   │   ├── utils/                 # ApiError & AsyncHandler helpers
│   │   └── validators/            # Zod validation schemas
│   ├── tests/                     # Jest & Supertest Integration Test Suite (234 tests)
│   ├── prisma/                    # Database schema & migrations
│   ├── docs/                      # Prisma 8 reference documentation
│   ├── Dockerfile                 # Multi-stage production container
│   └── package.json
│
├── frontend/                      # React, Vite & Modern Web Client
│   ├── src/                       # Components, Pages, Context, Hooks
│   ├── index.html
│   └── package.json
│
├── docker-compose.yml             # Orchestration for PostgreSQL & Backend
├── .github/workflows/ci.yml       # GitHub Actions CI Automation
├── package.json                   # Root monorepo scripts
└── README.md
```

---

## 🔒 Concurrency & Booking Conflict Protection

Standard implementations retrieve existing bookings with `findFirst` and then create a new record. Under high concurrent traffic, two overlapping requests can read simultaneously and both proceed to create overlapping bookings.

### Our Solution: Advisory Transaction Locks
```typescript
await db.transaction(async (tx) => {
  // Acquire PostgreSQL transaction-level advisory lock on pitch ID
  await tx.raw.sql`SELECT pg_advisory_xact_lock(${fieldId})`;

  // Check existing active bookings for this field
  const conflicts = await tx.orm.public.Booking.where({ fieldId }).all();
  if (hasOverlap(conflicts)) {
    throw new ApiError("Field is already booked during this time", 409);
  }

  // Atomically create booking
  return await tx.orm.public.Booking.create({ ... });
});
```

---

## 📚 API Endpoints Summary

| Category | Method | Endpoint | Auth Required | Description |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/register` | Rate-Limited | Register a new user |
| **Auth** | `POST` | `/api/auth/login` | Rate-Limited | Login & obtain access/refresh tokens |
| **Auth** | `POST` | `/api/auth/refresh` | Public | Refresh access token |
| **Auth** | `GET` | `/api/auth/profile` | `User` | Get current profile |
| **Fields** | `GET` | `/api/fields` | Public | List pitches (search, filter, pagination) |
| **Fields** | `POST` | `/api/fields` | `OWNER / ADMIN` | Create a new pitch |
| **Fields** | `GET` | `/api/fields/:id` | Public | Get pitch details |
| **Bookings** | `POST` | `/api/bookings` | `PLAYER` | Create pitch booking |
| **Bookings** | `GET` | `/api/bookings` | `PLAYER` | List user bookings (paginated) |
| **Bookings** | `GET` | `/api/bookings/owner` | `OWNER` | List pitch owner bookings |
| **Bookings** | `PATCH` | `/api/bookings/:id/confirm` | `OWNER` | Confirm booking |
| **Bookings** | `PATCH` | `/api/bookings/:id/cancel` | `PLAYER / OWNER` | Cancel booking (enforces 2h policy) |
| **Payments** | `POST` | `/api/payments` | `PLAYER` | Initiate booking payment |
| **Payments** | `POST` | `/api/payments/:id/proof` | `PLAYER` | Upload payment receipt (validated upload) |
| **Payments** | `PATCH` | `/api/payments/:id/verify` | `OWNER / ADMIN` | Verify & approve payment |
| **Reviews** | `POST` | `/api/reviews` | `PLAYER` | Submit pitch review & rating |
| **Reviews** | `GET` | `/api/reviews/field/:id` | Public | Fetch reviews for a pitch |
| **Tournaments**| `POST` | `/api/tournaments` | `ORGANIZER` | Create tournament |
| **Tournaments**| `POST` | `/api/tournaments/:id/join` | `PLAYER` | Register team for tournament |

---

## 📖 Interactive API Documentation (Swagger)

Interactive Swagger UI documentation is live on `/api-docs`:

```text
http://localhost:8000/api-docs
```

It includes interactive endpoint runners, request body schemas, and response previews.

---

## ⚡ Quick Start & Local Development

### 1. Install All Dependencies (Root, Backend & Frontend)
```bash
npm run install:all
```

### 2. Environment Configuration
Ensure `backend/.env` is configured (see `backend/.env.example`):
```env
PORT=8000
DATABASE_URL="postgresql://user:password@localhost:5432/football_booking"
JWT_SECRET="your-jwt-secret-key"
```

### 3. Run Both Backend & Frontend Simultaneously
```bash
npm run dev:all
```
- **Frontend App**: [http://localhost:5173](http://localhost:5173) (or `5174` if 5173 is occupied)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Swagger Documentation**: [http://localhost:8000/api-docs](http://localhost:8000/api-docs)

### Separate Service Commands:
```bash
npm run dev:backend   # Start only the Express API (Port 8000)
npm run dev:frontend  # Start only the Vite React UI (Port 5173)
```

---

## 🐳 Running with Docker

1. **Launch with Docker Compose**:
   ```bash
   docker-compose up -d --build
   ```

2. **Verify API Health & Docs**:
   ```bash
   curl http://localhost:8000/
   # Or visit http://localhost:8000/api-docs
   ```

---

## 🧪 Testing

Run the comprehensive integration test suite (234 tests passing across all controllers, services, and transactions):

```bash
npm test
# or
npm run test:backend
```

---

## 📜 License

This project is licensed under the ISC License.

Developed by **Mahmoud Ismail** - Backend & Full-Stack Developer.
