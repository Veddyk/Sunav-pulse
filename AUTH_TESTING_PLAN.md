# SunaV Pulse — Authentication System Testing Plan

## Scope
Covers the complete authentication surface: backend Express API, JWT lifecycle,
session management, MFA (TOTP), RBAC middleware, frontend integration, and
security controls. Tests are mapped to OWASP ASVS V4.0 Level 2 controls.

---

## 1. Unit Tests — `backend/src/services/authService.test.js`

### 1.1 Password hashing (ASVS V2.1.1)
```javascript
test("hashPassword produces a bcrypt v2b hash at cost 12")
test("verifyPassword returns true for matching plaintext")
test("verifyPassword returns false for wrong plaintext")
test("verifyPassword is constant-time regardless of match (timing delta < 5ms)")
```

### 1.2 Password strength validation (ASVS V2.1.9)
```javascript
test("accepts: Pharma@2024! (12 chars, mixed case, number, special)")
test("rejects: too_short (11 chars)")
test("rejects: ALLUPPERCASE1! (no lowercase)")
test("rejects: alllowercase1! (no uppercase)")
test("rejects: NoSpecialChar12 (no special character)")
test("rejects: NoNumbers!! (no number)")
```

### 1.3 JWT issuance and verification (ASVS V3.2.1, V3.3.1)
```javascript
test("issueAccessToken includes: sub, role, name, employee_id, sid, jti")
test("issueAccessToken expires in ~15 minutes")
test("verifyAccessToken succeeds with a fresh token")
test("verifyAccessToken throws TokenExpiredError after expiry")
test("verifyAccessToken throws JsonWebTokenError for a tampered token")
test("verifyAccessToken validates issuer and audience claims")
```

### 1.4 Password reuse check (ASVS V2.1.7)
```javascript
test("isPasswordReused returns true if hash matches any of last 10")
test("isPasswordReused returns false for a genuinely new password")
```

---

## 2. Unit Tests — `backend/src/services/mfaService.test.js`

### 2.1 TOTP generation and verification (ASVS V2.6.1, V2.6.2)
```javascript
test("generateTotpSetup returns a base32 secret and otpauth_url")
test("verifyTotp returns true for the current time window token")
test("verifyTotp returns true for token from -1 window (clock drift)")
test("verifyTotp returns true for token from +1 window (clock drift)")
test("verifyTotp returns false for a token > 2 windows old")
test("verifyTotp returns false for an incorrect code")
```

### 2.2 Recovery codes (ASVS V2.6.3)
```javascript
test("generateRecoveryCodes returns 10 codes in XXXX-XXXX format")
test("generateRecoveryCodes: all codes are unique")
test("consumeRecoveryCode returns true and marks code as used")
test("consumeRecoveryCode returns false for an already-used code")
test("consumeRecoveryCode returns false for a non-existent code")
test("recovery code normalization: 'abcd-efgh' == 'ABCDЕФGH' (case insensitive)")
```

### 2.3 AES-256-GCM encryption
```javascript
test("encryptSecret produces ciphertext different from plaintext")
test("decryptSecret recovers original plaintext")
test("decryptSecret throws on tampered ciphertext (auth tag mismatch)")
```

### 2.4 MFA challenge tokens
```javascript
test("createMfaChallenge issues a unique 32-byte hex token")
test("consumeMfaChallenge returns userId for a valid unexpired token")
test("consumeMfaChallenge returns null for an expired token")
test("consumeMfaChallenge deletes the row (single-use)")
```

---

## 3. Integration Tests — `backend/src/routes/auth.test.js`
Uses `supertest` against an in-memory test database (pgmock or real test schema).

