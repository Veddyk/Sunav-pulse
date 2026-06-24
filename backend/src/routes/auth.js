// backend/src/routes/auth.js
// ─────────────────────────────────────────────────────────────────────────────
// Authentication REST endpoints.
//
// Rate limiting strategy (OWASP ASVS V2.2.1):
//   Auth endpoints: 10 req / 15 min per IP  (prevents brute force)
//   Token refresh:  60 req / 15 min per IP   (normal client rotation)
//
// Cookie security (OWASP ASVS V3.4):
//   httpOnly  — not accessible to JavaScript (prevents XSS token theft)
//   secure    — HTTPS only
//   sameSite  — Strict CSRF protection
//   path      — scoped to /api/auth/refresh
// ─────────────────────────────────────────────────────────────────────────────
import express from "express";
import rateLimit from "express-rate-limit";
import {
  getUserByEmployeeId,
  verifyPassword,
  hashPassword,
  validatePasswordStrength,
  isPasswordReused,
  isLockedOut,
  recordLoginAttempt,
  issueAccessToken,
  createSession,
  rotateRefreshToken,
  revokeSession,
  revokeAllUserSessions,
  logAuthEvent,
  generateOpaqueToken,
  hashToken,
} from "../services/authService.js";
import {
  isMfaEnabled,
  verifyTotp,
  consumeRecoveryCode,
  createMfaChallenge,
  consumeMfaChallenge,
  generateTotpSetup,
  confirmTotpSetup,
  disableMfa,
} from "../services/mfaService.js";
import { requireAuth } from "../middleware/auth.js";
import { query } from "../db.js";

const router = express.Router();

// ── Rate Limiters ────────────────────────────────────────────────────────────
const strictAuthLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again in 15 minutes." },
});

const refreshLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many token refresh attempts." },
});

