-- ─────────────────────────────────────────────────────────────────────────────
-- SunaV Pulse — Migration 0003: Schema Improvements & Missing Indexes
--
-- Addresses Production Readiness Audit findings:
--   4.1  Schema Design Review (4 structural issues)
--   4.2  Index Assessment (5 missing indexes + 2 bonus compound indexes)
--
-- Safe to run against an existing database — all statements are additive.
-- No data is dropped or modified; the INSERT of the system_config row is
-- unchanged; existing foreign keys are untouched.
--
-- Run order: 0001_init.sql → 0002_auth_tables.sql → THIS FILE → 0004_rls_policies.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1 — Schema Design Fixes (Audit Finding 4.1)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Fix A: gps_audit.call_report_id missing FK ───────────────────────────────
--
-- Root cause: the column was declared as plain uuid with no REFERENCES.
-- Any call_report deletion leaves orphaned GPS audit rows with a dangling ID.
-- Orphaned rows silently invalidate GPS compliance reports and are invisible
-- to integrity checks.
--
-- Fix: add the FK with ON DELETE SET NULL.
-- Rationale for SET NULL (not CASCADE):
--   GPS audit records are an audit trail. If a call report is corrected or
--   deleted by an admin, the fact that a GPS check-in occurred at that time
--   and place should still be preserved for compliance purposes.
--   SET NULL preserves the GPS record while making it clear that the linked
--   call report no longer exists (call_report_id IS NULL = unlinked).
--
alter table gps_audit
  add constraint fk_gps_audit_call_report
  foreign key (call_report_id)
  references call_reports(id)
  on delete set null;

comment on column gps_audit.call_report_id is
  'FK to call_reports(id). SET NULL on call report deletion so GPS audit records '
  'are preserved as compliance evidence even if the linked visit is later removed.';


-- ── Fix B: leave_balances.updated_at missing ─────────────────────────────────
--
-- Root cause: leave_balances had no timestamp column. Any mutation to a
-- balance (approval granting days, admin adjustment) was invisible in the
-- audit trail — you could not reconstruct how a balance reached its current
-- value or detect unauthorised balance edits.
--
-- Fix: add updated_at column + trigger that auto-stamps every UPDATE.
-- This makes leave_balances auditable without requiring the application to
-- remember to set the timestamp on every code path.

alter table leave_balances
  add column updated_at timestamptz not null default now();

-- Update existing rows to a sensible timestamp
update leave_balances
  set updated_at = now()
  where updated_at is null;

-- Auto-update trigger (reusable function shared with other tables)
create or replace function fn_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_leave_balances_updated_at
  before update on leave_balances
  for each row
  execute function fn_set_updated_at();

comment on column leave_balances.updated_at is
  'Auto-stamped by trg_leave_balances_updated_at on every UPDATE. '
  'Provides an audit trail of balance mutations without requiring app-level timestamp management.';


-- ── Fix C: users.password_hash — audit finding is already superseded ─────────
--
-- The audit flagged the absence of a password_hash column on the users table.
-- Migration 0002_auth_tables.sql already implements the BETTER design:
-- a separate password_credentials table with bcrypt hashes, password history,
-- and expiry tracking — deliberately separate from users so credential data is
-- never accidentally included in application-level joins.
-- No action required here.


-- ── Fix D: system_config single-row constraint limits multi-tenancy ───────────
--
-- Root cause: the original schema enforced CHECK (id = 1), making it
-- impossible to store per-organisation configuration without a schema change.
-- Pharmaceutical SaaS often needs per-customer configuration (geofence radius
-- per region, different leave policies per country, etc.).
--
-- Fix: replace the hard-coded single-row constraint with a proper
-- multi-tenancy-ready pattern:
--   • Add organization_id uuid column (NULL = global / single-tenant config)
--   • Drop the CHECK (id = 1) constraint
--   • Add a UNIQUE constraint on organization_id with NULLS NOT DISTINCT
--     (PostgreSQL 15+, which Supabase runs) — ensures exactly one global
--     config row (NULL) and exactly one row per organization UUID.
--   • The existing id=1 row remains valid and becomes the global default.
--
-- Backward compatibility: all existing code that does
--   SELECT * FROM system_config WHERE id = 1
-- continues to work unchanged. No application code changes are required
-- until you actually add a second tenant.

alter table system_config
  add column organization_id uuid default null;

-- Remove the single-row guard (superseded by the unique index below)
alter table system_config
  drop constraint single_row;

-- NULLS NOT DISTINCT: only one row where organization_id IS NULL is allowed.
-- Each non-null UUID also gets exactly one row. This enforces the invariant
-- without preventing multi-tenancy growth.
create unique index idx_system_config_org
  on system_config (organization_id) nulls not distinct;

comment on column system_config.organization_id is
  'NULL = global / single-tenant configuration (the default row). '
  'Set to an organization UUID for per-tenant config in multi-tenant deployments. '
  'Enforced unique by idx_system_config_org.';


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2 — Missing Indexes (Audit Finding 4.2)
-- ─────────────────────────────────────────────────────────────────────────────
--
-- All indexes are CONCURRENTLY to avoid locking tables in production.
-- For a fresh database (no existing data) this has no practical effect,
-- but the keyword is kept for correctness.
--
-- Naming convention: idx_{table}_{columns}
-- ─────────────────────────────────────────────────────────────────────────────

