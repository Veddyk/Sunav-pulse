-- ─────────────────────────────────────────────────────────────────
-- SunaV Pulse — Initial Database Schema
--
-- HONEST STATUS: this schema is NOT currently connected to anything.
-- The live app (src/App.jsx) keeps all data in React state. This
-- migration exists so a real backend can be built against a schema
-- that actually matches the data shapes already proven out in the
-- demo, instead of starting from a blank slate.
--
-- Run this in the Supabase SQL Editor, or via the Supabase CLI:
--   supabase db push
-- ─────────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";

-- ── Users / Directory ──────────────────────────────────────────────
create table users (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  email           text not null unique,
  role            text not null check (role in ('rep','area_manager','regional_manager','admin')),
  territory       text,
  employee_id     text unique,
  status          text not null default 'active' check (status in ('active','inactive')),
  joined_date     date default current_date,
  last_login      timestamptz,
  created_at      timestamptz default now()
);

-- ── Doctors ────────────────────────────────────────────────────────
create table doctors (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  specialization  text,
  hospital        text,
  tier            text check (tier in ('A','B','C')),
  engagement_score int default 0,
  lat             double precision,
  lng             double precision,
  created_at      timestamptz default now()
);

-- ── Products ───────────────────────────────────────────────────────
create table products (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  category        text,
  composition     text,
  created_at      timestamptz default now()
);

-- ── Call Reports (with GPS verification fields) ──────────────────────
create table call_reports (
  id                uuid primary key default uuid_generate_v4(),
  doctor_id         uuid references doctors(id),
  rep_id            uuid references users(id),
  visit_date        date not null,
  visit_time        time,
  duration_minutes  int,
  products_detailed jsonb default '[]',
  samples_given     jsonb default '[]',
  next_action       text,
  notes             text,
  status            text not null default 'submitted'
                      check (status in ('queued','submitted','approved','rejected')),
  approver_id       uuid references users(id),
  approved_at       timestamptz,
  rejection_reason  text,
  -- GPS verification
  gps_lat           double precision,
  gps_lng           double precision,
  gps_accuracy_m    int,
  gps_distance_m    int,
  gps_status        text check (gps_status in ('verified','override')),
  gps_override_reason text,
  created_at        timestamptz default now()
);

-- ── Chemists & Visits ──────────────────────────────────────────────
create table chemists (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  owner_name      text,
  phone           text,
  address         text,
  lat             double precision,
  lng             double precision,
  tier            text check (tier in ('A','B','C')),
  created_at      timestamptz default now()
);

create table chemist_visits (
  id              uuid primary key default uuid_generate_v4(),
  chemist_id      uuid references chemists(id),
  rep_id          uuid references users(id),
  visit_date      date not null,
  purpose         text,
  order_collected jsonb default '{}',
  order_value     numeric(12,2) default 0,
  competitor_notes text,
  status          text not null default 'submitted'
                    check (status in ('queued','submitted','approved','rejected')),
  approver_id     uuid references users(id),
  approved_at     timestamptz,
  created_at      timestamptz default now()
);

-- ── Hospitals & Visits ─────────────────────────────────────────────
create table hospitals (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  type            text check (type in ('Government','Private','Teaching')),
  beds            int,
  address         text,
  lat             double precision,
  lng             double precision,
  tier            text check (tier in ('A','B','C')),
  created_at      timestamptz default now()
);

create table hospital_visits (
  id              uuid primary key default uuid_generate_v4(),
  hospital_id     uuid references hospitals(id),
  rep_id          uuid references users(id),
  contact_met     text,
  visit_type      text,
  products        jsonb default '[]',
  qty_requested   jsonb default '{}',
  supply_value    numeric(12,2) default 0,
  status          text not null default 'submitted'
                    check (status in ('queued','submitted','approved','rejected')),
  created_at      timestamptz default now()
);

-- ── GPS Audit Trail ────────────────────────────────────────────────
create table gps_audit (
  id              uuid primary key default uuid_generate_v4(),
  rep_id          uuid references users(id),
  visit_type      text check (visit_type in ('Doctor','Chemist','Hospital')),
  target_name     text,
  target_lat      double precision,
  target_lng      double precision,
  actual_lat      double precision,
  actual_lng      double precision,
  distance_m      int,
  accuracy_m      int,
  status          text check (status in ('verified','override')),
  override_reason text,
  call_report_id  uuid,
  created_at      timestamptz default now()
);

