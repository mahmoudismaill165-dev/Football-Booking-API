# Football Booking Platform

Full-stack football field booking application.

The project allows users to browse football fields, create bookings, manage payments, write reviews, join tournaments, and receive notifications.

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* React Router
* Axios

### Backend

* Node.js
* Express.js
* TypeScript
* JWT
* Zod
* Swagger

### Database

* PostgreSQL
* Prisma ORM

### Testing

* Jest
* Supertest

### Other

* Cloudinary
* Git
* GitHub

## Features

### Authentication

* Register
* Login
* JWT authentication
* Role-based authorization
* User profile
* Logout
* Admin user management
* Admin statistics

### Fields

* Create field
* Get all fields
* Get field by ID
* Search and filtering
* Pagination
* Owner field management

### Bookings

* Create booking
* Check booking conflicts
* Calculate booking price
* View player bookings
* View owner bookings
* Confirm booking
* Cancel booking

### Payments

* Create payment
* Upload payment proof
* Verify payment
* Reject payment
* Update booking status

### Reviews

* Create review
* Update review
* Delete review
* Get field reviews
* Admin review management

### Tournaments

* Create tournament
* Update tournament
* Delete tournament
* Join tournament
* View tournament participants

### Notifications

The application creates notifications for important actions such as:

* New booking
* Booking confirmation
* Booking cancellation
* New payment
* Payment proof upload
* Payment verification
* Payment rejection
* New review
* Tournament updates

Users can also view their notifications and mark them as read.

## User Roles

The application has four roles:

```text
PLAYER
OWNER
ORGANIZER
ADMIN
```

Each role has different permissions.

## Project Structure

The project contains two applications:

```text
football-booking/
│
├── football-booking-api/
│   └── src/
│
└── football-booking-web/
    └── src/
```

### Backend

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

The backend follows this structure:

```text
Routes
  ↓
Middleware
  ↓
Controllers
  ↓
Services
  ↓
Prisma
  ↓
PostgreSQL
```

### Frontend

```text
src/
├── components/
├── pages/
├── layouts/
├── services/
├── context/
├── hooks/
├── types/
├── utils/
├── App.tsx
├── main.tsx
└── index.css
```

## Authentication

The API uses JWT for authentication.

Protected requests require:

```text
Authorization: Bearer <token>
```

## Validation

Request data is validated using Zod.

Example booking request:

```json
{
  "fieldId": 1,
  "startTime": "2026-09-26T18:00:00.000Z",
  "endTime": "2026-09-26T20:00:00.000Z"
}
```

## API Documentation

Swagger UI:

```text
http://localhost:8000/api-docs
```

## Testing

The backend uses Jest and Supertest.

Tests cover:

* Authentication
* Fields
* Bookings
* Payments
* Reviews
* Tournaments
* Notifications

Run tests:

```bash
npm test
```

## Running the Backend

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

Start the backend:

```bash
npm run dev
```

Backend:

```text
http://localhost:8000
```

## Running the Frontend

Enter the frontend directory:

```bash
cd football-booking-web
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Author

Mahmoud Ismail

Backend / Full-Stack Developer
