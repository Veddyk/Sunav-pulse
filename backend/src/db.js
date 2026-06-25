// backend/src/db.js
// ─────────────────────────────────────────────────────────────────────────────
// PostgreSQL connection pool (Supabase-compatible).
// Uses pg's built-in pool — max 10 connections to stay within Supabase
// free-tier limit of 60. Increase on paid plans.
//
// IPv4 fix: Railway's network resolves Supabase hostnames to IPv6 by default.
// Passing family:4 to the Pool forces Node.js net.Socket to use IPv4 only,
// which Railway's routing supports.
// ─────────────────────────────────────────────────────────────────────────────
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn("[db] DATABASE_URL is not set — database features will be unavailable.");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  // Force IPv4 — Railway cannot route IPv6 to external services.
  // Without this, Supabase hostnames resolve to IPv6 and every connection fails.
  family: 4,
  ssl: process.env.DATABASE_URL?.includes("supabase")
    ? { rejectUnauthorized: false }
    : false,
});

pool.on("error", (err) => {
  console.error("[db] Unexpected pool error:", err.message);
});

/** Execute a parameterised query. Throws on DB error. */
export async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`[db] Slow query (${duration}ms): ${text.slice(0, 80)}`);
    }
    return result;
  } catch (err) {
    console.error("[db] Query error:", err.message, "\nSQL:", text.slice(0, 120));
    throw err;
  }
}

/** Begin a transaction. */
export async function getClient() {
  return pool.connect();
}

/** Verify the database is reachable — used by the /health endpoint. */
export async function ping() {
  const result = await pool.query("SELECT 1 AS ok");
  return result.rows[0].ok === 1;
}
