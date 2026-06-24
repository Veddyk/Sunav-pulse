# SunaV Pulse — Incident Runbook

## Scope
Step-by-step responses to the scenarios most likely to affect a live demo or
production deployment. Written for non-developers who may be on call.

---

## RB-01 — Vercel outage (entire frontend unreachable)

### Detection
- Users report the app URL returns a 5xx or is completely unreachable.
- Check https://www.vercel-status.com/ — if Vercel shows an active incident,
  this is the cause.

### Impact
- 100% of users cannot access the application.
- Backend API (Railway) is unaffected.
- No data loss — backend and database continue running.

### Fallback procedure (estimated: 15–20 minutes)

The Docker image (Dockerfile + nginx.conf) can be used to serve the exact same
static bundle from any machine or cloud server.

**Option A — Railway static serving (fastest)**
1. Log in to your Railway project: https://railway.app/dashboard
2. Add a new service → **Docker Image**
3. Build and push the frontend Docker image:
   ```bash
   docker build -t sunav-pulse-frontend .
   docker tag sunav-pulse-frontend registry.railway.app/your-project/frontend:latest
   docker push registry.railway.app/your-project/frontend:latest
   ```
4. Set the Railway service port to `8080`.
5. Railway assigns a public URL (e.g. `frontend.up.railway.app`) — share this
   with users while Vercel recovers.

**Option B — Fly.io (5 minutes if account already exists)**
```bash
fly launch --name sunav-pulse --dockerfile Dockerfile
fly deploy
```
Fly assigns a `*.fly.dev` URL immediately.

**Option C — Local machine (for demo purposes only)**
```bash
docker build -t sunav-pulse-frontend .
docker run -p 8081:8080 sunav-pulse-frontend
# App is now at http://localhost:8081
```
Share your screen or use ngrok (`ngrok http 8081`) to expose it publicly.

### Recovery
Once Vercel recovers (check https://www.vercel-status.com/):
1. Confirm the Vercel URL is serving the correct version.
2. Update any DNS or shared links back to the Vercel URL.
3. Shut down the temporary fallback service.

---

## RB-02 — Railway backend unreachable

### Detection
- Login page loads but signing in returns a network error.
- `https://your-backend.railway.app/health` returns 5xx or times out.
- Check https://status.railway.app/ for Railway incidents.

### Impact
- Demo mode (client-side credentials) continues to work.
- Production auth (real accounts) is unavailable.
- No data loss — Supabase database is unaffected.

### Response
1. Check Railway deployment logs for crash details:
   Railway dashboard → your service → **Deployments** tab → latest log.
2. If the latest deployment caused the crash: **Rollback** to the previous
   deployment (three-dot menu → Rollback).
3. If no recent deployment: check the **Metrics** tab for memory/CPU spikes.
4. The health check at `/health` includes `"db": "connected"` or
   `"db": "unreachable"` — if DB is unreachable, see RB-03.

---

## RB-03 — Supabase database unreachable

### Detection
- Backend `/health` returns `{"status":"degraded","db":"unreachable"}`.
- Check https://status.supabase.com/ for Supabase incidents.

### Impact
- Auth login is unavailable.
- All backend API routes fail.
- Demo mode still works.

### Response
1. If Supabase reports an ongoing incident: wait. Supabase has a 99.9% SLA on
   the Pro plan.
2. If no Supabase incident:
   - Check DATABASE_URL in Railway environment variables — confirm it hasn't
     been accidentally changed.
   - In Supabase dashboard → **Settings → Database**: confirm the project is
     running and the connection string is correct.
   - Try the connection string locally:
     ```bash
     psql "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
     ```

---

## RB-04 — Bad deployment breaks the app (frontend)

### Detection
- Vercel deployment succeeded but the app crashes on load or a key screen
  is broken.

### Rollback procedure (< 1 minute)
1. Go to https://vercel.com/dashboard → your project → **Deployments** tab.
2. Find the last known-good deployment (green checkmark, earlier timestamp).
3. Click the **⋯** menu → **Promote to Production**.
4. The rollback is instant — no rebuild required.

---

## RB-05 — PgBouncer connection pool exhaustion (future risk)

### Detection
- Backend logs show: `remaining connection slots are reserved for non-replication superuser`
- Requests start timing out at `connectionTimeoutMillis` (5 000 ms).

### Background
Supabase free tier allows 60 database connections. The backend pool is capped at
`max: 10` connections (configured in `backend/src/db.js`). At moderate scale
with multiple backend instances, the combined pool can exceed this limit.

### Response
1. **Immediate**: reduce `max` in `db.js` to `5` and redeploy.
2. **Proper fix**: enable PgBouncer in Supabase:
   - Supabase Dashboard → **Settings → Database → Connection Pooling**.
   - Mode: **Transaction** (correct for a stateless REST API).
   - Use the PgBouncer connection string (port 6543) in `DATABASE_URL`.
   - PgBouncer allows thousands of application connections while multiplexing
     them into the 60 actual Postgres connections.
3. On paid Supabase plans, the connection limit is higher (200+ on Pro).

---

## Contact & Escalation

| Role | Contact | When to call |
|---|---|---|
| Frontend / Vercel | Development team | Vercel outage, broken build |
| Backend / Railway | Development team | API crash, auth down |
| Database / Supabase | Development team | Data loss, migration failure |
| Domain / DNS | Domain registrar admin | Custom domain unreachable |

---

*Last updated: June 2026*
