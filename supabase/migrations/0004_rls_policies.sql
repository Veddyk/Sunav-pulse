-- ─────────────────────────────────────────────────────────────────────────────
-- SunaV Pulse — Migration 0004: Row Level Security Policies
--
-- Addresses Production Readiness Audit finding 4.3 (CRITICAL):
--   All 13 tables have RLS disabled. Supabase auto-generates a REST API
--   for every table; without RLS, the anon key grants read/write access
--   to all data — bypassing the application entirely.
--
-- ── ARCHITECTURE NOTE — read before applying ─────────────────────────────────
--
-- OUR AUTH MODEL: The Express backend (backend/src/) issues custom JWTs signed
-- with JWT_SECRET. The frontend calls the backend API; it does NOT call
-- Supabase directly. The backend uses the SUPABASE_SERVICE_ROLE_KEY which
-- bypasses RLS entirely (intentional — the backend enforces auth at the route
-- level, not the RLS level).
--
-- WHO IS AFFECTED BY THESE POLICIES:
--   ✅ Any caller presenting a Bearer token issued by our Express backend
--      (after Supabase JWT configuration — see step 1 below)
--   ✅ Any direct Supabase REST API call (defense-in-depth against anon key
--      exposure or a compromised frontend)
--   ❌ Our Express backend routes — they use the service role key and bypass RLS
--
-- REQUIRED SUPABASE CONFIGURATION (do this before applying this migration):
--   1. Dashboard → Authentication → Settings → JWT Settings
--      Set "JWT Secret" to the same value as your backend JWT_SECRET.
--      This tells Supabase how to verify our tokens so auth.uid() and
--      auth.jwt() work correctly in RLS policy expressions.
--   2. After setting, verify with:
--        select auth.uid();   -- run as an authenticated user
--      It should return the user's UUID (the 'sub' claim from our JWT).
--
-- JWT CLAIMS USED IN POLICIES:
--   auth.uid()               → JWT 'sub' claim = users.id (UUID)
--   auth.jwt() ->> 'role'    → JWT 'role' claim = 'rep'|'area_manager'|
--                              'regional_manager'|'admin'
--
-- Run order: 0001 → 0002 → 0003 → THIS FILE
-- ─────────────────────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1 — RLS Helper Functions
--
-- SECURITY DEFINER: run as the postgres superuser so they can read the
-- users and territories tables without being blocked by the very RLS
-- policies we are about to create.
-- ─────────────────────────────────────────────────────────────────────────────

-- Current user's role string from the JWT
create or replace function rls_current_role()
returns text
language sql
security definer
stable
parallel safe
as $$
  select coalesce(auth.jwt() ->> 'role', '')::text;
$$;

-- Convenience predicates — used throughout the policies below
create or replace function rls_is_admin()
returns boolean
language sql
security definer
stable
parallel safe
as $$
  select (auth.jwt() ->> 'role') = 'admin';
$$;

create or replace function rls_is_manager()
returns boolean
language sql
security definer
stable
parallel safe
as $$
  select (auth.jwt() ->> 'role') in ('area_manager', 'regional_manager', 'admin');
$$;

-- Returns true if the current user (auth.uid()) manages the given rep.
--
-- Logic by role:
--   admin            → manages everyone
--   regional_manager → manages everyone in practice (no region boundary in
--                       the current schema; add region column to territories
--                       and users if you need finer granularity)
--   area_manager     → manages reps whose territory.name matches a territory
--                       where territories.asm_id = auth.uid()
--   rep              → manages nobody
create or replace function rls_manages(target_user_id uuid)
returns boolean
language sql
security definer
stable
parallel safe
as $$
  select case (auth.jwt() ->> 'role')
    when 'admin'            then true
    when 'regional_manager' then true
    when 'area_manager'     then exists (
      select 1
      from   territories t
      join   users u on u.territory = t.name
      where  t.asm_id        = auth.uid()
        and  u.id            = target_user_id
        and  u.status        = 'active'
    )
    else false
  end;
