-- ─────────────────────────────────────────────────────────────────────────────
-- SunaV Pulse — Down Migration: Reverse 0004_rls_policies.sql
--
-- Disables all Row Level Security and removes helper functions.
-- Must be run BEFORE 0003_down.sql if both are being reversed.
--
-- SECURITY WARNING: Running this file re-exposes all tables through the
-- Supabase auto-generated REST API with no access controls.
-- Only run in a staging/dev environment or as an emergency measure
-- while re-writing policies — NEVER leave production in this state.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Drop all policies using a dynamic loop ────────────────────────────────────
-- More maintainable than listing all 52 policies by name individually.
do $$
declare
  r record;
begin
  for r in
    select policyname, tablename
    from   pg_policies
    where  schemaname = 'public'
  loop
    execute format('drop policy if exists %I on %I', r.policyname, r.tablename);
  end loop;
end;
$$;


-- ── Disable RLS on all tables ─────────────────────────────────────────────────

alter table users              disable row level security;
alter table doctors            disable row level security;
alter table products           disable row level security;
alter table call_reports       disable row level security;
alter table chemists           disable row level security;
alter table chemist_visits     disable row level security;
alter table hospitals          disable row level security;
alter table hospital_visits    disable row level security;
alter table gps_audit          disable row level security;
alter table route_plans        disable row level security;
alter table expense_claims     disable row level security;
alter table leave_applications disable row level security;
alter table leave_balances     disable row level security;
alter table territories        disable row level security;
alter table targets            disable row level security;
alter table audit_log          disable row level security;
alter table system_config      disable row level security;


-- ── Drop helper functions ─────────────────────────────────────────────────────

drop function if exists rls_current_role();
drop function if exists rls_is_admin();
drop function if exists rls_is_manager();
drop function if exists rls_manages(uuid);


-- ─────────────────────────────────────────────────────────────────────────────
-- Post-rollback verification
-- ─────────────────────────────────────────────────────────────────────────────

/*
-- Confirm RLS is off on all tables
select tablename, rowsecurity
from   pg_tables
where  schemaname = 'public'
  and  rowsecurity = true;
-- Expected: 0 rows (all disabled)

-- Confirm no policies remain
select count(*) from pg_policies where schemaname = 'public';
-- Expected: 0

-- Confirm helper functions are gone
select count(*) from pg_proc
where proname in ('rls_current_role','rls_is_admin','rls_is_manager','rls_manages');
-- Expected: 0
*/
