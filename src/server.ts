import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { db } from "./prisma/db.js";

const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    const users = await db.orm.public.User.all();

    console.log("Users:", users);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

startServer();