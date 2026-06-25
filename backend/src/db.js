// backend/src/db.js
// ─────────────────────────────────────────────────────────────────────────────
// PostgreSQL connection pool — Supabase-compatible.
//
// IPv4 FIX: Railway cannot route IPv6. Supabase's direct hostname resolves to
// IPv6 by default. We use dns.resolve4() to explicitly look up the IPv4 address
// and substitute it into the connection string BEFORE pg ever sees it.
// Top-level await is valid in ES modules (Node.js 14.8+).
// ─────────────────────────────────────────────────────────────────────────────
import dns from "dns/promises";
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn("[db] DATABASE_URL is not set — database features will be unavailable.");
}

// ── Resolve hostname to IPv4 before passing to pg ───────────────────────────
let connectionString = process.env.DATABASE_URL || "";

if (connectionString) {
  try {
    const urlObj = new URL(connectionString);
    const ipv4List = await dns.resolve4(urlObj.hostname);
    if (ipv4List && ipv4List.length > 0) {
      const original = urlObj.hostname;
      urlObj.hostname = ipv4List[0];
      connectionString = urlObj.toString();
      console.log(`[db] Resolved ${original} → ${ipv4List[0]} (IPv4 forced)`);
    }
  } catch (err) {
    console.warn("[db] IPv4 resolution failed — falling back to original URL:", err.message);
  }
}

export const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl: process.env.DATABASE_URL?.includes("supabase")
    ? { rejectUnauthorized: false }
    : false,
});

pool.on("error", (err) => {
  console.error("[db] Unexpected pool error:", err.message);
});

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

export async function getClient() {
  return pool.connect();
}

export async function ping() {
  const result = await pool.query("SELECT 1 AS ok");
  return result.rows[0].ok === 1;
}
