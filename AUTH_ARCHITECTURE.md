# SunaV Pulse — Authentication Architecture

## Overview

The authentication system operates in two modes:

| Mode | When | Description |
|---|---|---|
| **Demo** | `window.SUNAV_API_URL` not set | Client-side credential check against `DEMO_USERS`. Backward-compatible with the artifact preview. No tokens, no server. |
| **Production** | `window.SUNAV_API_URL` set in `index.html` | Full JWT + session system. All auth logic runs on the Express backend. |

---

## Token Flow

```
BROWSER                          EXPRESS BACKEND              POSTGRESQL
   │                                    │                          │
   │  POST /api/auth/login              │                          │
   │  {employee_id, password}  ────────>│                          │
   │                                    │  SELECT user + hash      │
   │                                    │ ────────────────────────>│
   │                                    │ <────────────────────────│
   │                                    │  bcrypt.compare()        │
   │                                    │                          │
   │  ─ MFA enabled? ──────────────────>│  SELECT mfa_configs      │
   │  YES: {requiresMfa, challengeToken}│ <────────────────────────│
   │                                    │                          │
   │  POST /api/auth/mfa/verify         │                          │
   │  {challengeToken, totpCode}────────│                          │
   │                                    │  speakeasy.verify()      │
   │                                    │  consumeMfaChallenge()   │
   │                                    │                          │
   │  ← {accessToken, user}             │  INSERT user_sessions    │
   │  ← Set-Cookie: sunav_rt=<token>    │ ────────────────────────>│
   │    (HttpOnly, Secure, SameSite)    │                          │
   │                                    │                          │
   │  store accessToken in _accessToken │                          │
   │  (module variable, not localStorage)                          │
   │                                    │                          │
   │  ... 14 minutes later ...          │                          │
   │                                    │                          │
   │  POST /api/auth/refresh            │                          │
   │  Cookie: sunav_rt=<token> ─────────│                          │
   │                                    │  SELECT + rotate session │
   │                                    │ ────────────────────────>│
   │  ← {accessToken}                   │ <────────────────────────│
   │  ← Set-Cookie: sunav_rt=<newToken> │                          │
   │                                    │                          │
   │  POST /api/v1/call-reports         │                          │
   │  Authorization: Bearer <token>─────│                          │
   │                                    │  verifyAccessToken(JWT)  │
   │                                    │  SELECT session (revoked?)│
   │                                    │ ────────────────────────>│
   │  ← {data}                          │ <────────────────────────│
```

---

## Database Tables

| Table | Purpose | RLS |
|---|---|---|
| `password_credentials` | bcrypt hashes, separate from user records | ✅ |
| `password_history` | Last 10 hashes for reuse prevention | ✅ |
| `login_attempts` | Server-side brute-force tracking | ✅ |
| `user_sessions` | One row per active device/browser | ✅ |
| `mfa_configs` | AES-256-GCM encrypted TOTP secrets | ✅ |
| `recovery_codes` | SHA-256 hashed single-use backup codes | ✅ |
| `mfa_challenges` | Short-lived (5 min) pre-auth tokens | ✅ |
| `password_reset_tokens` | 1-hour reset links | ✅ |
| `auth_events` | Append-only audit trail (SOC 2 CC6.3) | ✅ |
| `role_permissions` | RBAC matrix (role → resource → action) | ✅ |

---

## Security Controls

### Credential Storage
- Passwords hashed with bcrypt cost 12 (`$2b$12$...`)
- TOTP secrets encrypted with AES-256-GCM before database storage
- Recovery codes hashed with SHA-256
- Refresh tokens stored as SHA-256 hash only — raw token sent once and never stored

### Token Lifecycle
- **Access token**: JWT, 15-minute TTL, carries role + session ID
- **Refresh token**: 48-byte random hex, 7-day rolling expiry, stored as SHA-256 hash
- **Refresh cookie**: `HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh`
  — scoped to a single endpoint, invisible to JavaScript, not sent on cross-origin requests
- **Token rotation**: Each refresh call rotates the refresh token. If an old token is replayed,
  the server detects theft and revokes all sessions for that user

### Brute Force Protection
- 5 failed attempts → account locked for 15 minutes (per identifier, server-side)
- Lockout is stored in `login_attempts` table — survives page refresh, browser restart
- Constant-time password comparison prevents user enumeration via timing
- Unknown usernames take the same time as wrong passwords (dummy hash compared)

### Session Management
- Maximum 5 concurrent sessions per user; oldest revoked if cap exceeded
- Sessions can be individually revoked via `DELETE /api/auth/sessions/:id`
- Password change revokes all sessions except the current one (ASVS V3.3.3)
- Deactivating a user account immediately invalidates all their sessions

### RBAC Enforcement
- Role checks run exclusively on the backend — never trusted from the client
- `requirePermission(resource, action)` reads `role_permissions` table
- Defaults to deny (403) on permission miss; 503 on DB unavailability (fail closed)
- Role hierarchy: `rep < area_manager < regional_manager < admin`

### Audit Trail
- Every auth event written to `auth_events` (insert-only by application role)
- Events: login success/failure, MFA success/failure, logout, token refresh,
  password change, session revocation, impersonation start/end
- Fields: user_id, session_id, event_type, ip_address, user_agent, details (JSONB)

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Supabase Postgres connection string |
| `JWT_SECRET` | Yes | ≥64 hex chars, used for HMAC-SHA256 JWT signing |
| `APP_ENCRYPTION_KEY` | Yes | Exactly 64 hex chars (32 bytes), AES-256-GCM key for TOTP secrets |
| `BCRYPT_ROUNDS` | No (default 12) | bcrypt work factor; increase to 13+ for higher security |
| `APP_NAME` | No | Displayed in authenticator apps as the TOTP issuer |
| `NODE_ENV` | No | Set to `production` to enable HTTPS-only cookies |
| `FRONTEND_ORIGIN` | Yes | Exact URL of the deployed frontend (CORS origin) |

---

## Enabling Production Auth

1. Deploy the backend to Railway (see `DEPLOYMENT.md`)
2. Set all required environment variables in Railway's Variables tab
3. Run the database migrations in Supabase SQL Editor:
   ```sql
   -- Run 0001_init.sql first, then:
   \i supabase/migrations/0002_auth_tables.sql
   ```
4. Create the first admin account:
   ```sql
   -- After running migrations, insert a user and their credential:
   INSERT INTO users (name, email, role, territory, employee_id, status)
   VALUES ('Admin Name', 'admin@yourcompany.com', 'admin', 'All Territories', 'ADMIN-001', 'active');

   -- Then set their password via the API:
   -- POST /api/auth/password/change (after logging in with a temp credential)
   ```
5. In `index.html`, uncomment and set:
   ```html
   <script>window.SUNAV_API_URL = 'https://your-backend.railway.app';</script>
   ```
6. Redeploy the frontend to Vercel

The app will automatically switch to production auth mode. Demo credentials will no longer appear on the login screen.