-- ── Route Plans (two-stage RSM → ASM approval) ────────────────────
create table route_plans (
  id                uuid primary key default uuid_generate_v4(),
  rep_id            uuid references users(id),
  title             text not null,
  territory         text,
  plan_date         date,
  estimated_km      numeric(6,1),
  stops             jsonb default '[]',
  status            text not null default 'draft'
                       check (status in ('draft','submitted','rsm_approved','asm_approved','rsm_rejected','asm_rejected')),
  rsm_approved_by   uuid references users(id),
  rsm_approved_at   timestamptz,
  rsm_note          text,
  asm_approved_by   uuid references users(id),
  asm_approved_at   timestamptz,
  asm_note          text,
  created_at        timestamptz default now()
);

-- ── Expense Claims ─────────────────────────────────────────────────
create table expense_claims (
  id              uuid primary key default uuid_generate_v4(),
  rep_id          uuid references users(id),
  claim_date      date not null,
  items           jsonb default '[]',
  total_amount    numeric(12,2) not null default 0,
  status          text not null default 'submitted'
                    check (status in ('queued','submitted','approved','rejected')),
  approver_id     uuid references users(id),
  approved_at     timestamptz,
  rejection_reason text,
  created_at      timestamptz default now()
);

-- ── Leave Applications & Balances ──────────────────────────────────
create table leave_applications (
  id              uuid primary key default uuid_generate_v4(),
  rep_id          uuid references users(id),
  leave_type      text not null check (leave_type in ('CL','SL','EL','CO')),
  from_date       date not null,
  to_date         date not null,
  days            numeric(4,1) not null,
  reason          text,
  status          text not null default 'pending'
                    check (status in ('pending','approved','rejected')),
  approver_id     uuid references users(id),
  approved_at     timestamptz,
  rejection_reason text,
  created_at      timestamptz default now()
);

create table leave_balances (
  user_id         uuid references users(id),
  leave_type      text not null check (leave_type in ('CL','SL','EL','CO')),
  total_days      numeric(4,1) not null,
  used_days       numeric(4,1) not null default 0,
  primary key (user_id, leave_type)
);

-- ── Territories & Targets ──────────────────────────────────────────
create table territories (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  region          text,
  area_group      text,
  asm_id          uuid references users(id),
  lat             double precision,
  lng             double precision,
  created_at      timestamptz default now()
);

create table targets (
  id              uuid primary key default uuid_generate_v4(),
  rep_id          uuid references users(id),
  product_id      uuid references products(id),
  period_month    date not null,                 -- store as first-of-month
  call_target     int,
  call_actual     int default 0,
  revenue_target  numeric(12,2),
  revenue_actual  numeric(12,2) default 0,
  created_at      timestamptz default now()
);

-- ── Audit Log ──────────────────────────────────────────────────────
create table audit_log (
  id              uuid primary key default uuid_generate_v4(),
  actor_id        uuid references users(id),
  actor_name      text,
  actor_role      text,
  category        text check (category in ('Auth','Approval','GPS','Data','Admin','System')),
  severity        text check (severity in ('info','warning','critical')),
  action          text not null,
  details         text,
  created_at      timestamptz default now()
);

-- ── System Configuration (single-row key/value-ish settings) ──────
create table system_config (
  id                              int primary key default 1,
  geofence_radius_m               int default 100,
  auto_checkout_minutes           int default 30,
  offline_sync_interval_minutes   int default 15,
  require_gps_for_call_report     boolean default true,
  staged_route_approval           boolean default true,
  auto_escalate_days              int default 3,
  leave_reset_policy              text default 'calendar_year',
  email_digest                    boolean default true,
  sms_alerts                      boolean default false,
  push_notifications              boolean default true,
  session_timeout_minutes         int default 60,
  password_expiry_days            int default 90,
  require_2fa                     boolean default false,
  constraint single_row check (id = 1)
);
insert into system_config (id) values (1);

-- ── Indexes for common query patterns ──────────────────────────────
create index idx_call_reports_rep on call_reports(rep_id);
create index idx_call_reports_status on call_reports(status);
create index idx_route_plans_status on route_plans(status);
create index idx_expense_claims_rep on expense_claims(rep_id);
create index idx_leave_applications_rep on leave_applications(rep_id);
create index idx_gps_audit_rep on gps_audit(rep_id);
create index idx_audit_log_created on audit_log(created_at desc);
create index idx_targets_rep_period on targets(rep_id, period_month);

-- ─────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY — IMPORTANT
-- Supabase exposes tables via its auto-generated API by default.
-- Before this schema touches real data, enable RLS on every table
-- and write policies matching your real auth model (e.g. reps can
-- only read/write their own rows; managers can read their team's).
-- This is intentionally left as a TODO — policies depend on how you
-- implement real authentication (see backend/.env.example JWT_SECRET).
--
--   alter table call_reports enable row level security;
--   create policy "reps see own call reports" on call_reports
--     for select using (rep_id = auth.uid());
--
-- Repeat per table before going live. Do not skip this step.
-- ─────────────────────────────────────────────────────────────────
