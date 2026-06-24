# Deployment Checklist

Quick reference — see DEPLOYMENT.md for full explanations of each step.

## Before you start
- [ ] GitHub account created
- [ ] Vercel account created (sign in with GitHub)
- [ ] Decided: are you deploying just the frontend demo today, or also
      starting on the backend/database?

## Frontend (do this — it's real and works today)
- [ ] Code pushed to a GitHub repository
- [ ] Repository imported into Vercel
- [ ] Vercel build settings confirmed (Vite / `npm run build` / `dist`)
- [ ] Deployed — live URL confirmed working
- [ ] Logged in with each of the 4 demo accounts to sanity-check
- [ ] (Optional) custom domain added in Vercel → Settings → Domains
- [ ] (Optional) confirmed SSL padlock shows on the custom domain

## Backend (optional — only if you're starting real development)
- [ ] Railway account created
- [ ] Repository connected, building from `backend/Dockerfile`
- [ ] Environment variables set from `backend/.env.example`
- [ ] `/health` endpoint returns `{"status":"ok"}` on the live Railway URL

## Database (optional — only if backend is also being built)
- [ ] Supabase project created
- [ ] `supabase/migrations/0001_init.sql` run successfully
- [ ] Database password saved somewhere secure (e.g. a password manager)
- [ ] **Row Level Security policies written and enabled** before any real
      data is entered — do not skip this
- [ ] Connection string copied into Railway's `DATABASE_URL`

## Before sharing the live URL with anyone external
- [ ] Confirmed everyone testing understands data resets on refresh
      (until backend + database are wired up)
- [ ] Confirmed the demo password being public is acceptable for this
      audience (it is intentional for a sales demo, not a real account)
- [ ] Decided who needs login credentials and shared the demo account table
      from DEPLOYMENT.md

## Enabling PR Preview Deployments (6.3 fix)

Vercel preview deployments require three repository secrets:

1. Go to **Vercel Dashboard → Settings → Tokens** → create a new token named
   `github-actions` (scope: full account). Copy it.

2. Link your local project to Vercel:
   ```bash
   npx vercel link
   cat .vercel/project.json
   # Note the orgId and projectId values
   ```

3. In your GitHub repo → **Settings → Secrets → Actions**, add:
   - `VERCEL_TOKEN` — the token from step 1
   - `VERCEL_ORG_ID` — `orgId` from `.vercel/project.json`
   - `VERCEL_PROJECT_ID` — `projectId` from `.vercel/project.json`

4. Also add `SEMGREP_APP_TOKEN` (optional but recommended) from
   https://semgrep.dev/manage → Settings → Tokens

Once set, every pull request automatically gets a live preview URL posted
as a comment. Production deploy only happens after ALL CI gates pass.

## Migration rollback procedure (6.2 fix)

If a Supabase migration needs to be reversed:

```bash
# Reverse 0004 (RLS policies) — must be done first
psql $DATABASE_URL < supabase/migrations/0004_down.sql

# Reverse 0003 (schema improvements) — only if 0004 is already reversed
psql $DATABASE_URL < supabase/migrations/0003_down.sql
```

Warning: running these removes data (updated_at columns, organization_id).
Take a pg_dump backup first — see BACKUP_STRATEGY.md.
