# Eliminating Critical Blockers B-01 and B-02

## How to read this guide

**B-01** (demo credentials in production) requires only **configuration** — everything is built.
Estimated time: 2–4 hours. No code changes.

**B-02** (no data persistence) requires **engineering work** — the database schema is complete
but the API routes need to be implemented and the frontend needs to be wired to them.
Estimated time: 4–8 weeks of development.

Complete B-01 first. B-02 depends on having a working backend from B-01.

---

# PART A — Fixing B-01: Activate Real Authentication

## What this does

Right now, every login uses `pwd === "Demo@2024"` checked in the browser.
After completing these steps:
- All logins hit the Express backend over HTTPS
- Passwords are bcrypt-hashed (cost 12) and never stored in plaintext
- Sessions are JWT + HttpOnly cookie, tracked in the database
- MFA (TOTP authenticator app) is available for all accounts
- The demo credentials panel disappears from the login screen
- Account lockout survives page refresh (it's in the database now)

## Prerequisites

You need accounts on:
- **Supabase** (free): https://supabase.com — provides the PostgreSQL database
- **Railway** (free starter): https://railway.app — hosts the Express backend
- **GitHub** (already set up if you followed DEPLOYMENT.md)

---

## Step 1 — Set up Supabase database

### 1.1 Create a Supabase project
1. Go to https://supabase.com/dashboard and sign in.
2. Click **New project**.
3. Choose a name (e.g. `sunav-pulse`), set a strong database password,
   and pick a region closest to your users.
4. **Save the database password** — you need it in Step 2. If you lose it,
   you must reset it in Settings → Database.
5. Wait ~2 minutes for the project to spin up.

### 1.2 Run the database migrations
1. In your Supabase project, click **SQL Editor** in the left sidebar.
2. Open each migration file from the deployment zip and paste + run them
   **in order**:

   - `supabase/migrations/0001_init.sql`  — business tables (doctors, call reports, etc.)
   - `supabase/migrations/0002_auth_tables.sql`  — auth tables (sessions, MFA, etc.)
   - `supabase/migrations/0003_schema_improvements.sql`  — indexes, FK fixes, triggers
   - `supabase/migrations/0004_rls_policies.sql`  — Row Level Security on all 17 tables

   For each file: paste the entire SQL → click **Run** → confirm "Success, no rows returned".

3. Confirm the migrations worked — run this query in the SQL Editor:
   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY tablename;
   ```
   You should see 17 rows, all with `rowsecurity = true`.

### 1.3 Configure JWT settings (critical — makes auth.uid() work in RLS policies)
1. In Supabase, go to **Authentication → Settings**.
2. Scroll down to **JWT Settings**.
3. You will set the **JWT Secret** here in Step 3 after you generate it.
   Come back to this page then.

### 1.4 Get your database connection string
1. Go to **Settings → Database** (in the left sidebar, under Project Settings).
2. Copy the **Connection string** — it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-REF].supabase.co:5432/postgres
   ```
   Replace `[YOUR-PASSWORD]` with the password you set in Step 1.1.
   Keep this handy for Step 3.

---

## Step 2 — Generate cryptographic secrets

These secrets must be generated securely. Do not make them up — use the
commands below on your local machine (requires Node.js).

Open a terminal and run:

```bash
# JWT_SECRET — signs all access tokens (min 64 hex chars)
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# APP_ENCRYPTION_KEY — encrypts TOTP secrets in the database (exactly 64 hex chars)
node -e "console.log('APP_ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```

You will see output like:
```
JWT_SECRET=a1b2c3...128-character-hex-string...
APP_ENCRYPTION_KEY=d4e5f6...64-character-hex-string...
```

**Copy both values somewhere safe** (a password manager).
You will use them in Step 3 (Railway) and Step 3 (Supabase JWT settings).

---

## Step 3 — Deploy the backend to Railway

### 3.1 Create a Railway project
1. Go to https://railway.app and sign in with GitHub.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your `sunav-pulse` repository.
4. Railway will detect `railway.json` and configure the build automatically.

### 3.2 Set environment variables
In your Railway service, click the **Variables** tab and add each of these:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `8080` |
| `DATABASE_URL` | The connection string from Step 1.4 |
| `JWT_SECRET` | The 128-char hex string from Step 2 |
| `APP_ENCRYPTION_KEY` | The 64-char hex string from Step 2 |
| `BCRYPT_ROUNDS` | `12` |
| `APP_NAME` | `SunaV Pulse` |
| `FRONTEND_ORIGIN` | Your Vercel URL, e.g. `https://sunav-pulse.vercel.app` |

Click **Deploy** (Railway deploys automatically when you add variables).

### 3.3 Verify the backend is running
After 1–2 minutes, Railway will show a green **Active** status.
Click the **Settings** tab and copy your **Public Domain** URL
(looks like `sunav-pulse-backend.up.railway.app`).

Open a browser and go to:
```
https://sunav-pulse-backend.up.railway.app/health
```

You should see:
```json
{"status":"ok", "db":"connected", "timestamp":"2026-06-23T..."}
```

If you see `"db":"unreachable"`, double-check the `DATABASE_URL` variable
— the password must not contain URL-special characters unescaped.

### 3.4 Complete the Supabase JWT configuration
Now that you have the JWT_SECRET:
1. Go back to Supabase → **Authentication → Settings → JWT Settings**.
2. Paste your `JWT_SECRET` value into the **JWT Secret** field.
3. Click **Save**.

This step makes Supabase's RLS policies work — without it, `auth.uid()`
returns null in every policy and all queries are blocked.

---

## Step 4 — Create the first admin user

The backend has no "register" endpoint (by design — you don't want a public
registration page on a pharmaceutical field force system). Create the first
admin account directly in the Supabase SQL Editor.

### 4.1 Generate a bcrypt hash for your password

Replace `YourSecurePassword123!` with a real strong password:

```bash
node -e "
const bcrypt = require('bcrypt');  
bcrypt.hash('YourSecurePassword123!', 12).then(h => console.log(h));
"
```

This outputs a string like: `$2b$12$...`
Copy the full hash.

### 4.2 Insert the admin user in Supabase SQL Editor

Replace the values in UPPER_CASE with your real details:

```sql
-- 1. Create the user record
INSERT INTO users (name, email, role, territory, employee_id, status)
VALUES (
  'YOUR FULL NAME',
  'your.email@company.com',
  'admin',
  'All Territories',
  'ADMIN-001',
  'active'
)
RETURNING id;

-- Copy the UUID that comes back — you need it in the next query.

-- 2. Set the password (replace USER_UUID with the UUID from above,
--    and THE_BCRYPT_HASH with the hash you generated)
INSERT INTO password_credentials (user_id, password_hash)
VALUES (
  'USER_UUID',
  'THE_BCRYPT_HASH'
);
```

Your admin login ID will be the `employee_id` you chose (`ADMIN-001`).
Password is what you hashed above.

---

## Step 5 — Activate production auth in the frontend

### 5.1 Edit index.html in your GitHub repository
1. Go to your GitHub repository.
2. Open the file `index.html`.
3. Click the pencil (edit) icon.
4. Find this section:
   ```html
   <!--
     PRODUCTION AUTH:
     Uncomment and set SUNAV_API_URL to your Railway backend URL to switch from
     demo-mode credentials to real JWT authentication.

     <script>window.SUNAV_API_URL = 'https://your-backend.railway.app';</script>
   -->
   ```
5. Replace it with (using your actual Railway URL from Step 3.3):
   ```html
   <script>window.SUNAV_API_URL = 'https://sunav-pulse-backend.up.railway.app';</script>
   ```
6. Commit the change. Vercel automatically redeploys (takes ~60 seconds).

### 5.2 Verify B-01 is resolved
1. Open your Vercel URL.
2. Confirm: the **Demo Credentials** panel is **gone** from the login screen.
3. Log in with `ADMIN-001` / `YourSecurePassword123!`.
4. You should land on the Admin dashboard.
5. Go to **User Management → Add User** to create accounts for your field reps.

B-01 is now eliminated. The demo credentials no longer work in production.

---

# PART B — Fixing B-02: Add Data Persistence

## What this requires

B-02 is engineering work, not configuration. The current architecture stores
all business data (call reports, doctors, approvals, expenses, leave, GPS
records) in React `useState` — it disappears on page refresh.

To fix this, you need to:
1. Implement API routes in the Express backend for each business domain
2. Update the frontend to call those API routes instead of mutating local state

**Estimated effort: 4–8 weeks** depending on team size.
The database schema (13 tables, fully indexed, RLS enabled) is already complete.
The backend scaffold (Express, auth middleware, connection pool, structured logging)
is already in place. You are adding routes to an existing, working foundation.

## Architecture pattern

Every domain follows the same four-step pattern. Here is a complete example
using **Call Reports** as the reference implementation:

### Step B1 — Write the backend route

Create `backend/src/routes/callReports.js`:

```javascript
import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { query } from '../db.js';

const router = express.Router();

// GET /api/call-reports — rep sees own; manager sees team's (enforced by RLS)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT cr.*, u.name as rep_name
       FROM call_reports cr
       JOIN users u ON u.id = cr.rep_id
       WHERE cr.rep_id = $1
          OR EXISTS (
            SELECT 1 FROM territories t
            JOIN users ru ON ru.territory = t.name
            WHERE t.asm_id = $1 AND ru.id = cr.rep_id
          )
       ORDER BY cr.visit_date DESC
       LIMIT 100`,
      [req.user.id]
    );
    res.json({ data: rows });
  } catch (err) { next(err); }
});

