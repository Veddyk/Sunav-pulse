import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import pg from "pg";
const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn("[db] DATABASE_URL is not set.");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.DATABASE_URL?.includes("supabase")
    ? { rejectUnauthorized: false }
    : false,
});

pool.on("error", (err) => {
  console.error("[db] Pool error:", err.message);
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
    console.error("[db] Query error:", err.message);
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
