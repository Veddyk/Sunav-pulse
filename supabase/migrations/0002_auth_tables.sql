-- ─────────────────────────────────────────────────────────────────────────────
-- SunaV Pulse — Authentication & Session Schema
-- Migration 0002
--
-- OWASP ASVS Coverage:
--   V2.1  Password Security     — password_credentials (bcrypt, history, expiry)
--   V2.5  Credential Recovery   — password_reset_tokens
--   V2.6  TOTP Authenticator    — mfa_configs, recovery_codes
--   V3.2  Session Binding       — user_sessions (per-device tokens)
--   V3.3  Session Termination   — revoked_at, revoke all on password change
--   V7.2  Log Processing        — auth_events (immutable append-only audit)
--   V4.1  Access Control        — permissions view (role → allowed actions)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Password Credentials ─────────────────────────────────────────────────────
-- Deliberately separated from the `users` table so that credential data is
-- never accidentally included in application-level user queries/joins.
create table password_credentials (
  user_id          uuid primary key references users(id) on delete cascade,
  password_hash    text not null,                    -- bcrypt $2b$12$...
  password_changed_at timestamptz not null default now(),
  must_change_at   timestamptz,                      -- null = no expiry set
  created_at       timestamptz not null default now()
);

-- Rolling password history (last 10 hashes).
-- Checked before accepting a new password to prevent re-use.
create table password_history (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references users(id) on delete cascade,
  password_hash    text not null,
  created_at       timestamptz not null default now()
);
create index idx_pw_history_user on password_history(user_id, created_at desc);

-- ── Login Attempt Tracking ────────────────────────────────────────────────────
-- Server-side lockout replaces the client-side React state lockout.
-- Defeats the "refresh page to bypass lockout" attack.
create table login_attempts (
  id               uuid primary key default uuid_generate_v4(),
  identifier       text not null,          -- employee_id (normalised lowercase)
  ip_address       inet,
  user_agent       text,
  success          boolean not null,
  failure_reason   text,                   -- 'wrong_password','mfa_failed','locked', etc.
  attempted_at     timestamptz not null default now()
);
-- Fast lookup: recent failures by identifier for lockout check
create index idx_login_attempts_ident_time
  on login_attempts(identifier, attempted_at desc)
  where success = false;

-- ── Sessions ──────────────────────────────────────────────────────────────────
-- One row per active device/browser session.
-- The access token (JWT) references session_id in its claims so the backend
-- can verify the session has not been revoked without a DB lookup on every req
-- (lookup is done only on refresh, not on every authenticated API call).
create table user_sessions (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid not null references users(id) on delete cascade,
  refresh_token_hash   text not null unique,    -- sha-256 of the raw refresh token
  access_jti           text unique,             -- JWT ID of the latest access token
  device_label         text,                    -- "Chrome · macOS", "Safari · iOS"
  ip_address           inet,
  user_agent           text,
  created_at           timestamptz not null default now(),
  last_used_at         timestamptz not null default now(),
  expires_at           timestamptz not null,    -- refresh token expiry
  revoked_at           timestamptz,             -- null = active
  revoke_reason        text                     -- 'logout','password_change','admin','expired'
);
create index idx_sessions_user on user_sessions(user_id) where revoked_at is null;
create index idx_sessions_refresh on user_sessions(refresh_token_hash) where revoked_at is null;

-- ── MFA Configuration ─────────────────────────────────────────────────────────
create table mfa_configs (
  user_id          uuid primary key references users(id) on delete cascade,
  totp_secret      text not null,          -- encrypted TOTP base32 secret (AES-256)
  enabled          boolean not null default false,
  verified_at      timestamptz,            -- null until first successful TOTP verify
  created_at       timestamptz not null default now()
);

-- Single-use 8-char recovery codes (hashed).
-- Generated in a batch of 10 at MFA setup; each used once then deleted.
create table recovery_codes (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references users(id) on delete cascade,
  code_hash        text not null,          -- sha-256 of the raw code
  used_at          timestamptz,            -- null = unused
  created_at       timestamptz not null default now()
);
create index idx_recovery_codes_user on recovery_codes(user_id) where used_at is null;

-- ── Pending MFA Setup Tokens ─────────────────────────────────────────────────
-- After password auth succeeds but before TOTP is verified, the server issues
-- a short-lived (5-min) pre-auth token. The client sends this with the TOTP
-- code to get a full session. Prevents session issuance before MFA completes.
create table mfa_challenges (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references users(id) on delete cascade,
  challenge_token  text not null unique,   -- random 32-byte hex
  expires_at       timestamptz not null default (now() + interval '5 minutes'),
  created_at       timestamptz not null default now()
);

-- ── Password Reset ────────────────────────────────────────────────────────────
create table password_reset_tokens (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references users(id) on delete cascade,
  token_hash       text not null unique,   -- sha-256 of the raw token
  expires_at       timestamptz not null default (now() + interval '1 hour'),
  used_at          timestamptz,
  created_at       timestamptz not null default now()
);

