import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { db } from "./prisma/db.js";

const PORT = Number(process.env.PORT) || 8000;

async function startServer() {
  try {
    // Verify DB connectivity
    await db.orm.public.User.first();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

startServer();