// backend/src/db.js
// ─────────────────────────────────────────────────────────────────────────────
// PostgreSQL connection pool — Supabase-compatible.
//
// IPv4 OVERRIDE: Railway resolves Supabase hostnames to IPv6 by default, which
// Railway cannot route. dns.setDefaultResultOrder('ipv4first') tells Node.js's
// DNS resolver to always prefer A records (IPv4) over AAAA records (IPv6).
// This MUST be called before any network connection is made.
// ─────────────────────────────────────────────────────────────────────────────
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");   // ← Force IPv4 for ALL connections in this process

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

export async function getClient() {
  return pool.connect();
}

export async function ping() {
  const result = await pool.query("SELECT 1 AS ok");
  return result.rows[0].ok === 1;
}