$$;

comment on function rls_manages(uuid) is
  'Returns true if the current JWT user manages target_user_id. '
  'Used in RLS USING/WITH CHECK clauses. SECURITY DEFINER to bypass RLS on '
  'the users and territories tables during the check.';


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2 — Enable RLS on all 13 tables
-- ─────────────────────────────────────────────────────────────────────────────

alter table users              enable row level security;
alter table doctors            enable row level security;
alter table products           enable row level security;
alter table call_reports       enable row level security;
alter table chemists           enable row level security;
alter table chemist_visits     enable row level security;
alter table hospitals          enable row level security;
alter table hospital_visits    enable row level security;
alter table gps_audit          enable row level security;
alter table route_plans        enable row level security;
alter table expense_claims     enable row level security;
alter table leave_applications enable row level security;
alter table leave_balances     enable row level security;
alter table territories        enable row level security;
alter table targets            enable row level security;
alter table audit_log          enable row level security;
alter table system_config      enable row level security;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3 — Policies per table
--
-- Policy naming: {table}_{operation}_{subject}
--   subject = "own" (self only), "team" (managed users), "all" (admin)
--
-- Principle: DENY BY DEFAULT. Supabase denies any request that matches no
-- policy. Every policy below only GRANTS access; there are no explicit deny
-- policies needed.
-- ─────────────────────────────────────────────────────────────────────────────


-- ── users ────────────────────────────────────────────────────────────────────
-- Any authenticated user can read their own row.
-- Managers can read rows for users they manage (for team dashboards).
-- Only admin can read all rows and write to any row.
create policy "users_select_own"
  on users for select
  using (auth.uid() = id);

create policy "users_select_team"
  on users for select
  using (rls_manages(id));

create policy "users_update_own"
  on users for update
  using  (auth.uid() = id)
  with check (auth.uid() = id);

create policy "users_all_admin"
  on users for all
  using (rls_is_admin());


-- ── doctors ──────────────────────────────────────────────────────────────────
-- All authenticated users need to read doctors for call planning.
-- Creating/editing doctors is a manager action; only admin can delete.
create policy "doctors_select"
  on doctors for select
  using (auth.uid() is not null);

create policy "doctors_insert"
  on doctors for insert
  with check (rls_is_manager());

create policy "doctors_update"
  on doctors for update
  using (rls_is_manager());

create policy "doctors_delete"
  on doctors for delete
  using (rls_is_admin());


-- ── products ─────────────────────────────────────────────────────────────────
-- All authenticated users read; only admin writes (product catalogue is
-- maintained centrally by pharma HQ/admin, not by field reps).
create policy "products_select"
  on products for select
  using (auth.uid() is not null);

create policy "products_write"
  on products for all
  using (rls_is_admin());


-- ── call_reports ──────────────────────────────────────────────────────────────
-- Reps: create and read/update their own submitted reports.
-- Managers: read and approve/reject their team's reports.
-- Admin: full access.
create policy "call_reports_select"
  on call_reports for select
  using (
    rep_id = auth.uid()
    or rls_manages(rep_id)
  );

create policy "call_reports_insert"
  on call_reports for insert
  with check (rep_id = auth.uid());

create policy "call_reports_update"
  on call_reports for update
  using (
    rep_id = auth.uid()     -- rep can update their own (e.g. before submission)
    or rls_manages(rep_id)  -- manager can approve/reject
  );

create policy "call_reports_delete"
  on call_reports for delete
  using (rls_is_admin());


-- ── chemists ─────────────────────────────────────────────────────────────────
create policy "chemists_select"
  on chemists for select
  using (auth.uid() is not null);

create policy "chemists_write"
  on chemists for all
  using (rls_is_manager());


-- ── chemist_visits ───────────────────────────────────────────────────────────
create policy "chemist_visits_select"
  on chemist_visits for select
  using (rep_id = auth.uid() or rls_manages(rep_id));

