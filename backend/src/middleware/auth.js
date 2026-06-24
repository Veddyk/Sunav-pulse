// backend/src/middleware/auth.js
// ─────────────────────────────────────────────────────────────────────────────
// Express middleware: verify Bearer token, attach req.user and req.session.
//
// OWASP ASVS:
//   V3.2.1  Token not predictable — JWT signed with HS256 + strong secret
//   V3.3.1  Expiry enforced by jwt.verify
//   V3.5.3  JWT claims validated (iss, aud, exp, sub)
// ─────────────────────────────────────────────────────────────────────────────
import { verifyAccessToken } from "../services/authService.js";
import { query } from "../db.js";

/**
 * requireAuth middleware — attach req.user or return 401.
 * Validates the JWT and confirms the session_id has not been revoked.
 * Session revocation check hits the DB; this is intentional for security-
 * critical apps. Add a short (60s) in-memory cache if throughput requires it.
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required." });
  }

  const token = authHeader.slice(7);
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    const msg = err.name === "TokenExpiredError"
      ? "Access token expired. Please refresh."
      : "Invalid access token.";
    return res.status(401).json({ error: msg, code: err.name });
  }

  // Async session-revocation check — can't use async middleware directly
  query(
    `SELECT u.id, u.name, u.email, u.role, u.territory, u.employee_id, u.status
     FROM user_sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.id = $1 AND s.revoked_at IS NULL AND s.expires_at > now()
       AND s.user_id = $2`,
    [decoded.sid, decoded.sub]
  )
    .then((result) => {
      if (!result.rows[0]) {
        return res.status(401).json({ error: "Session has been revoked or expired." });
      }
      const user = result.rows[0];
      if (user.status !== "active") {
        return res.status(401).json({ error: "Account has been deactivated." });
      }
      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        territory: user.territory,
        employeeId: user.employee_id,
      };
      req.sessionId = decoded.sid;
      next();
    })
    .catch((err) => {
      console.error("[auth] Session check failed:", err.message);
      // If DB is unavailable, fail open only in development
      if (process.env.NODE_ENV === "development") {
        req.user = { id: decoded.sub, role: decoded.role, name: decoded.name, employeeId: decoded.employee_id };
        req.sessionId = decoded.sid;
        return next();
      }
      res.status(503).json({ error: "Authentication service temporarily unavailable." });
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// backend/src/middleware/rbac.js — Role-Based Access Control
//
// OWASP ASVS:
//   V4.1.1  Access control enforced server-side (never client-side)
//   V4.1.2  Deny by default — if no permission matches, 403 is returned
//   V4.1.5  Attribute-based: reps can only access their own territory's records
// ─────────────────────────────────────────────────────────────────────────────

// Role hierarchy: higher index = more permissions
const ROLE_HIERARCHY = ["rep", "area_manager", "regional_manager", "admin"];

/**
 * Require a specific role level.
 * requireRole("area_manager") allows area_manager, regional_manager, and admin.
 */
export function requireRole(minimumRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }
    const userLevel  = ROLE_HIERARCHY.indexOf(req.user.role);
    const requiredLevel = ROLE_HIERARCHY.indexOf(minimumRole);
    if (userLevel < 0 || userLevel < requiredLevel) {
      return res.status(403).json({
        error: `This action requires ${minimumRole} access or higher.`,
        userRole: req.user.role,
      });
    }
    next();
  };
}

/**
 * Require one of a set of exact roles.
 * requireExactRole(["area_manager","regional_manager"]) — strictly those two roles.
 */
export function requireExactRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }
    if (!roles.flat().includes(req.user.role)) {
      return res.status(403).json({
        error: "You do not have permission to perform this action.",
        userRole: req.user.role,
      });
    }
    next();
  };
}

/**
 * Database-driven permission check against the role_permissions table.
 * requirePermission("expenses", "approve") — looks up the matrix.
 * Falls back to role hierarchy if DB is unavailable.
 */
export function requirePermission(resource, action) {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required." });
    try {
      const result = await query(
        `SELECT 1 FROM role_permissions
         WHERE role = $1 AND resource = $2 AND (action = $3 OR action = 'admin')`,
        [req.user.role, resource, action]
      );
      if (result.rowCount === 0) {
        return res.status(403).json({
          error: "You do not have permission to perform this action.",
          required: `${resource}:${action}`,
        });
      }
      next();
    } catch (err) {
      console.error("[rbac] Permission check failed:", err.message);
      // Fail closed on DB error — do not grant access
      res.status(503).json({ error: "Authorisation service temporarily unavailable." });
    }
  };
}