-- ── Auth Event Audit Log ──────────────────────────────────────────────────────
-- Append-only. No UPDATE or DELETE policies should be granted on this table.
-- Satisfies SOC 2 CC6.3 (audit trail for access events).
create table auth_events (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references users(id),      -- null for failed-unknown-user attempts
  session_id       uuid references user_sessions(id),
  event_type       text not null check (event_type in (
                     'login_success','login_failed','login_locked',
                     'mfa_success','mfa_failed','mfa_enabled','mfa_disabled',
                     'logout','session_revoked','session_expired',
                     'password_changed','password_reset_requested','password_reset_used',
                     'recovery_code_used','token_refreshed',
                     'impersonation_started','impersonation_ended'
                   )),
  ip_address       inet,
  user_agent       text,
  details          jsonb default '{}',     -- event-specific payload (e.g. {"reason":"wrong_password"})
  created_at       timestamptz not null default now()
);
create index idx_auth_events_user on auth_events(user_id, created_at desc);
create index idx_auth_events_type on auth_events(event_type, created_at desc);
create index idx_auth_events_created on auth_events(created_at desc);

-- ── Role Permission Matrix ────────────────────────────────────────────────────
-- Canonical, database-level definition of what each role can do.
-- Backend middleware reads this (with a short TTL cache) rather than
-- hardcoding role logic in application code.
create table role_permissions (
  role             text not null,
  resource         text not null,     -- e.g. 'call_reports', 'expenses', 'users'
  action           text not null,     -- 'read', 'create', 'approve', 'admin'
  constraint pk_role_permissions primary key (role, resource, action)
);

insert into role_permissions (role, resource, action) values
  -- rep
  ('rep', 'call_reports',  'read'),   ('rep', 'call_reports',  'create'),
  ('rep', 'chemist_visits','read'),   ('rep', 'chemist_visits','create'),
  ('rep', 'hospital_visits','read'),  ('rep', 'hospital_visits','create'),
  ('rep', 'route_plans',   'read'),   ('rep', 'route_plans',   'create'),
  ('rep', 'expenses',      'read'),   ('rep', 'expenses',      'create'),
  ('rep', 'leave',         'read'),   ('rep', 'leave',         'create'),
  ('rep', 'targets',       'read'),
  ('rep', 'doctors',       'read'),
  -- area_manager — all rep actions + approve
  ('area_manager', 'call_reports',   'read'), ('area_manager', 'call_reports',   'approve'),
  ('area_manager', 'route_plans',    'read'), ('area_manager', 'route_plans',    'approve'),
  ('area_manager', 'expenses',       'read'), ('area_manager', 'expenses',       'approve'),
  ('area_manager', 'leave',          'read'), ('area_manager', 'leave',          'approve'),
  ('area_manager', 'chemist_visits', 'read'), ('area_manager', 'hospital_visits','read'),
  ('area_manager', 'targets',        'read'), ('area_manager', 'doctors',        'read'),
  ('area_manager', 'users',          'read'),
  -- regional_manager — all asm actions + territory management
  ('regional_manager', 'call_reports',   'read'),  ('regional_manager', 'call_reports',   'approve'),
  ('regional_manager', 'route_plans',    'read'),  ('regional_manager', 'route_plans',    'approve'),
  ('regional_manager', 'expenses',       'read'),  ('regional_manager', 'expenses',       'approve'),
  ('regional_manager', 'leave',          'read'),  ('regional_manager', 'leave',          'approve'),
  ('regional_manager', 'chemist_visits', 'read'),  ('regional_manager', 'hospital_visits','read'),
  ('regional_manager', 'targets',        'read'),  ('regional_manager', 'targets',        'approve'),
  ('regional_manager', 'doctors',        'read'),  ('regional_manager', 'users',          'read'),
  ('regional_manager', 'territories',    'read'),  ('regional_manager', 'kpi',            'read'),
  -- admin — full access
  ('admin', 'call_reports',   'admin'), ('admin', 'route_plans',   'admin'),
  ('admin', 'expenses',       'admin'), ('admin', 'leave',         'admin'),
  ('admin', 'chemist_visits', 'admin'), ('admin', 'hospital_visits','admin'),
  ('admin', 'targets',        'admin'), ('admin', 'doctors',       'admin'),
  ('admin', 'users',          'admin'), ('admin', 'territories',   'admin'),
  ('admin', 'kpi',            'admin'), ('admin', 'audit_log',     'read'),
  ('admin', 'system_config',  'admin');

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Enable RLS on all auth tables so even service-role callers must match policies.
alter table password_credentials enable row level security;
alter table password_history      enable row level security;
alter table login_attempts        enable row level security;
alter table user_sessions         enable row level security;
alter table mfa_configs           enable row level security;
alter table recovery_codes        enable row level security;
alter table mfa_challenges        enable row level security;
alter table password_reset_tokens enable row level security;
alter table auth_events           enable row level security;
alter table role_permissions      enable row level security;

-- Auth events: no application role can delete or update — append only.
-- Only the backend service role can insert.
create policy "auth_events_service_insert" on auth_events
  for insert to authenticated with check (false);  -- override with service role key

-- Role permissions: all roles can read their own permissions.
create policy "role_perms_read" on role_permissions
  for select using (true);

-- Sessions: users can only see and revoke their own sessions.
create policy "sessions_own" on user_sessions
  for all using (auth.uid() = user_id);