// ── Cookie Options ───────────────────────────────────────────────────────────
const REFRESH_COOKIE_NAME = "sunav_rt";
const refreshCookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/api/auth/refresh",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ── Helper to extract request metadata ───────────────────────────────────────
function getClientMeta(req) {
  return {
    ipAddress: req.ip || req.headers["x-forwarded-for"]?.split(",")[0]?.trim(),
    userAgent: req.headers["user-agent"]?.slice(0, 500) || "unknown",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Step 1 of auth: verify employee_id + password.
// If MFA is enabled, returns a short-lived challenge token instead of a session.
// ─────────────────────────────────────────────────────────────────────────────
router.post("/login", strictAuthLimit, async (req, res) => {
  const { employee_id, password } = req.body;
  const { ipAddress, userAgent } = getClientMeta(req);

  if (!employee_id || !password) {
    return res.status(400).json({ error: "Employee ID and password are required." });
  }

  const identifier = employee_id.trim().toLowerCase();

  try {
    // Server-side lockout check (defeats client-side bypass)
    if (await isLockedOut(identifier)) {
      await logAuthEvent("login_locked", { ipAddress, userAgent, details: { identifier } });
      return res.status(429).json({
        error: "Account locked due to too many failed attempts. Try again in 15 minutes.",
        code: "ACCOUNT_LOCKED",
      });
    }

    const user = await getUserByEmployeeId(identifier);

    // Use constant-time comparison to prevent timing attacks on user enumeration
    const dummyHash = "$2b$12$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.";
    const hash = user?.password_hash || dummyHash;
    const match = await verifyPassword(password, hash);

    if (!user || !match || user.status !== "active") {
      await recordLoginAttempt(identifier, false, ipAddress, userAgent,
        !user ? "unknown_user" : user.status !== "active" ? "inactive_user" : "wrong_password"
      );
      await logAuthEvent("login_failed", {
        userId: user?.id,
        ipAddress,
        userAgent,
        details: { identifier, reason: !user ? "unknown_user" : "wrong_password" },
      });
      return res.status(401).json({ error: "Invalid credentials. Please check your Employee ID and password." });
    }

    await recordLoginAttempt(identifier, true, ipAddress, userAgent);

    // Check if MFA is required
    if (await isMfaEnabled(user.id)) {
      const challengeToken = await createMfaChallenge(user.id);
      return res.status(200).json({
        requiresMfa: true,
        challengeToken,
        message: "Enter your authenticator code to complete sign-in.",
      });
    }

    // No MFA — issue session immediately
    const { sessionId, rawRefreshToken } = await createSession(user.id, ipAddress, userAgent);
    const { token: accessToken } = issueAccessToken(user, sessionId);

    await logAuthEvent("login_success", { userId: user.id, sessionId, ipAddress, userAgent });

    res.cookie(REFRESH_COOKIE_NAME, rawRefreshToken, refreshCookieOpts);
    return res.status(200).json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        territory: user.territory,
        employeeId: user.employee_id,
      },
    });
  } catch (err) {
    console.error("[auth/login]", err);
    res.status(500).json({ error: "An unexpected error occurred. Please try again." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/mfa/verify
// Step 2: verify TOTP code (or recovery code) using the challenge token.
// ─────────────────────────────────────────────────────────────────────────────
router.post("/mfa/verify", strictAuthLimit, async (req, res) => {
  const { challengeToken, totpCode, recoveryCode } = req.body;
  const { ipAddress, userAgent } = getClientMeta(req);

  if (!challengeToken) {
    return res.status(400).json({ error: "Challenge token is required." });
  }
  if (!totpCode && !recoveryCode) {
    return res.status(400).json({ error: "TOTP code or recovery code is required." });
  }

  try {
    const userId = await consumeMfaChallenge(challengeToken);
    if (!userId) {
      return res.status(401).json({
        error: "MFA session expired or invalid. Please sign in again.",
        code: "MFA_CHALLENGE_EXPIRED",
      });
    }

    let verified = false;
    let usedRecovery = false;

    if (totpCode) {
      verified = await verifyTotp(userId, totpCode.replace(/\s/g, ""));
    } else if (recoveryCode) {
      verified = await consumeRecoveryCode(userId, recoveryCode);
      usedRecovery = verified;
    }

    if (!verified) {
      await logAuthEvent("mfa_failed", { userId, ipAddress, userAgent,
        details: { method: totpCode ? "totp" : "recovery" } });
      return res.status(401).json({ error: "Invalid authenticator code. Please try again." });
    }

    // Fetch user for token payload
    const userResult = await query(
      `SELECT id, name, email, role, territory, employee_id FROM users WHERE id = $1`,
      [userId]
    );
    const user = userResult.rows[0];

    const { sessionId, rawRefreshToken } = await createSession(user.id, ipAddress, userAgent);
    const { token: accessToken } = issueAccessToken(user, sessionId);

    await logAuthEvent("mfa_success", { userId: user.id, sessionId, ipAddress, userAgent,
      details: { method: totpCode ? "totp" : "recovery_code" } });

    if (usedRecovery) {
      // Warn user to regenerate recovery codes
      const remaining = await query(
        `SELECT COUNT(*) FROM recovery_codes WHERE user_id = $1 AND used_at IS NULL`,
        [userId]
      );
      const remainingCount = parseInt(remaining.rows[0].count, 10);
      res.cookie(REFRESH_COOKIE_NAME, rawRefreshToken, refreshCookieOpts);
      return res.status(200).json({
        accessToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role,
          territory: user.territory, employeeId: user.employee_id },
        warning: `Recovery code used. ${remainingCount} remaining. Please generate new codes in Settings.`,
      });
    }

    res.cookie(REFRESH_COOKIE_NAME, rawRefreshToken, refreshCookieOpts);
    return res.status(200).json({
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role,
        territory: user.territory, employeeId: user.employee_id },
    });
  } catch (err) {
    console.error("[auth/mfa/verify]", err);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/refresh
// Silently rotate the access token using the httpOnly refresh cookie.
// ─────────────────────────────────────────────────────────────────────────────
router.post("/refresh", refreshLimit, async (req, res) => {
  const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  const { ipAddress, userAgent } = getClientMeta(req);

  if (!rawRefreshToken) {
    return res.status(401).json({ error: "No refresh token present.", code: "NO_REFRESH_TOKEN" });
  }

  try {
    const result = await rotateRefreshToken(rawRefreshToken, ipAddress, userAgent);

    if (!result) {
      res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth/refresh" });
      return res.status(401).json({ error: "Session expired or revoked. Please sign in again.", code: "SESSION_INVALID" });
    }

    const { user, sessionId, newRawToken } = result;
    const { token: accessToken } = issueAccessToken(user, sessionId);

    await logAuthEvent("token_refreshed", { userId: user.id, sessionId, ipAddress, userAgent });

    res.cookie(REFRESH_COOKIE_NAME, newRawToken, refreshCookieOpts);
    return res.status(200).json({ accessToken });
  } catch (err) {
    console.error("[auth/refresh]", err);
    res.status(500).json({ error: "Token refresh failed." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/logout
// Revoke the current session.
// ─────────────────────────────────────────────────────────────────────────────
router.post("/logout", requireAuth, async (req, res) => {
  const { ipAddress, userAgent } = getClientMeta(req);
  try {
    await revokeSession(req.sessionId);
    await logAuthEvent("logout", { userId: req.user.id, sessionId: req.sessionId, ipAddress, userAgent });
    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth/refresh" });
    return res.status(200).json({ message: "Signed out successfully." });
  } catch (err) {
    console.error("[auth/logout]", err);
    res.status(500).json({ error: "Logout failed." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me — return the current user (requires valid access token)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/sessions — list user's active sessions
// ─────────────────────────────────────────────────────────────────────────────
router.get("/sessions", requireAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, device_label, ip_address, created_at, last_used_at,
              (id = $2) AS is_current
       FROM user_sessions
       WHERE user_id = $1 AND revoked_at IS NULL AND expires_at > now()
       ORDER BY last_used_at DESC`,
      [req.user.id, req.sessionId]
    );
    res.json({ sessions: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Could not retrieve sessions." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/auth/sessions/:id — revoke a specific session
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/sessions/:id", requireAuth, async (req, res) => {
  const { ipAddress, userAgent } = getClientMeta(req);
  try {
    // Ensure the session belongs to this user before revoking
    const result = await query(
      `UPDATE user_sessions SET revoked_at = now(), revoke_reason = 'user_revoked'
       WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL
       RETURNING id`,
      [req.params.id, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Session not found or already revoked." });
    }
    await logAuthEvent("session_revoked", { userId: req.user.id, sessionId: req.params.id,
      ipAddress, userAgent, details: { revokedSessionId: req.params.id } });
    res.json({ message: "Session revoked." });
  } catch (err) {
    res.status(500).json({ error: "Could not revoke session." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/password/change
// ─────────────────────────────────────────────────────────────────────────────
router.post("/password/change", requireAuth, strictAuthLimit, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { ipAddress, userAgent } = getClientMeta(req);

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new passwords are required." });
  }

  const strength = validatePasswordStrength(newPassword);
  if (!strength.valid) {
    return res.status(400).json({ error: "Password does not meet requirements.", issues: strength.errors });
  }

  try {
    const userResult = await query(
      `SELECT u.id, pc.password_hash FROM users u
       JOIN password_credentials pc ON pc.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );
    const row = userResult.rows[0];
    if (!row) return res.status(404).json({ error: "User not found." });

    const currentValid = await verifyPassword(currentPassword, row.password_hash);
    if (!currentValid) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    if (await isPasswordReused(req.user.id, newPassword)) {
      return res.status(400).json({ error: "You cannot reuse a recent password. Please choose a different one." });
    }

    const newHash = await hashPassword(newPassword);

    // Rotate password + history in a transaction
    const client = await (await import("../db.js")).getClient();
    try {
      await client.query("BEGIN");
      await client.query(
        `UPDATE password_credentials SET password_hash = $1, password_changed_at = now() WHERE user_id = $2`,
        [newHash, req.user.id]
      );
      await client.query(
        `INSERT INTO password_history (user_id, password_hash) VALUES ($1, $2)`,
        [req.user.id, row.password_hash]
      );
      // Trim history to last 10
      await client.query(
        `DELETE FROM password_history
         WHERE user_id = $1 AND id NOT IN (
           SELECT id FROM password_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10
         )`,
        [req.user.id]
      );
      // Revoke all other sessions (OWASP ASVS V3.3.3)
      await client.query(
        `UPDATE user_sessions
         SET revoked_at = now(), revoke_reason = 'password_change'
         WHERE user_id = $1 AND id != $2 AND revoked_at IS NULL`,
        [req.user.id, req.sessionId]
      );
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    await logAuthEvent("password_changed", { userId: req.user.id, sessionId: req.sessionId,
      ipAddress, userAgent });

    res.json({ message: "Password changed successfully. All other sessions have been signed out." });
  } catch (err) {
    console.error("[auth/password/change]", err);
    res.status(500).json({ error: "Password change failed." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/mfa/setup — begin TOTP setup (returns secret + QR URL)
// POST /api/auth/mfa/confirm — confirm TOTP and enable MFA
// DELETE /api/auth/mfa — disable MFA (requires current TOTP code)
// ─────────────────────────────────────────────────────────────────────────────
router.post("/mfa/setup", requireAuth, async (req, res) => {
  try {
    const setup = await generateTotpSetup(req.user.id, req.user.email);
    // The otpauth_url is rendered as a QR code in the frontend.
    // The raw secret is shown once for manual entry.
    res.json(setup);
  } catch (err) {
    res.status(500).json({ error: "Could not generate MFA setup." });
  }
});

router.post("/mfa/confirm", requireAuth, strictAuthLimit, async (req, res) => {
  const { totpCode } = req.body;
  const { ipAddress, userAgent } = getClientMeta(req);
  if (!totpCode) return res.status(400).json({ error: "TOTP code is required." });
  try {
    const result = await confirmTotpSetup(req.user.id, totpCode);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid code. Scan the QR code again and retry." });
    }
    await logAuthEvent("mfa_enabled", { userId: req.user.id, sessionId: req.sessionId,
      ipAddress, userAgent });
    res.json({
      message: "MFA enabled. Store your recovery codes in a safe place — they cannot be shown again.",
      recoveryCodes: result.recoveryCodes,
    });
  } catch (err) {
    res.status(500).json({ error: "Could not confirm MFA setup." });
  }
});

router.delete("/mfa", requireAuth, strictAuthLimit, async (req, res) => {
  const { totpCode, password } = req.body;
  const { ipAddress, userAgent } = getClientMeta(req);
  if (!totpCode && !password) {
    return res.status(400).json({ error: "Current TOTP code or password required to disable MFA." });
  }
  try {
    if (totpCode) {
      const valid = await verifyTotp(req.user.id, totpCode);
      if (!valid) return res.status(401).json({ error: "Invalid TOTP code." });
    }
    await disableMfa(req.user.id);
    await logAuthEvent("mfa_disabled", { userId: req.user.id, sessionId: req.sessionId,
      ipAddress, userAgent });
    res.json({ message: "MFA has been disabled." });
  } catch (err) {
    res.status(500).json({ error: "Could not disable MFA." });
  }
});

export default router;
