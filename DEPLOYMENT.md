# Deployment Guide

This guide is written so someone without a development background can follow
it end to end. Read the **"What's actually real today"** section first —
it'll save you confusion later.

---

## What's actually real today

**The frontend is a complete, working application you can deploy right now.**
Everything you've seen in the demo — Doctor Management, Call Reports, GPS
Verification, Approvals, KPI Dashboards, Territory Management, Admin tools —
all of it works.

**What it doesn't have yet:** a real backend server or database. All data
currently lives in your browser's memory. Refresh the page and it resets to
sample data. Login is a hardcoded demo check, not real authentication.

This repo includes a `backend/` folder and a `supabase/` database schema —
these are real, working scaffolds (not fake placeholder files), but they
are **not yet connected** to the frontend. Connecting them is real
development work for a dev team, not a deployment step. This guide deploys
what exists today, and tells you exactly where the next phase of work begins.

---

## Prerequisites

You'll need free accounts on:
- [GitHub](https://github.com) — to host the code
- [Vercel](https://vercel.com) — to host the frontend (this is the part that matters today)
- [Railway](https://railway.app) — only if/when you deploy the backend
- [Supabase](https://supabase.com) — only if/when you deploy the database

No credit card is required for any of these to get started.

---

## Step 1 — Push the code to GitHub

1. Go to [github.com/new](https://github.com/new) and create a new repository
   (e.g. `sunav-pulse`). Leave it empty — don't add a README, license, or
   `.gitignore` from GitHub's UI, since this project already has those.
2. On the new repo's page, click **"uploading an existing file"**.
3. Drag the entire contents of this project folder into the upload area.
4. Scroll down, write a commit message like "Initial commit", and click
   **Commit changes**.

*(If you're comfortable with the command line instead, the usual `git init`,
`git remote add origin <url>`, `git push` works too.)*

---

## Step 2 — Deploy the frontend to Vercel (this is the live demo)

1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
2. Click **Import** next to your `sunav-pulse` repository.
3. Vercel will auto-detect this as a **Vite** project — the build settings
   shown should already match `vercel.json` in this repo:
   - Build command: `npm run build`
   - Output directory: `dist`
4. **No environment variables are required** for the app to work exactly as
   it does in this demo — leave that section blank.
5. Click **Deploy**. After ~1 minute you'll get a live URL like
   `https://sunav-pulse.vercel.app`.

That's it — the frontend is now live and publicly accessible.

### Custom domain + SSL

1. In your Vercel project, go to **Settings → Domains**.
2. Add your domain (e.g. `app.sunavpulse.com`).
3. Vercel will show you a DNS record to add at your domain registrar
   (usually a `CNAME` or `A` record).
4. Once DNS propagates (a few minutes to a few hours), Vercel automatically
   issues and renews an SSL certificate for you — no extra steps needed.

### Redeploying after changes

Any time you push new commits to the GitHub repo's main branch, Vercel
automatically rebuilds and redeploys. No manual steps required.

---

## Step 3 — Backend on Railway *(optional — do this when you're ready to build real API routes)*

The included `backend/` folder is a real, minimal Express server with a
health check endpoint. It does **not** yet talk to the frontend or a
database — deploying it today gets you a live, empty API to build on.

1. Go to [railway.app/new](https://railway.app/new), sign in with GitHub.
2. **Deploy from GitHub repo** → select `sunav-pulse`.
3. Railway will detect `railway.json` and build from `backend/Dockerfile`.
4. Under **Variables**, add the entries from `backend/.env.example`
   (`FRONTEND_ORIGIN`, `DATABASE_URL`, etc. — see Step 4 for `DATABASE_URL`).
5. Railway assigns a public URL automatically (e.g.
   `sunav-pulse-backend.up.railway.app`), with SSL already configured.
6. Visit `https://your-backend-url.up.railway.app/health` — you should see
   `{"status":"ok",...}`.

---

## Step 4 — Database on Supabase *(optional — needed once the backend has real routes)*

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create
   a new project (pick a strong database password and save it somewhere safe).
2. Once the project is ready, open **SQL Editor**.
3. Paste the entire contents of `supabase/migrations/0001_init.sql` and run it.
   This creates all the tables matching the app's data model (users, doctors,
   call reports, route plans, expense claims, leave applications, GPS audit,
   territories, audit log, and more).
4. **Before any real data goes in: read the Row Level Security section at
   the bottom of that SQL file and configure it.** Supabase exposes tables
   publicly by default — RLS policies are what restrict who can see/edit
   what, and they depend on how you implement real login. Don't skip this.
5. Go to **Settings → Database** and copy the connection string. Paste it
   into Railway's `DATABASE_URL` variable from Step 3.

---

## Local development (optional)

If you or a developer want to run everything locally with Docker:

```bash
docker compose up --build
```

This starts:
- the frontend at `http://localhost:8081`
- the backend at `http://localhost:8080`
- a local Postgres database (pre-loaded with the schema from `supabase/migrations/`)

Or run the frontend alone without Docker:

```bash
npm install
npm run dev
```

This starts a dev server at `http://localhost:5173` with hot-reload.

---

## Rollback plan

- **Frontend (Vercel):** every deployment is kept. Go to your project →
  **Deployments**, find a previous working one, click the **⋯** menu →
  **Promote to Production**. This is instant and doesn't require touching code.
- **Backend (Railway):** same idea — go to **Deployments**, select an
  earlier successful build, and redeploy it.
- **Database (Supabase):** Supabase takes automatic daily backups on paid
  plans. On the free tier, take a manual backup before any schema change:
  **Database → Backups → Manual Backup**.

---

## What to tell people testing the live demo

The four built-in demo accounts (shown on the login screen):

| Role | Employee ID | Password |
|---|---|---|
| Medical Representative | `rep.demo` | `Demo@2024` |
| Area Sales Manager | `asm.demo` | `Demo@2024` |
| Regional Sales Manager | `rsm.demo` | `Demo@2024` |
| System Administrator | `admin.demo` | `Demo@2024` |

Admins can also create additional test accounts from **User Management →
Add User**, which generates working demo credentials for that new account
on the spot.

**Important:** because there's no backend yet, anything created during a
demo (new call reports, approvals, users, etc.) only exists in that
visitor's browser tab and disappears on refresh. If you need data to persist
between visitors or sessions, that's the backend + database work described
above.

---

## Current limitations — be upfront about these

- No real authentication — the demo password is intentionally visible on
  the login screen.
- No data persistence — everything resets on page refresh.
- No rate limiting, no real session expiry, no password hashing (there's
  nothing to hash — there's no real password storage yet).
- Single-file frontend (`src/App.jsx`, ~6,000 lines) — fine for a demo,
  but a real engineering team should split this into modules before
  building extensively on top of it.

None of this blocks using the app as a sales/investor demo — it's exactly
what's needed to know before treating it as a production system handling
real pharmaceutical company data.