### 3.1 POST /api/auth/login
```javascript
// Happy paths
test("200 with valid employee_id + password, no MFA")
test("200 with {requiresMfa:true, challengeToken} when MFA is enabled")

// Error paths
test("400 when employee_id is missing")
test("400 when password is missing")
test("401 for unknown employee_id")
test("401 for wrong password")
test("401 for inactive account")
test("429 ACCOUNT_LOCKED after 5 failed attempts within window")

// Security
test("timing: 401 for unknown user takes same time as wrong password")
test("sets HttpOnly Secure SameSite=Strict refresh cookie on success")
test("rate limit: 11th request within 15 min returns 429")
```

### 3.2 POST /api/auth/mfa/verify
```javascript
test("200 with valid TOTP code + valid challenge token")
test("200 with valid recovery code + valid challenge token")
test("401 for wrong TOTP code")
test("401 for expired challenge token (>5 minutes)")
test("401 for already-consumed challenge token")
test("200 with recovery code includes warning when count < 3")
```

### 3.3 POST /api/auth/refresh
```javascript
test("200 with new accessToken when valid refresh cookie present")
test("401 NO_REFRESH_TOKEN when cookie absent")
test("401 SESSION_INVALID for revoked session")
test("401 SESSION_INVALID for expired refresh token (>7 days)")
test("rotates refresh token on each call (new cookie set)")
test("theft detection: reusing an old rotated token returns 401 and revokes all sessions")
```

### 3.4 POST /api/auth/logout
```javascript
test("200 and session revoked")
test("401 without Authorization header")
test("clears the refresh cookie")
```

### 3.5 POST /api/auth/password/change
```javascript
test("200 for correct currentPassword and strong newPassword")
test("400 when newPassword fails strength check")
test("400 when newPassword matches a recent hash (reuse)")
test("401 when currentPassword is wrong")
test("revokes all other sessions on success (ASVS V3.3.3)")
```

### 3.6 MFA lifecycle
```javascript
test("POST /mfa/setup returns secret + otpauth_url for authenticated user")
test("POST /mfa/confirm enables MFA and returns recovery codes")
test("POST /mfa/confirm returns 400 for wrong TOTP code")
test("DELETE /mfa disables MFA for correct TOTP code")
test("DELETE /mfa returns 401 for wrong TOTP code")
```

### 3.7 Session management
```javascript
test("GET /sessions returns list of user's active sessions")
test("DELETE /sessions/:id revokes the specified session")
test("DELETE /sessions/:id returns 404 for another user's session")
test("Session cap: 6th login revokes the oldest session")
```

---

## 4. Frontend Integration Tests — `src/__tests__/auth.test.jsx`
Uses React Testing Library + MSW (Mock Service Worker) to mock the backend.

```javascript
test("LoginScreen: shows demo credential buttons when SUNAV_API_URL is not set")
test("LoginScreen: hides demo credential buttons when SUNAV_API_URL is set")
test("LoginScreen: calls /api/auth/login on submit in production mode")
test("LoginScreen: shows MFA screen when response has requiresMfa:true")
test("MfaScreen: calls /api/auth/mfa/verify with totpCode")
test("MfaScreen: calls /api/auth/mfa/verify with recoveryCode when toggled")
test("MfaScreen: 'Back to sign in' returns to credential step")
test("handleLogout: calls /api/auth/logout when USE_REAL_AUTH is true")
test("handleLogout: clears access token on call")
test("Token refresh: schedules refresh ~14 minutes after successful login")
test("Token refresh failure: triggers automatic logout and shows LoginScreen")
```

---

## 5. Security Tests (Manual / DAST)

### 5.1 Authentication bypass attempts
```
□ Submit POST /api/auth/login with SQL injection in employee_id:  ' OR 1=1 --
□ Submit with NoSQL injection: {"$gt": ""}
□ Submit with extra-long password (> 72 chars, bcrypt silently truncates)
□ Attempt to forge a JWT by changing the algorithm to "none"
□ Attempt to forge a JWT with a known weak secret (HMAC brute force)
□ Replay a captured valid access token after logout
□ Replay a captured expired access token
```

