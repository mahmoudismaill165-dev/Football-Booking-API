# ⚽ Koora Arena - Football Booking & Tournament Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20-brightgreen.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v5.0-blue.svg)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.9-blue.svg)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-v8.0--rc-5A67D8.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16-336791.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![Build & Test](https://github.com/mahmoudismaill165-dev/Football-Booking-API/actions/workflows/ci.yml/badge.svg)](https://github.com/mahmoudismaill165-dev/Football-Booking-API/actions)

A full-stack football pitch reservation and tournament management platform. Built with **Node.js**, **Express 5**, **TypeScript**, **Prisma 8 ORM**, **PostgreSQL**, and a modern **React + Vite** client.

Designed with robust concurrency control to prevent double-booking collisions, role-based authorization, receipt-based payment verification, and automated tournament scheduling.

---

## 📸 Screenshots & UI Preview

| Interactive Pitch Discovery & Hero | Reservation & Advisory Lock Booking Modal |
|:---:|:---:|
| ![Koora Arena Home](docs/screenshots/hero_preview.png) | ![Booking Modal](docs/screenshots/booking_modal.png) |

---

## 🌟 Core Highlights & Features

1. **Concurrency Protection via PostgreSQL Advisory Locks**:
   - Uses `pg_advisory_xact_lock(fieldId)` inside atomic database transactions (`db.transaction`).
   - Guarantees zero double-booking collisions even when multiple users attempt to reserve the exact same slot at the same millisecond.

2. **Role-Based Access Control (RBAC)**:
   - Four distinct user roles (`PLAYER`, `OWNER`, `ORGANIZER`, `ADMIN`) with targeted permissions.
   - Dual-token JWT authentication: 1-hour access tokens and 7-day refresh tokens.

3. **Receipt-Based Payment Verification**:
   - Players reserve slots and upload proof-of-payment receipts (Cloudinary storage with MIME and file size validation).
   - Pitch owners and admins review and verify receipts to confirm reservations.

4. **Tournament & Match Scheduling**:
   - Organizers can launch knockout tournaments, register teams, and schedule matches on pitches.

5. **Security & Defensive Engineering**:
   - Brute-force protection on authentication via `express-rate-limit`.
   - Security headers with `helmet` and configurable CORS policies.
   - 2-hour cancellation threshold preventing late cancellations.
   - Uniform API response envelopes for both success and error payloads.

---

## 🛠️ Tech Stack & Architecture

- **Backend Framework**: Node.js (v20+), Express.js (v5.0), TypeScript (v5.9)
- **Database & Data Access**: PostgreSQL 16, Prisma 8 ORM (`@prisma/orm-postgres`)
- **Authentication & Security**: JWT (`jsonwebtoken`), `bcrypt`, `helmet`, `express-rate-limit`, `cors`
- **Media & File Storage**: Multer, Cloudinary SDK
- **Testing & Quality**: Jest, Supertest, GitHub Actions CI
- **Frontend Client**: React 18, TypeScript, Vite, Tailwind-compatible modern CSS
- **Containerization**: Docker, Docker Compose

---

## 📁 Repository Structure

```text
football-booking-api/
│
├── backend/                       # Express.js REST API & Database Layer
│   ├── src/
│   │   ├── config/                # Swagger & Cloudinary configuration
│   │   ├── controllers/           # HTTP Request Handlers
│   │   ├── middlewares/           # Auth, Roles, Rate Limiting, Uploads, Errors
│   │   ├── prisma/                # Prisma 8 DB client, seed script & contract
│   │   ├── routes/                # Express Route definitions
│   │   ├── services/              # Business logic & concurrency transactions
│   │   ├── utils/                 # ApiError & asyncHandler wrappers
│   │   └── validators/            # Input validation schemas
│   ├── tests/                     # Jest & Supertest integration test suite
│   ├── migrations/                # Versioned SQL migrations
│   ├── Dockerfile                 # Multi-stage production container
│   └── package.json
│
├── frontend/                      # React & Vite web application
│   ├── src/                       # Components, Pages, State & Hooks
│   ├── index.html
│   └── package.json
│
├── docs/                          # Project screenshots & visual assets
│   └── screenshots/
│
├── docker-compose.yml             # PostgreSQL 16 & backend container setup
├── .github/workflows/ci.yml       # Automated GitHub Actions test pipeline
├── package.json                   # Root monorepo workspace scripts
└── README.md
```

---

