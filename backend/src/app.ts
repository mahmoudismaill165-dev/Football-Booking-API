import express from "express";
import cors from "cors";
import helmet from "helmet";
import { setupSwagger } from "./config/swagger.js";
import { apiRateLimiter } from "./middlewares/rateLimit.middleware.js";
import bookingRoutes from "./routes/booking.routes.js";
import authRoutes from "./routes/auth.routes.js";
import fieldRoutes from "./routes/field.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import reviewRoutes from "./routes/review.routes.js";
import tournamentRoutes from "./routes/tournament.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

const app = express();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Cross-Origin Resource Sharing
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// Global logger
app.use((req, res, next) => {
  console.log(`[LOG] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Swagger API Docs
setupSwagger(app);

// Rate limiter for general API routes
app.use("/api", apiRateLimiter);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/fields", fieldRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Football Booking API is running",
    swaggerDocs: "/api-docs",
  });
});

app.use(errorMiddleware);

export default app;