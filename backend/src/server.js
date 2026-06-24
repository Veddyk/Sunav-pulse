// SunaV Pulse — Backend API Server
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";

import authRouter from "./routes/auth.js";
import { ping } from "./db.js";
import logger from "./logger.js";

dotenv.config();

const app     = express();
const PORT    = process.env.PORT || 8080;
const ALLOWED_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const IS_PROD = process.env.NODE_ENV === "production";

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: IS_PROD ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: ALLOWED_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}));
app.use(cookieParser());
app.use(express.json({ limit: "512kb" }));
app.set("trust proxy", 1);

// ── Request ID + structured access logging ───────────────────────────────────
// Each request gets a unique ID (X-Request-Id header) that is echoed in the
// response and included in every log line, making it easy to correlate errors
// across distributed logs.
app.use((req, res, next) => {
  const requestId = req.headers["x-request-id"] || crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? "error"
                : res.statusCode >= 400 ? "warn"
                : "info";
    logger[level]("HTTP request", {
      requestId,
      method:     req.method,
      path:       req.path,
      status:     res.statusCode,
      durationMs: duration,
      ip:         req.ip,
      ua:         req.headers["user-agent"]?.slice(0, 120),
    });
  });

  next();
});

// ── Global rate limit ────────────────────────────────────────────────────────
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests." },
}));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/health", async (req, res) => {
  try {
    await ping();
    res.status(200).json({
      status: "ok",
      db: "connected",
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
    });
  } catch (err) {
    logger.error("Health check DB ping failed", { err: err.message, requestId: req.requestId });
    res.status(503).json({
      status: "degraded",
      db: "unreachable",
      timestamp: new Date().toISOString(),
    });
  }
});

app.get("/", (req, res) => {
  res.status(200).json({ message: "SunaV Pulse API", version: "1.0.0", health: "/health" });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Not found", requestId: req.requestId });
});

// ── Centralised error handler ────────────────────────────────────────────────
// Catches any error passed to next(err). Logs it with the request ID so it can
// be correlated with the access log entry for the same request.
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  logger.error("Unhandled request error", {
    requestId: req.requestId,
    err:    err.message,
    stack:  IS_PROD ? undefined : err.stack,
    method: req.method,
    path:   req.path,
  });
  res.status(500).json({
    error: "An unexpected error occurred.",
    requestId: req.requestId,
  });
});

// ── Unhandled rejection / exception logging ──────────────────────────────────
// Ensures crashes are logged in structured format before the process exits.
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack:  reason instanceof Error && !IS_PROD ? reason.stack : undefined,
  });
  // Do not exit — Railway will restart if the health check fails.
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception — process will exit", {
    err:   err.message,
    stack: err.stack,
  });
  process.exit(1);
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info("Server started", { port: PORT, env: process.env.NODE_ENV || "development" });
});