## 📊 Database Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--o{ FIELD : "owns"
    USER ||--o{ BOOKING : "reserves"
    USER ||--o{ TEAM_MEMBER : "joins"
    USER ||--o{ REVIEW : "writes"
    USER ||--o{ TOURNAMENT : "organizes"

    FIELD ||--o{ BOOKING : "hosts"
    FIELD ||--o{ REVIEW : "receives"
    FIELD ||--o{ MATCH : "venue for"

    BOOKING ||--o| PAYMENT : "requires"

    TEAM ||--o{ TEAM_MEMBER : "has members"
    TEAM ||--o{ TOURNAMENT_TEAM : "enrolled in"
    TEAM ||--o{ MATCH : "home team"
    TEAM ||--o{ MATCH : "away team"

    TOURNAMENT ||--o{ TOURNAMENT_TEAM : "brackets"
    TOURNAMENT ||--o{ MATCH : "schedules"

    USER {
        int id PK
        string name
        string email UK
        string password
        string phone
        Role role "PLAYER | OWNER | ORGANIZER | ADMIN"
        datetime createdAt
    }

    FIELD {
        int id PK
        string name
        string description
        string address
        float pricePerHour
        int ownerId FK
        datetime createdAt
    }

    BOOKING {
        int id PK
        int userId FK
        int fieldId FK
        datetime startTime
        datetime endTime
        float totalPrice
        BookingStatus status "PENDING | CONFIRMED | CANCELLED | COMPLETED"
        datetime createdAt
    }

    PAYMENT {
        int id PK
        int bookingId FK
        float amount
        string method
        string transactionId
        PaymentStatus status "PENDING | PAID | FAILED | REFUNDED"
        datetime createdAt
    }

    TEAM {
        int id PK
        string name
        string logo
        datetime createdAt
    }

    TEAM_MEMBER {
        int id PK
        int teamId FK
        int userId FK
        datetime joinedAt
    }

    TOURNAMENT {
        int id PK
        string name
        string description
        datetime startDate
        datetime endDate
        int organizerId FK
        datetime createdAt
    }

    TOURNAMENT_TEAM {
        int id PK
        int tournamentId FK
        int teamId FK
        datetime joinedAt
    }

    MATCH {
        int id PK
        int tournamentId FK
        int homeTeamId FK
        int awayTeamId FK
        int fieldId FK
        datetime scheduledAt
        int homeScore
        int awayScore
    }

    REVIEW {
        int id PK
        int userId FK
        int fieldId FK
        int rating
        string comment
        datetime createdAt
    }
```

---

## 🔒 Concurrency & Race Condition Protection

When multiple players click "Book" for the exact same pitch and time slot concurrently, naïve validation (`findFirst` followed by `create`) results in double bookings.

### Implementation: Transactional Advisory Locks

Our implementation in `backend/src/services/booking.service.ts` combines PostgreSQL transaction-scoped advisory locks with atomic transactions:

```typescript
export async function createBooking(data: CreateBookingData) {
  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);

  return await db.transaction(async (tx) => {
    // 1. Acquire transaction-level advisory lock on fieldId
    // Automatically released when the transaction commits or aborts
    await db.raw.sql`SELECT pg_advisory_xact_lock(${data.fieldId})`.affectedCount();

    const field = await tx.orm.public.Field.where({ id: data.fieldId }).first();
    if (!field) {
      throw new ApiError("Field not found", 404);
    }

    // 2. Fetch existing reservations under the lock
    const existingBookings = await tx.orm.public.Booking
      .where({ fieldId: data.fieldId })
      .all();

    // 3. Strict interval overlap detection: (StartA < EndB) && (EndA > StartB)
    const hasConflict = existingBookings.some((booking) => {
      if (booking.status === "CANCELLED") return false;
      return startTime < new Date(booking.endTime) && endTime > new Date(booking.startTime);
    });

    if (hasConflict) {
      throw new ApiError("Field is already booked during this time", 409);
    }

    // 4. Atomically persist reservation
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const totalPrice = durationHours * field.pricePerHour;

    return await tx.orm.public.Booking.create({
      userId: data.userId,
      fieldId: data.fieldId,
      startTime: data.startTime,
      endTime: data.endTime,
      totalPrice,
    });
  });
}
```

---

## 🔄 Booking Lifecycle & State Transitions

```mermaid
stateDiagram-v2
    [*] --> PENDING: Player Creates Booking
    PENDING --> CONFIRMED: Owner Verifies Payment
    PENDING --> CANCELLED: Player Cancels (> 2h before)
    CONFIRMED --> CANCELLED: Owner or Player Cancels (> 2h before)
    CONFIRMED --> COMPLETED: Match Time Passes
    CANCELLED --> [*]
    COMPLETED --> [*]
```

---

## 👥 Roles & Permissions

Users choose their role upon registration (`PLAYER`, `OWNER`, `ORGANIZER`). The `ADMIN` role is assigned for system management.

| Role | Pitch Management | Booking Operations | Payment Verification | Tournaments |
|---|---|---|---|---|
| **PLAYER** | View pitches & reviews | Create, view own, cancel (>2h) | Upload payment receipts | Join tournaments |
| **OWNER** | Create, update, delete own pitches | Confirm, view bookings for own pitches | Approve / Reject payment receipts | Host tournament matches |
| **ORGANIZER**| View pitches | View personal bookings | - | Create tournaments, schedule matches |
| **ADMIN** | Full CRUD on all pitches | View all platform bookings | Approve any payment | Full tournament control |

---

## 📚 Key API Endpoints Summary

> 💡 **Interactive Swagger UI**: Full schemas, request parameters, and live runners are available at [`http://localhost:8000/api-docs`](http://localhost:8000/api-docs).

| Category | Method | Endpoint | Required Role | Notes / Rate Limit |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/register` | Public | Rate-limited (10 req / 15m) |
| **Auth** | `POST` | `/api/auth/login` | Public | Rate-limited (10 req / 15m) |
| **Auth** | `POST` | `/api/auth/refresh` | Public | Issues new access token |
| **Auth** | `GET` | `/api/auth/profile` | Authenticated | Returns current user profile |
| **Fields** | `GET` | `/api/fields` | Public | Search, pagination, pricing filter |
| **Fields** | `GET` | `/api/fields/:id` | Public | Detailed pitch profile |
| **Fields** | `POST` | `/api/fields` | `OWNER`, `ADMIN` | Pitch registration |
| **Fields** | `PATCH` | `/api/fields/:id` | `OWNER`, `ADMIN` | Update pitch details |
| **Fields** | `DELETE`| `/api/fields/:id` | `OWNER`, `ADMIN` | Remove pitch |
| **Bookings** | `POST` | `/api/bookings` | `PLAYER` | Concurrency-locked creation |
| **Bookings** | `GET` | `/api/bookings` | `PLAYER` | Paginated player bookings |
| **Bookings** | `GET` | `/api/bookings/owner` | `OWNER` | Bookings for owner's pitches |
| **Bookings** | `PATCH` | `/api/bookings/:id/confirm` | `OWNER` | Confirm reservation |
| **Bookings** | `PATCH` | `/api/bookings/:id/cancel` | `PLAYER`, `OWNER`| Enforces 2-hour cancellation rule |
| **Payments** | `POST` | `/api/payments` | `PLAYER` | Initiate booking payment record |
| **Payments** | `POST` | `/api/payments/:id/proof` | `PLAYER` | Receipt upload (Image/PDF, max 5MB) |
| **Payments** | `PATCH` | `/api/payments/:id/verify` | `OWNER`, `ADMIN` | Verify receipt (`PAID`/`FAILED`) |
| **Reviews** | `POST` | `/api/reviews` | `PLAYER` | Rating (1-5) and feedback |
| **Reviews** | `GET` | `/api/reviews/field/:id` | Public | List reviews for a pitch |
| **Tournaments**| `GET` | `/api/tournaments` | Public | List ongoing tournaments |
| **Tournaments**| `POST` | `/api/tournaments` | `ORGANIZER`, `ADMIN` | Create new tournament |
| **Tournaments**| `POST` | `/api/tournaments/:id/join` | `PLAYER` | Register team into tournament |
| **Tournaments**| `GET` | `/api/tournaments/:id/participants` | Public | Enrolled teams and brackets |
| **Tournaments**| `DELETE`| `/api/tournaments/:id` | `ORGANIZER`, `ADMIN` | Cancel tournament |

---

## 📡 Sample Request & Response Payloads

### 1. User Login (`POST /api/auth/login`)
```json
// Request Body
{
  "email": "player@koora.com",
  "password": "password123"
}

// 200 OK Response
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Ahmed Player",
      "email": "player@koora.com",
      "role": "PLAYER"
    },
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

### 2. Create Reservation (`POST /api/bookings`)
```json
// Request Body (Authorization: Bearer <accessToken>)
{
  "fieldId": 1,
  "startTime": "2026-10-01T18:00:00.000Z",
  "endTime": "2026-10-01T19:00:00.000Z"
}

// 201 Created Response
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": 42,
    "userId": 1,
    "fieldId": 1,
    "startTime": "2026-10-01T18:00:00.000Z",
    "endTime": "2026-10-01T19:00:00.000Z",
    "totalPrice": 350,
    "status": "PENDING"
  }
}
```

### 3. Concurrency Conflict (`POST /api/bookings` Overlap)
```json
// 409 Conflict Response (Standardized Error Envelope)
{
  "success": false,
  "message": "Field is already booked during this time",
  "error": {
    "statusCode": 409,
    "message": "Field is already booked during this time"
  }
}
```

---

## ⚙️ Environment Variables

Configure your environment in `backend/.env` (reference `backend/.env.example`):

| Variable | Required | Description | Example / Default |
|---|---|---|---|
| `PORT` | No | Port for the Express server | `8000` |
| `NODE_ENV` | No | Application environment (`development`, `test`, `production`) | `development` |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/koora_db` |
| `JWT_SECRET` | **Yes** | Secret key for signing 1h access tokens | `your-secure-jwt-secret` |
| `JWT_REFRESH_SECRET` | No | Secret key for 7d refresh tokens (defaults to `JWT_SECRET`) | `your-secure-refresh-secret` |
| `CORS_ORIGIN` | No | Allowed frontend origin | `http://localhost:5173` |
| `CLOUDINARY_CLOUD_NAME` | Optional | Cloudinary cloud name for receipt uploads | `demo_cloud` |
| `CLOUDINARY_API_KEY` | Optional | Cloudinary API Key | `1234567890` |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary API Secret | `abcdef123456` |

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Node.js** (v20 or newer)
- **PostgreSQL 16** (or **Docker**)
- **npm** (v10 or newer)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/mahmoudismaill165-dev/Football-Booking-API.git
cd Football-Booking-API

# Installs root, backend, and frontend dependencies
npm run install:all
```

### 2. Configure Environment & Database
Copy `.env.example` and set your credentials:
```bash
cp backend/.env.example backend/.env
```

Apply database migrations:
```bash
npm run db:migrate
```

### 3. Seed Demo Data & Test Accounts
Populate pitches, tournaments, and sample accounts for all 4 roles:
```bash
npm run seed
```

**Pre-seeded Demo Accounts (Password for all: `password123`):**
- **Player**: `player@koora.com`
- **Field Owner**: `owner@koora.com`
- **Organizer**: `organizer@koora.com`
- **Admin**: `admin@koora.com`

### 4. Run Both Backend & Frontend Concurrently
```bash
npm run dev:all
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173) (or `5174`)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Swagger Documentation**: [http://localhost:8000/api-docs](http://localhost:8000/api-docs)

To run services individually:
```bash
npm run dev:backend   # Express API only
npm run dev:frontend  # Vite React App only
```

---

## 🐳 Docker Deployment

To run PostgreSQL and the API in containerized environments:

```bash
# Start PostgreSQL and Backend services
docker-compose up -d --build

# Run database migrations in container
docker-compose exec backend npm run db:migrate

# Check service logs
docker-compose logs -f
```

---

## 🧪 Automated Testing & CI

Integration tests cover authentication, authorization middleware, pitch discovery, concurrency locks, payment verification, and tournament lifecycles:

```bash
# Run backend test suite
npm test
# or
npm run test:backend
```

All pushes and pull requests trigger automated GitHub Actions CI workflow runs ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) testing against a live PostgreSQL 16 container service.

---

## 🗺️ Roadmap & Future Enhancements

- [ ] **Payment Gateways**: Direct payment gateway integration (Stripe, Paymob).
- [ ] **Real-time Notifications**: Socket.io integration for instant booking confirmations and match score updates.
- [ ] **Redis Caching**: Cache pitch availability queries and search results under high read traffic.
- [ ] **Calendar Export**: iCal / Google Calendar integration for match schedules.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

---

## 👨‍💻 Author

**Mahmoud Ismail**  
Backend Developer & Full-Stack Engineer  
- **GitHub**: [@mahmoudismaill165-dev](https://github.com/mahmoudismaill165-dev)