### 5.2 Session security
```
□ Confirm refresh token cookie is HttpOnly (not readable by document.cookie in DevTools)
□ Confirm refresh token cookie is Secure (verify no Set-Cookie without HTTPS flag)
□ Confirm refresh token cookie is SameSite=Strict (not sent on cross-origin requests)
□ Attempt CSRF: POST to /api/auth/logout from a different origin (should fail with 403)
□ Test token theft detection: capture refresh token, rotate it via refresh endpoint,
  then attempt to use the old (pre-rotation) token → all sessions should be revoked
```

### 5.3 Brute force / rate limiting
```
□ Send 10 POST /api/auth/login requests within 15 min → 11th must return 429
□ Verify lockout after 5 bad passwords for the same identifier
□ Verify lockout persists after page refresh (server-side, not client-state)
□ Verify lockout is per-identifier, not per-IP (unlocking one account doesn't unlock another)
```

### 5.4 MFA
```
□ Attempt /api/auth/mfa/verify with a challenge token for a different user_id
□ Verify TOTP codes from > 90s ago are rejected (window: ±1 step)
□ Verify each recovery code can only be used once
□ Verify MFA challenge token expires after 5 minutes
```

### 5.5 OWASP Top 10 — regression checklist
```
□ A01 Broken Access Control: all RBAC checks return 403 when role is insufficient
□ A02 Cryptographic Failures: no plaintext passwords in DB, logs, or API responses
□ A03 Injection: parameterized queries confirm no SQL injection surface
□ A05 Security Misconfiguration: CSP, HSTS, Permissions-Policy headers present on all responses
□ A07 Auth Failures: lockout, rate limiting, and session revocation all verified
□ A09 Logging: all auth events appear in auth_events table after each test action
```

---

## 6. OWASP ASVS Compliance Checklist

| Control | ID | Status | Notes |
|---|---|---|---|
| Passwords min 12 chars | V2.1.1 | ✅ | `validatePasswordStrength` in authService |
| bcrypt ≥ cost 12 | V2.1.1 | ✅ | `BCRYPT_ROUNDS=12`, configurable to 13+ |
| No password truncation | V2.1.4 | ✅ | Full password sent to `bcrypt.compare` |
| Password history (last 10) | V2.1.7 | ✅ | `password_history` table + `isPasswordReused` |
| TOTP RFC 6238 | V2.6.1 | ✅ | `speakeasy` with ±1 window |
| 10 single-use recovery codes | V2.6.3 | ✅ | `recovery_codes` table, consumed on use |
| Session tokens cryptographically random | V3.2.1 | ✅ | `crypto.randomBytes(48)` |
| JWT expiry enforced | V3.3.1 | ✅ | `jwt.verify` with `expiresIn: "15m"` |
| Revoke sessions on password change | V3.3.3 | ✅ | `revokeAllUserSessions` called in route |
| JWT issuer + audience validated | V3.5.3 | ✅ | `issuer:"sunav-pulse"`, `audience:"sunav-pulse-api"` |
| Access control server-side | V4.1.1 | ✅ | `requireAuth`, `requireRole`, `requirePermission` |
| Deny by default | V4.1.2 | ✅ | `requirePermission` returns 503 on DB error (fail closed) |
| All auth events logged | V7.2.1 | ✅ | `logAuthEvent` in every auth path |

---

## 7. Running Tests

```bash
# Install test dependencies
cd backend
npm install --save-dev jest supertest @jest/globals

# Run all backend tests
npm test

# Run specific file
npx jest auth.test.js

# Coverage report
npx jest --coverage
```

### Required test environment variables (`backend/.env.test`)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sunav_pulse_test
JWT_SECRET=test-jwt-secret-that-is-at-least-64-chars-long-for-hmac-sha256
APP_ENCRYPTION_KEY=0000000000000000000000000000000000000000000000000000000000000000
NODE_ENV=test
BCRYPT_ROUNDS=4   # Lower rounds for test speed — do NOT use in production
```