create policy "chemist_visits_insert"
  on chemist_visits for insert
  with check (rep_id = auth.uid());

create policy "chemist_visits_update"
  on chemist_visits for update
  using (rep_id = auth.uid() or rls_manages(rep_id));

create policy "chemist_visits_delete"
  on chemist_visits for delete
  using (rls_is_admin());


-- ── hospitals ────────────────────────────────────────────────────────────────
create policy "hospitals_select"
  on hospitals for select
  using (auth.uid() is not null);

create policy "hospitals_write"
  on hospitals for all
  using (rls_is_manager());


-- ── hospital_visits ───────────────────────────────────────────────────────────
create policy "hospital_visits_select"
  on hospital_visits for select
  using (rep_id = auth.uid() or rls_manages(rep_id));

create policy "hospital_visits_insert"
  on hospital_visits for insert
  with check (rep_id = auth.uid());

create policy "hospital_visits_update"
  on hospital_visits for update
  using (rep_id = auth.uid() or rls_manages(rep_id));

create policy "hospital_visits_delete"
  on hospital_visits for delete
  using (rls_is_admin());


-- ── gps_audit ────────────────────────────────────────────────────────────────
-- GPS audit is a compliance record — reps and managers can read, no one
-- below admin can delete (immutable for compliance purposes).
create policy "gps_audit_select"
  on gps_audit for select
  using (rep_id = auth.uid() or rls_manages(rep_id));

create policy "gps_audit_insert"
  on gps_audit for insert
  with check (rep_id = auth.uid());

-- No UPDATE policy — GPS audit records must not be modified after creation.
-- Only admin can delete (for data correction under supervisor approval).
create policy "gps_audit_delete"
  on gps_audit for delete
  using (rls_is_admin());


-- ── route_plans ───────────────────────────────────────────────────────────────
create policy "route_plans_select"
  on route_plans for select
  using (rep_id = auth.uid() or rls_manages(rep_id));

create policy "route_plans_insert"
  on route_plans for insert
  with check (rep_id = auth.uid());

create policy "route_plans_update"
  on route_plans for update
  using (
    rep_id = auth.uid()
    or rls_manages(rep_id)
  );

create policy "route_plans_delete"
  on route_plans for delete
  using (
    rls_is_admin()
    or (rep_id = auth.uid() and status = 'draft')  -- rep can delete own drafts
  );


-- ── expense_claims ────────────────────────────────────────────────────────────
create policy "expense_claims_select"
  on expense_claims for select
  using (rep_id = auth.uid() or rls_manages(rep_id));

create policy "expense_claims_insert"
  on expense_claims for insert
  with check (rep_id = auth.uid());

create policy "expense_claims_update"
  on expense_claims for update
  using (
    rep_id = auth.uid()
    or rls_manages(rep_id)
  );

create policy "expense_claims_delete"
  on expense_claims for delete
  using (
    rls_is_admin()
    or (rep_id = auth.uid() and status in ('queued', 'submitted'))
  );


-- ── leave_applications ────────────────────────────────────────────────────────
create policy "leave_applications_select"
  on leave_applications for select
  using (rep_id = auth.uid() or rls_manages(rep_id));

create policy "leave_applications_insert"
  on leave_applications for insert
  with check (rep_id = auth.uid());

create policy "leave_applications_update"
  on leave_applications for update
  using (
    rep_id = auth.uid()
    or rls_manages(rep_id)
  );

create policy "leave_applications_delete"
  on leave_applications for delete
  using (rls_is_admin());


-- ── leave_balances ────────────────────────────────────────────────────────────
-- Reps see their own balance; managers see their team's.
-- Only managers and admin can write (balance adjustments are manager actions).
create policy "leave_balances_select"
  on leave_balances for select
  using (user_id = auth.uid() or rls_manages(user_id));

create policy "leave_balances_write"
  on leave_balances for all
  using (rls_is_manager())
  with check (rls_is_manager());


