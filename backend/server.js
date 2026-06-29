import fs from 'fs';
import dotenv from "dotenv";

console.log("=== ENV DEBUG START ===");
console.log(".env file exists?", fs.existsSync('.env'));
if (fs.existsSync('.env')) {
  console.log(".env content preview:");
  console.log(fs.readFileSync('.env', 'utf8').slice(0, 300));
}

dotenv.config({ path: '.env', override: true });

console.log("MONGODB_URI available after dotenv:", !!process.env.MONGODB_URI);
console.log("=== ENV DEBUG END ===");

import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import { createLogger, format, transports } from "winston";

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console(),
  ],
});

const app = express();

(async () => {
  try {
    console.log("🚀 Starting database connection...");

    const { default: connectDB } = await import("./config/db.js");
    await connectDB();

    console.log("✅ Database connection successful");

    const PORT = parseInt(process.env.PORT) || 5000;

    const server = app.listen(PORT, () => {
      logger.info(`✅ Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();

export default app;