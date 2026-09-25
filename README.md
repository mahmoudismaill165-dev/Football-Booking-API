# Football Booking API

Backend API for a football field booking platform.

The project handles users, football fields, bookings, payments, reviews, tournaments, and notifications.

## Tech Stack

* TypeScript
* Node.js
* Express.js
* PostgreSQL
* Prisma ORM
* JWT
* bcrypt
* Zod
* Swagger
* Jest
* Supertest
* Cloudinary

## Features

### Authentication

* Register
* Login
* JWT authentication
* Role-based authorization
* User profile
* Admin user management
* Admin statistics

### Football Fields

* Create field
* Get all fields
* Get field by ID
* Pagination
* Owner-based field management

### Bookings

* Create booking
* Check for conflicting bookings
* Calculate booking price automatically
* Get player bookings
* Get owner bookings
* Confirm booking
* Cancel booking

### Payments

* Create payment
* Upload payment proof
* Verify payment
* Reject payment
* Update booking status after payment verification

### Reviews

* Create review
* Update review
* Delete review
* Get reviews for a field
* Admin review management

### Tournaments

* Create tournament
* Update tournament
* Delete tournament
* Join tournament
* Get tournament participants

### Notifications

Notifications are created automatically for important actions such as:

* New account
* New booking
* Booking confirmation
* Booking cancellation
* New payment
* Payment proof upload
* Payment verification
* Payment rejection
* New review
* Tournament updates

## Project Structure

```text
src/
├── config/
├── controllers/
├── middlewares/
├── prisma/
├── routes/
├── services/
├── utils/
├── validators/
├── app.ts
└── server.ts
```

The project follows a simple flow:

```text
Route
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Prisma
  ↓
PostgreSQL
```

## Authentication

Protected endpoints use JWT authentication.

```text
Authorization: Bearer <token>
```

The API also uses role-based middleware for roles such as:

```text
PLAYER
OWNER
ORGANIZER
ADMIN
```

## Validation

Request data is validated using Zod before reaching the controllers.

Example booking request:

```json
{
  "fieldId": 1,
  "startTime": "2026-09-26T18:00:00.000Z",
  "endTime": "2026-09-26T20:00:00.000Z"
}
```

## API Documentation

Swagger UI is available at:

```text
http://localhost:8000/api-docs
```

It can be used to test the API endpoints directly, including authenticated endpoints.

## Testing

The project uses Jest and Supertest for API testing.

Tests cover the main backend modules, including:

* Authentication
* Fields
* Bookings
* Payments
* Reviews
* Tournaments
* Notifications

Run tests with:

```bash
npm test
```

## Running Locally

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
DATABASE_URL=your_postgresql_database_url
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the development server:

```bash
npm run dev
```

Server:

```text
http://localhost:8000
```

Swagger:

```text
http://localhost:8000/api-docs
```

## Author

Mahmoud Ismail

Backend Developer