-- ── territories ───────────────────────────────────────────────────────────────
-- All authenticated users need territory data for assignment and mapping.
-- Only admin can modify the territory list.
create policy "territories_select"
  on territories for select
  using (auth.uid() is not null);

create policy "territories_write"
  on territories for all
  using (rls_is_admin());


-- ── targets ───────────────────────────────────────────────────────────────────
-- Reps see their own targets; managers see all targets for their team.
-- Target setting is a manager action (not done by reps).
create policy "targets_select"
  on targets for select
  using (rep_id = auth.uid() or rls_manages(rep_id));

create policy "targets_write"
  on targets for all
  using (rls_is_manager())
  with check (rls_is_manager());


-- ── audit_log ────────────────────────────────────────────────────────────────
-- Append-only: INSERT is allowed for authenticated users (the backend writes
-- to this table via service role, but we also permit direct inserts for
-- defense-in-depth). UPDATE and DELETE have no policies — blocked by default.
-- Users can read their own entries; managers can read their team's; admin all.
create policy "audit_log_select_own"
  on audit_log for select
  using (actor_id = auth.uid());

create policy "audit_log_select_team"
  on audit_log for select
  using (rls_manages(actor_id));

create policy "audit_log_insert"
  on audit_log for insert
  with check (auth.uid() is not null);

-- No UPDATE policy: audit log is immutable.
-- No DELETE policy: only service-role / direct psql can delete (for compliance
-- data retention management).


-- ── system_config ─────────────────────────────────────────────────────────────
-- All authenticated users can read (the frontend needs geofence radius,
-- approval settings, etc.).
-- Only admin can write configuration.
create policy "system_config_select"
  on system_config for select
  using (auth.uid() is not null);

create policy "system_config_write"
  on system_config for all
  using (rls_is_admin())
  with check (rls_is_admin());


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4 — Verification Queries
-- Run these after applying the migration to confirm RLS is active.
-- ─────────────────────────────────────────────────────────────────────────────

/*
-- 1. Confirm RLS is enabled on all tables
select
  schemaname,
  tablename,
  rowsecurity  as rls_enabled,
  forcerowonerls
from pg_tables
where schemaname = 'public'
  and tablename in (
    'users','doctors','products','call_reports','chemists','chemist_visits',
    'hospitals','hospital_visits','gps_audit','route_plans','expense_claims',
    'leave_applications','leave_balances','territories','targets',
    'audit_log','system_config'
  )
order by tablename;
-- Expected: rowsecurity = true for all 17 rows

-- 2. Count policies per table
select
  tablename,
  count(*) as policy_count
from pg_policies
where schemaname = 'public'
group by tablename
order by tablename;

-- 3. Test as a rep (replace UUID with a real rep user_id):
-- set role authenticated;
-- set request.jwt.claims = '{"sub":"<rep-uuid>","role":"rep"}';
-- select count(*) from call_reports;  -- should return only their own records
-- select count(*) from users;          -- should return only their own row

-- 4. Confirm helper functions exist
select proname, prosecdef
from pg_proc
where proname in ('rls_current_role','rls_is_admin','rls_is_manager','rls_manages');
-- Expected: 4 rows, all with prosecdef = true (SECURITY DEFINER)
*/


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5 — Rollback Script
-- Uncomment and run to reverse this migration if needed.
-- Running 0003's schema changes does NOT need to be rolled back before this.
-- ─────────────────────────────────────────────────────────────────────────────

/*
-- Drop all policies
do $$
declare
  r record;
begin
  for r in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
  loop
    execute format('drop policy if exists %I on %I', r.policyname, r.tablename);
  end loop;
end
$$;

-- Drop helper functions
drop function if exists rls_current_role();
drop function if exists rls_is_admin();
drop function if exists rls_is_manager();
drop function if exists rls_manages(uuid);

-- Disable RLS on all tables
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
*/
