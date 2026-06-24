-- ─────────────────────────────────────────────────────────────────────────────
-- SunaV Pulse — Down Migration: Reverse 0003_schema_improvements.sql
--
-- Run this ONLY if you need to roll back migration 0003.
-- Apply in this order to avoid FK / dependency errors:
--   1. This file  (0003_down.sql)
--   2. 0004_down.sql  (if 0004 was applied — must be reversed first)
--
-- IMPORTANT: running this removes real columns (updated_at, organization_id)
-- and real indexes. Any data stored in those columns is PERMANENTLY LOST.
-- Take a database backup before running this in production.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Section 1: Reverse updated_at triggers and columns ───────────────────────

-- Triggers must be dropped before the function that implements them
drop trigger if exists trg_leave_balances_updated_at    on leave_balances;
drop trigger if exists trg_call_reports_updated_at      on call_reports;
drop trigger if exists trg_expense_claims_updated_at    on expense_claims;
drop trigger if exists trg_leave_applications_updated_at on leave_applications;
drop trigger if exists trg_route_plans_updated_at       on route_plans;
drop trigger if exists trg_users_updated_at             on users;

-- Drop the shared trigger function
drop function if exists fn_set_updated_at();

-- Drop the updated_at columns added by 0003
-- NOTE: ALTER TABLE ... DROP COLUMN is irreversible without a backup.
alter table leave_balances     drop column if exists updated_at;
alter table call_reports       drop column if exists updated_at;
alter table expense_claims     drop column if exists updated_at;
alter table leave_applications drop column if exists updated_at;
alter table route_plans        drop column if exists updated_at;
alter table users              drop column if exists updated_at;


-- ── Section 2: Reverse gps_audit FK ──────────────────────────────────────────

alter table gps_audit
  drop constraint if exists fk_gps_audit_call_report;


-- ── Section 3: Reverse system_config multi-tenancy preparation ───────────────

-- Remove the unique index that replaced single_row
drop index if exists idx_system_config_org;

-- Restore the single-row constraint
-- NOTE: this will fail if more than one row exists in system_config.
--       If additional rows were added for tenants, delete them first.
alter table system_config
  drop column if exists organization_id;

alter table system_config
  add constraint single_row check (id = 1);


-- ── Section 4: Drop all indexes added by 0003 ────────────────────────────────

drop index concurrently if exists idx_call_reports_visit_date;
drop index concurrently if exists idx_call_reports_rep_date;
drop index concurrently if exists idx_audit_log_actor;
drop index concurrently if exists idx_gps_audit_created_at;
drop index concurrently if exists idx_gps_audit_rep_created;
drop index concurrently if exists idx_doctors_territory;
drop index concurrently if exists idx_targets_product_period;
drop index concurrently if exists idx_targets_product_period_rep;


-- ─────────────────────────────────────────────────────────────────────────────
-- Post-rollback verification
-- ─────────────────────────────────────────────────────────────────────────────

/*
-- Confirm single_row constraint is back
select conname from pg_constraint
where conrelid = 'system_config'::regclass and conname = 'single_row';
-- Expected: 1 row

-- Confirm gps_audit FK is gone
select count(*) from information_schema.table_constraints
where table_name = 'gps_audit' and constraint_name = 'fk_gps_audit_call_report';
-- Expected: 0

-- Confirm updated_at columns are gone
select column_name from information_schema.columns
where table_name = 'leave_balances' and column_name = 'updated_at';
-- Expected: 0 rows
*/
