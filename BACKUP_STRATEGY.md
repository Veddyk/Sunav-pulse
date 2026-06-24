# SunaV Pulse — Database Backup Strategy

## Current state

Supabase free tier provides **no point-in-time recovery** and no automatic
backups. This means that until you upgrade to a paid Supabase plan or
implement the backup procedures below, a database incident (accidental
table drop, bad migration, data corruption) requires a restore from your
most recent manual export.

---

## Backup tiers

| Tier | Method | Retention | Recovery Point Objective | Cost |
|---|---|---|---|---|
| **Tier 1 — Manual** | `pg_dump` run manually | Keep last 7 | Last manual run | Free |
| **Tier 2 — Scheduled** | GitHub Actions `pg_dump` | 7 daily, 4 weekly | < 24 hours | Free (Actions minutes) |
| **Tier 3 — Supabase PITR** | Supabase Pro built-in | 7 days PITR | Any point in 7 days | $25/month |

**Recommended for production use with real pharmaceutical data: Tier 3.**
The RPO of < 24 hours from a scheduled backup is not acceptable for
field force data that changes every hour.

---

## Tier 2 — Automated scheduled backup via GitHub Actions

Add this workflow to `.github/workflows/db-backup.yml`:

```yaml
name: Database Backup

on:
  schedule:
    # Runs daily at 02:00 UTC (off-peak for most Indian time zones)
    - cron: '0 2 * * *'
  workflow_dispatch:  # allow manual trigger

jobs:
  backup:
    name: pg_dump to S3 / GitHub Artifact
    runs-on: ubuntu-latest

    steps:
      - name: Install pg_dump (PostgreSQL 16 client)
        run: |
          sudo apt-get update -q
          sudo apt-get install -y postgresql-client-16

      - name: Dump database
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          TIMESTAMP=$(date +%Y%m%d_%H%M%S)
          FILENAME="sunav_pulse_${TIMESTAMP}.sql.gz"
          pg_dump "$DATABASE_URL" \
            --no-owner \
            --no-acl \
            --schema=public \
            | gzip > "$FILENAME"
          echo "BACKUP_FILE=$FILENAME" >> $GITHUB_ENV

      - name: Upload backup as GitHub Actions artifact
        uses: actions/upload-artifact@v4
        with:
          name: db-backup-${{ github.run_id }}
          path: ${{ env.BACKUP_FILE }}
          # Retain for 30 days; GitHub artifact storage is free up to 500 MB
          retention-days: 30
```

**Required GitHub secret:** `DATABASE_URL` — add it in your repository
Settings → Secrets → Actions. Use the same connection string from
`backend/.env`.

> ⚠️ **Security:** Never commit the DATABASE_URL to source control.
> The secret is encrypted at rest in GitHub and is only exposed during
> the workflow run.

---

## Tier 3 — Supabase Point-in-Time Recovery

1. In Supabase Dashboard → **Settings → Billing** → upgrade to Pro plan.
2. Under **Settings → Backups**, confirm PITR is enabled and showing
   the 7-day retention window.
3. To restore to a specific point in time:
   - Supabase Dashboard → **Settings → Backups → Point in Time Recovery**
   - Select the target timestamp → **Restore**.
   - The restore creates a new database snapshot; Supabase engineers
     validate it before it goes live. Typical RTO: 15–60 minutes.

---

## Manual backup procedure

Run this before every schema migration or significant data import:

```bash
# 1. Export the public schema only (excludes Supabase internal tables)
pg_dump \
  "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres" \
  --no-owner \
  --no-acl \
  --schema=public \
  --file="sunav_pulse_$(date +%Y%m%d_%H%M%S)_pre_migration.sql"

# 2. Compress it
gzip sunav_pulse_*.sql

# 3. Store it somewhere safe:
#    - A shared Google Drive / S3 bucket accessible to >1 person
#    - NOT only on your local machine (single point of failure)
```

---

## Restore procedure

### Restore from pg_dump backup

```bash
# Step 1: Create a fresh database (or drop and recreate the target schema)
# If restoring to Supabase, create a new project and use its connection string.

# Step 2: Restore the dump
gunzip < sunav_pulse_20260622_020000.sql.gz \
  | psql "postgresql://postgres:[PASSWORD]@db.[NEW-REF].supabase.co:5432/postgres"

# Step 3: Re-run auth and RLS migrations (the dump includes only public schema)
psql [CONNECTION_STRING] < supabase/migrations/0002_auth_tables.sql
psql [CONNECTION_STRING] < supabase/migrations/0003_schema_improvements.sql
psql [CONNECTION_STRING] < supabase/migrations/0004_rls_policies.sql

# Step 4: Update DATABASE_URL in Railway environment variables to point
# to the restored database.

# Step 5: Verify the restore
psql [CONNECTION_STRING] -c "SELECT COUNT(*) FROM users;"
psql [CONNECTION_STRING] -c "SELECT COUNT(*) FROM call_reports;"
psql [CONNECTION_STRING] -c "SELECT COUNT(*) FROM audit_log;"
```

---

## Backup validation checklist

Run this monthly (or after each restore):

```bash
# 1. Confirm backup file is not empty
ls -lh sunav_pulse_*.sql.gz
# Expected: > 10 KB for a database with any data

# 2. Test the backup by restoring to a local Docker container
docker run -d \
  --name sunav_restore_test \
  -e POSTGRES_PASSWORD=test \
  -p 5433:5432 \
  postgres:16-alpine

sleep 5

# Restore
gunzip < sunav_pulse_latest.sql.gz \
  | psql postgresql://postgres:test@localhost:5433/postgres

# Verify row counts match production
psql postgresql://postgres:test@localhost:5433/postgres \
  -c "SELECT tablename, n_live_tup FROM pg_stat_user_tables ORDER BY tablename;"

# Clean up
docker rm -f sunav_restore_test
```

---

## Retention policy

| Backup type | Retention | Storage location |
|---|---|---|
| Pre-migration manual | Keep indefinitely | Google Drive (shared) |
| Daily automated | 30 days | GitHub Actions artifacts |
| Weekly manual | 12 weeks | Google Drive (shared) |
| Monthly archive | 12 months | Cold storage (S3 Glacier / Google Coldline) |

Older backups beyond the above windows should be **deleted** — retaining
expired backups that contain personal data (doctor PII, employee data)
longer than necessary creates GDPR/PDPA liability.

---

## What is NOT backed up by pg_dump

- Supabase Auth users (managed by Supabase's internal `auth` schema)
- Supabase Storage buckets (if you add file uploads later — back up separately)
- Edge Function code (backed up in your GitHub repo)

---

## Contacts for data incidents

| Scenario | Who to call | SLA |
|---|---|---|
| Accidental table drop | Engineering lead + Supabase support | Immediate |
| Bad migration (data corrupted) | Engineering lead | Immediate |
| Supabase outage | Monitor https://status.supabase.com/ | N/A (Supabase controls) |
| GDPR/data deletion request | Privacy officer → Engineering | 30 days (GDPR requirement) |

*Last reviewed: June 2026*
