import "dotenv/config";

console.log("✅ Server file loaded");
console.log("Working directory:", process.cwd());
console.log("MONGODB_URI available:", !!process.env.MONGODB_URI);

import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
// import mongoSanitize from "express-mongo-sanitize"; // Disabled to fix crash
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
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
  ],
});

const app = express();

(async () => {
  try {
    console.log("🚀 Starting database connection...");

    const { default: connectDB } = await import("./config/db.js");
    await connectDB();

    console.log("✅ Database connection successful");

    app.set("trust proxy", 1);

    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: { policy: "same-origin" },
      crossOriginResourcePolicy: { policy: "same-origin" },
      dnsPrefetchControl: { allow: false },
      frameguard: { action: "deny" },
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      ieNoOpen: true,
      noSniff: true,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      xssFilter: true,
    }));

    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
      : [];

    app.use(cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
      optionsSuccessStatus: 204,
    }));

    app.use(express.json({ limit: "10kb" }));
    app.use(express.urlencoded({ extended: true, limit: "10kb" }));

    if (process.env.NODE_ENV === "development") {
      app.use(morgan("dev"));
    } else {
      app.use(morgan("combined", {
        stream: { write: (message) => logger.info(message.trim()) },
      }));
    }

    const globalLimiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
      max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: "Too many requests, please try again later." },
    });

    app.use("/api", globalLimiter);

    app.get("/api/health", (req, res) => {
      res.status(200).json({
        success: true,
        status: "healthy",
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      });
    });

    // Serve Vite frontend in production
    if (process.env.NODE_ENV === "production") {
      app.use(express.static("dist"));
      app.get("*", (req, res) => {
        res.sendFile("dist/index.html");
      });
    }

    const PORT = parseInt(process.env.PORT) || 5000;

    const server = app.listen(PORT, () => {
      logger.info(`✅ Server running on port ${PORT}`);
    });

    console.log(`✅ Server is running on http://localhost:${PORT}`);

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();

export default app;