// POST /api/call-reports — rep submits a new call report
router.post('/', requireAuth, requireRole('rep'), async (req, res, next) => {
  try {
    const { doctor_id, visit_date, products_detailed, samples_given,
            next_action, notes, gps_lat, gps_lng, gps_status } = req.body;

    const { rows } = await query(
      `INSERT INTO call_reports
         (rep_id, doctor_id, visit_date, products_detailed, samples_given,
          next_action, notes, gps_lat, gps_lng, gps_status, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'submitted')
       RETURNING *`,
      [req.user.id, doctor_id, visit_date,
       JSON.stringify(products_detailed), JSON.stringify(samples_given),
       next_action, notes, gps_lat, gps_lng, gps_status]
    );
    res.status(201).json({ data: rows[0] });
  } catch (err) { next(err); }
});

// PATCH /api/call-reports/:id/approve — manager approves
router.patch('/:id/approve', requireAuth, requireRole('area_manager', 'regional_manager', 'admin'), async (req, res, next) => {
  try {
    const { rows } = await query(
      `UPDATE call_reports
       SET status = 'approved', approver_id = $2, approved_at = now()
       WHERE id = $1
       RETURNING *`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ data: rows[0] });
  } catch (err) { next(err); }
});

export default router;
```

### Step B2 — Register the route in server.js

In `backend/src/server.js`, add after the auth router line:

```javascript
import callReportsRouter from './routes/callReports.js';
// ...
app.use('/api/call-reports', callReportsRouter);
```

### Step B3 — Add an authenticated fetch helper to App.jsx

Add this helper once, near the top of App.jsx after the existing `_apiCall` function:

```javascript
// Authenticated API fetch — automatically attaches the access token
async function apiFetch(method, path, body) {
  return _apiCall(method, `/api${path}`, body);
}
```

### Step B4 — Replace useState initialisation with API call

In `AppRoot`, replace the hardcoded seed data:

```javascript
// BEFORE:
const [callReports, setCallReports] = useState(REPORTS_INIT);

