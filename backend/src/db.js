// backend/src/db.js
// ─────────────────────────────────────────────────────────────────────────────
// PostgreSQL connection pool — Supabase-compatible.
//
// SUPABASE IPv4 FIX:
// Newer Supabase projects have NO IPv4 (A record) on the direct connection
// hostname db.[ref].supabase.co — it is IPv6-only. Railway cannot reach IPv6.
//
// The ONLY IPv4 path to Supabase is through the Session Mode Pooler:
//   Host:     aws-0-[region].pooler.supabase.com   (has IPv4 A records)
//   Port:     5432  (Session mode — compatible with pg Pool)
//   Username: postgres.[project-ref]  (pooler requires this format)
//
// This file automatically converts a direct connection URL to a pooler URL
// so the DATABASE_URL in Railway doesn't need to be changed manually.
// ─────────────────────────────────────────────────────────────────────────────
import pg from "pg";
const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn("[db] DATABASE_URL is not set — database features will be unavailable.");
}

// ── Auto-convert direct Supabase URL → Session Mode Pooler URL ───────────────
function toPoolerUrl(rawUrl) {
  if (!rawUrl) return rawUrl;
  try {
    const u = new URL(rawUrl);

    // Only transform direct Supabase connections: db.[ref].supabase.co
    const m = u.hostname.match(/^db\.([^.]+)\.supabase\.co$/);
    if (!m) return rawUrl; // not a direct Supabase URL — leave unchanged

    const ref = m[1];

    // Session Mode Pooler — IPv4-reachable AWS ALB in Singapore (ap-southeast-1)
    // Change region if your Supabase project is in a different AWS region.
    u.hostname = "aws-0-ap-southeast-1.pooler.supabase.com";
    u.port     = "5432";
    // Pooler requires username in postgres.[project-ref] format
    u.username = `postgres.${ref}`;

    const poolerUrl = u.toString();
    console.log(
      `[db] Direct connection is IPv6-only — auto-routing via Session Mode Pooler:\n` +
      `     host: aws-0-ap-southeast-1.pooler.supabase.com:5432\n` +
      `     user: postgres.${ref}`
    );
    return poolerUrl;
  } catch (err) {
    console.warn("[db] URL conversion failed:", err.message);
    return rawUrl;
  }
}

const connectionString = toPoolerUrl(process.env.DATABASE_URL);

export const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ssl: { rejectUnauthorized: false }, // required for Supabase pooler
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
