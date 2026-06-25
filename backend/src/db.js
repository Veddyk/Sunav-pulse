// backend/src/db.js
// ─────────────────────────────────────────────────────────────────────────────
// PostgreSQL connection pool — Supabase Session Mode Pooler.
//
// DATABASE_URL must point to the Supabase Session Mode Pooler (IPv4):
//   postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
//
// Get the exact string from: Supabase Dashboard → Connect → Session mode
// Set it as DATABASE_URL in Railway environment variables.
// ─────────────────────────────────────────────────────────────────────────────
import pg from "pg";
const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn("[db] DATABASE_URL is not set — database features will be unavailable.");
}

// Log which host we are connecting to (without password)
if (process.env.DATABASE_URL) {
  try {
    const u = new URL(process.env.DATABASE_URL);
    console.log(`[db] Connecting to: ${u.hostname}:${u.port} as ${u.username}`);
  } catch {}
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  ssl: { rejectUnauthorized: false },
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