// AFTER:
const [callReports, setCallReports] = useState([]);

// And add a useEffect to load from API on mount:
useEffect(() => {
  if (!USE_REAL_AUTH || !user) return;
  let mounted = true;
  apiFetch('GET', '/call-reports')
    .then(data => { if (mounted) setCallReports(data.data); })
    .catch(() => {}); // graceful — falls back to empty array
  return () => { mounted = false; };
}, [user]); // re-fetch when user changes
```

### Step B5 — Replace mutation handlers with API calls

```javascript
// BEFORE (in NewCallForm submit handler):
const report = { id: 'CR' + Date.now(), ...formData, status: 'submitted' };
setCallReports(p => [report, ...p]);

// AFTER:
const report = await apiFetch('POST', '/call-reports', formData);
setCallReports(p => [report.data, ...p]);
```

---

## Implementation order — 13 domains by priority

Work through domains in this order. Each one follows the same 5-step pattern above.

| Priority | Domain | Backend route file | Frontend useState | Approx. effort |
|---|---|---|---|---|
| 1 | Users / directory | `routes/users.js` | `users`, `extraLogins` | 1 day |
| 2 | Call Reports | `routes/callReports.js` | `callReports` | 2 days |
| 3 | GPS Audit | `routes/gpsAudit.js` | (part of call reports) | 0.5 days |
| 4 | Doctors | `routes/doctors.js` | `DOCTORS_DB_INIT` | 1 day |
| 5 | Expense Claims | `routes/expenseClaims.js` | `expenseClaims` | 1.5 days |
| 6 | Leave Applications | `routes/leave.js` | `leaveApps`, `leaveBalance` | 1.5 days |
| 7 | Route Plans | `routes/routePlans.js` | `routePlans` | 2 days |
| 8 | Chemists | `routes/chemists.js` | `CHEMISTS_DB` | 1 day |
| 9 | Hospitals | `routes/hospitals.js` | `HOSPITALS_DB` | 1 day |
| 10 | Targets | `routes/targets.js` | (KPI dashboard data) | 1 day |
| 11 | Audit Log | `routes/auditLog.js` | `auditLog` | 0.5 days |
| 12 | System Config | `routes/sysConfig.js` | `sysConfig` | 0.5 days |
| 13 | Approvals Hub | (aggregates 3–7) | (reads from existing routes) | 1 day |

**Total estimate: ~15–20 developer days** for a developer familiar with Express + React.
The database schema for all domains is already complete. The auth middleware is
already wired. The frontend component logic (forms, validation, approval flows)
is already built — you're adding API calls, not rewriting screens.

---

## When B-02 is complete

You will know B-02 is done when:
- A field rep can submit a call report, log out, log back in, and see it
- An area manager approves an expense and the rep sees the updated status
- Page refresh does not lose any data
- The seed constants (`REPORTS_INIT`, `DOCTORS_DB_INIT`, etc.) are no longer
  used as useState initial values — replace them with empty arrays seeded from API

At that point, the production readiness score rises from 82 to approximately 95/100,
with the remaining gap being the external monitoring services (Sentry DSN, uptime
monitoring) that require account setup outside the codebase.
