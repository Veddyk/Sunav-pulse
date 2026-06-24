// backend/src/logger.js
// ─────────────────────────────────────────────────────────────────────────────
// Structured JSON logger for the SunaV Pulse backend.
//
// Produces newline-delimited JSON suitable for ingestion by Railway's log
// aggregator, Datadog, Logtail, or any JSON-aware logging service.
//
// Usage:
//   import logger from './logger.js';
//   logger.info('User logged in', { userId, ip });
//   logger.error('DB query failed', { sql, err: err.message });
//
// In development (NODE_ENV !== 'production'), output is human-readable.
// In production, output is a single JSON object per line.
// ─────────────────────────────────────────────────────────────────────────────

const IS_PROD = process.env.NODE_ENV === "production";

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

function log(level, message, meta = {}) {
  const entry = {
    ts:  new Date().toISOString(),
    lvl: level,
    msg: message,
    svc: "sunav-pulse-backend",
    ...meta,
  };

  const output = IS_PROD
    ? JSON.stringify(entry)
    : `${entry.ts} [${level.toUpperCase().padEnd(5)}] ${message}${
        Object.keys(meta).length ? " " + JSON.stringify(meta) : ""
      }`;

  if (level === "error") {
    process.stderr.write(output + "\n");
  } else {
    process.stdout.write(output + "\n");
  }
}

const logger = {
  debug: (msg, meta) => log("debug", msg, meta),
  info:  (msg, meta) => log("info",  msg, meta),
  warn:  (msg, meta) => log("warn",  msg, meta),
  error: (msg, meta) => log("error", msg, meta),
};

export default logger;
