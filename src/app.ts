import express from "express";
import cors from "cors";
import { setupSwagger } from "./config/swagger.js";
import bookingRoutes from "./routes/booking.routes.js";
import authRoutes from "./routes/auth.routes.js";
import fieldRoutes from "./routes/field.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import reviewRoutes from "./routes/review.routes.js";
import tournamentRoutes from "./routes/tournament.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.originalUrl);
  next();
});
setupSwagger(app);
app.use(cors());


app.use("/api/auth", authRoutes);
app.use("/api/fields", fieldRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use(
  "/api/tournaments",
  tournamentRoutes
);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Football Booking API is running",
  });
});

app.use(errorMiddleware);

export default app;