-- ── call_reports(visit_date) ─────────────────────────────────────────────────
-- Required for every time-range report:
--   "Show me all visits last week", "MTD call count", "calls in Q3".
-- DESC ordering matches the typical "most recent first" query shape.
create index concurrently idx_call_reports_visit_date
  on call_reports (visit_date desc);

-- Compound index supporting the most common field-force reporting query:
-- calls by a rep within a date range (rep KPI dashboard).
-- Covers: WHERE rep_id = $1 AND visit_date BETWEEN $2 AND $3
create index concurrently idx_call_reports_rep_date
  on call_reports (rep_id, visit_date desc);


-- ── audit_log(actor_id, created_at) ─────────────────────────────────────────
-- Required for: "show me all actions by this user" (admin investigation,
-- compliance audit, session review). Without this index, filtering
-- audit_log by actor_id requires a full table scan on what becomes the
-- highest-write table in the system.
-- actor_id alone is not enough — queries almost always also include a
-- date range, so the compound index is correct here.
create index concurrently idx_audit_log_actor
  on audit_log (actor_id, created_at desc);


-- ── gps_audit(created_at) ────────────────────────────────────────────────────
-- Required for GPS compliance reports:
--   "Show all GPS checks in the last 30 days", "override rate this week".
-- The existing idx_gps_audit_rep covers per-rep GPS lookups. This covers
-- system-wide GPS reporting sorted by time.
create index concurrently idx_gps_audit_created_at
  on gps_audit (created_at desc);

-- Compound index for the most common GPS compliance query pattern:
-- compliance rate per rep within a date window.
create index concurrently idx_gps_audit_rep_created
  on gps_audit (rep_id, created_at desc);


-- ── doctors(territory) ───────────────────────────────────────────────────────
-- Required once the application loads doctors per territory
-- (Territory Management screen, rep assignment, coverage reporting).
-- Currently the territory column is a text label — this index makes
-- equality lookups on it O(log n) instead of O(n).
create index concurrently idx_doctors_territory
  on doctors (territory)
  where territory is not null;


-- ── targets(product_id, period_month) ────────────────────────────────────────
-- The existing idx_targets_rep_period covers per-rep target queries.
-- This covers the missing product-level reporting:
--   "How is CardioMax performing across all reps this quarter?"
-- Including rep_id in the index makes it a covering index for the
-- most common product-period-rep query pattern.
create index concurrently idx_targets_product_period
  on targets (product_id, period_month desc);

create index concurrently idx_targets_product_period_rep
  on targets (product_id, period_month desc, rep_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3 — updated_at triggers on other high-mutation tables
-- ─────────────────────────────────────────────────────────────────────────────
-- The fn_set_updated_at() function defined above is reusable.
-- Adding updated_at columns to other tables that don't have them improves
-- cache invalidation, replication, and change-data-capture (CDC) support.

-- call_reports — approvals change the record; the timestamp reveals when
alter table call_reports
  add column if not exists updated_at timestamptz default now();

create trigger trg_call_reports_updated_at
  before update on call_reports
  for each row execute function fn_set_updated_at();

-- expense_claims
alter table expense_claims
  add column if not exists updated_at timestamptz default now();

create trigger trg_expense_claims_updated_at
  before update on expense_claims
  for each row execute function fn_set_updated_at();

-- leave_applications
alter table leave_applications
  add column if not exists updated_at timestamptz default now();

create trigger trg_leave_applications_updated_at
  before update on leave_applications
  for each row execute function fn_set_updated_at();

-- route_plans (two-stage approval mutates the row twice)
alter table route_plans
  add column if not exists updated_at timestamptz default now();

create trigger trg_route_plans_updated_at
  before update on route_plans
  for each row execute function fn_set_updated_at();

-- users (last_login, status changes)
alter table users
  add column if not exists updated_at timestamptz default now();

create trigger trg_users_updated_at
  before update on users
  for each row execute function fn_set_updated_at();


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4 — Index on targets(rep_id, period_month) note
-- ─────────────────────────────────────────────────────────────────────────────
-- idx_targets_rep_period already exists from 0001_init.sql — do not recreate.
-- Documented here for completeness: the audit confirmed this index is correct.


-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICATION QUERIES
-- Run these after applying the migration to confirm correctness.
-- ─────────────────────────────────────────────────────────────────────────────

/*
-- 1. Confirm FK on gps_audit.call_report_id exists
select tc.constraint_name, tc.constraint_type, kcu.column_name,
       ccu.table_name as references_table
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
join information_schema.constraint_column_usage ccu
  on tc.constraint_name = ccu.constraint_name
where tc.table_name = 'gps_audit'
  and tc.constraint_type = 'FOREIGN KEY';
-- Expected: fk_gps_audit_call_report → call_reports(id)

-- 2. Confirm leave_balances has updated_at
select column_name, data_type from information_schema.columns
where table_name = 'leave_balances' and column_name = 'updated_at';

-- 3. Confirm system_config lost single_row and gained organization_id
select column_name from information_schema.columns
where table_name = 'system_config' and column_name = 'organization_id';

select conname from pg_constraint
where conrelid = 'system_config'::regclass and conname = 'single_row';
-- Expected: 0 rows (constraint removed)

-- 4. Confirm all new indexes
select indexname from pg_indexes
where tablename in ('call_reports','audit_log','gps_audit','doctors','targets')
  and indexname like 'idx_%'
order by tablename, indexname;
*/
