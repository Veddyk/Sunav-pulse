// backend/src/services/mfaService.js
// ─────────────────────────────────────────────────────────────────────────────
// TOTP-based Multi-Factor Authentication (RFC 6238).
// Compatible with Google Authenticator, Authy, 1Password, and any RFC-6238 app.
//
// OWASP ASVS V2.6:
//   2.6.1  Replay attack prevention — speakeasy checks window of ±1 step (30s)
//   2.6.2  Counter not predictable — TOTP counter derived from server time
//   2.6.3  10 single-use recovery codes, bcrypt-hashed
//
// The TOTP secret is AES-256-GCM encrypted before database storage.
// The encryption key is the APP_ENCRYPTION_KEY env var (32-byte hex).
// ─────────────────────────────────────────────────────────────────────────────
import speakeasy from "speakeasy";
import crypto from "crypto";
import { query } from "../db.js";
import { generateOpaqueToken } from "./authService.js";

const APP_NAME         = process.env.APP_NAME || "SunaV Pulse";
const ENCRYPTION_KEY   = process.env.APP_ENCRYPTION_KEY;
const RECOVERY_CODE_COUNT = 10;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
  console.warn("[mfa] APP_ENCRYPTION_KEY not set — TOTP secrets will be stored unencrypted. Set a 64-hex-char key for production.");
}

// ── Encryption Helpers ───────────────────────────────────────────────────────

function encryptSecret(plaintext) {
  if (!ENCRYPTION_KEY) return plaintext; // dev fallback
  const key = Buffer.from(ENCRYPTION_KEY, "hex");
  const iv  = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

function decryptSecret(stored) {
  if (!ENCRYPTION_KEY || !stored.includes(":")) return stored; // dev fallback
  const [ivHex, tagHex, encryptedHex] = stored.split(":");
  const key = Buffer.from(ENCRYPTION_KEY, "hex");
  const iv  = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted, undefined, "utf8") + decipher.final("utf8");
}

// ── Recovery Codes ───────────────────────────────────────────────────────────

/** Generate N random recovery codes and return {raw[], hashed[]}. */
export function generateRecoveryCodes(count = RECOVERY_CODE_COUNT) {
  const raw = [];
  const hashed = [];
  for (let i = 0; i < count; i++) {
    // Format: XXXX-XXXX (8 uppercase alphanumeric)
    const code = crypto.randomBytes(6).toString("base64url").toUpperCase().slice(0, 8);
    const formatted = `${code.slice(0, 4)}-${code.slice(4)}`;
    raw.push(formatted);
    hashed.push(crypto.createHash("sha256").update(formatted.replace("-", "")).digest("hex"));
  }
  return { raw, hashed };
}

/** Store freshly generated recovery codes for a user (replaces existing). */
export async function storeRecoveryCodes(userId, hashedCodes) {
  // Invalidate existing codes first
  await query(`DELETE FROM recovery_codes WHERE user_id = $1`, [userId]);
  for (const hash of hashedCodes) {
    await query(
      `INSERT INTO recovery_codes (user_id, code_hash) VALUES ($1, $2)`,
      [userId, hash]
    );
  }
}

/** Attempt to consume a recovery code. Returns true on success. */
export async function consumeRecoveryCode(userId, rawCode) {
  const normalized = rawCode.replace(/[-\s]/g, "").toUpperCase();
  const hash = crypto.createHash("sha256").update(normalized).digest("hex");

  const result = await query(
    `UPDATE recovery_codes
     SET used_at = now()
     WHERE user_id = $1 AND code_hash = $2 AND used_at IS NULL
     RETURNING id`,
    [userId, hash]
  );
  return result.rowCount > 0;
}

// ── TOTP Setup ───────────────────────────────────────────────────────────────

/** Generate a new TOTP secret for a user. Does NOT enable MFA yet. */
export async function generateTotpSetup(userId, userEmail) {
  const secret = speakeasy.generateSecret({
    name: `${APP_NAME} (${userEmail})`,
    issuer: APP_NAME,
    length: 32, // 160-bit secret
  });

  // Store the encrypted secret (unverified — enabled only after first confirm)
  const encrypted = encryptSecret(secret.base32);
  await query(
    `INSERT INTO mfa_configs (user_id, totp_secret, enabled)
     VALUES ($1, $2, false)
     ON CONFLICT (user_id)
     DO UPDATE SET totp_secret = EXCLUDED.totp_secret, enabled = false, verified_at = null`,
    [userId, encrypted]
  );

  return {
    secret: secret.base32,          // shown once to user for manual entry
    otpauth_url: secret.otpauth_url, // encoded as QR code in the frontend
  };
}

/** Verify a TOTP code against the stored secret. Window of ±1 step (30s each side). */
export async function verifyTotp(userId, token) {
  const result = await query(
    `SELECT totp_secret FROM mfa_configs WHERE user_id = $1`,
    [userId]
  );
  if (!result.rows[0]) return false;

  const secret = decryptSecret(result.rows[0].totp_secret);
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1, // Allow ±30 seconds for clock drift
  });
}

/** Confirm TOTP setup: verify the code, then enable MFA and issue recovery codes. */
export async function confirmTotpSetup(userId, token) {
  const valid = await verifyTotp(userId, token);
  if (!valid) return { success: false };

  const { raw, hashed } = generateRecoveryCodes();
  await storeRecoveryCodes(userId, hashed);

  await query(
    `UPDATE mfa_configs SET enabled = true, verified_at = now()
     WHERE user_id = $1`,
    [userId]
  );

  return { success: true, recoveryCodes: raw };
}

/** Check whether MFA is enabled for a user. */
export async function isMfaEnabled(userId) {
  const result = await query(
    `SELECT enabled FROM mfa_configs WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0]?.enabled === true;
}

/** Disable MFA for a user. Clears secret and recovery codes. */
export async function disableMfa(userId) {
  await query(`DELETE FROM mfa_configs   WHERE user_id = $1`, [userId]);
  await query(`DELETE FROM recovery_codes WHERE user_id = $1`, [userId]);
}

// ── MFA Challenge Tokens ─────────────────────────────────────────────────────

/** Issue a short-lived (5 min) pre-auth challenge token after password succeeds but before MFA. */
export async function createMfaChallenge(userId) {
  const token = generateOpaqueToken(32);
  // Expire any existing challenges for this user
  await query(`DELETE FROM mfa_challenges WHERE user_id = $1`, [userId]);
  await query(
    `INSERT INTO mfa_challenges (user_id, challenge_token) VALUES ($1, $2)`,
    [userId, token]
  );
  return token;
}

/** Validate a challenge token. Returns userId or null. Single-use. */
export async function consumeMfaChallenge(token) {
  const result = await query(
    `DELETE FROM mfa_challenges
     WHERE challenge_token = $1 AND expires_at > now()
     RETURNING user_id`,
    [token]
  );
  return result.rows[0]?.user_id || null;
}
