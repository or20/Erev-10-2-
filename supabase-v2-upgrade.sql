-- Erev 10 upgrade helpers
-- Run in Supabase SQL editor only if these tables/columns do not already exist.

create table if not exists app_versions (
  id bigint generated always as identity primary key,
  app text not null unique,
  latest_version text not null default '1.0.0',
  min_supported_version text not null default '1.0.0',
  force_update boolean not null default false,
  title text not null default 'גרסה חדשה זמינה',
  message text not null default 'יש עדכון חדש למערכת.',
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into app_versions (app, latest_version, min_supported_version, force_update, title, message)
values
('client','1.0.0','1.0.0',false,'גרסה חדשה זמינה','שיפור ביצועים ותיקוני מערכת'),
('manager','1.0.0','1.0.0',false,'גרסה חדשה זמינה','שיפור מסך המנהל'),
('courier','1.0.0','1.0.0',false,'גרסה חדשה זמינה','שיפור מסך השליח'),
('bakery','1.0.0','1.0.0',false,'גרסה חדשה זמינה','שיפור מסך המאפייה')
on conflict (app) do nothing;

create table if not exists audit_logs (
  id bigint generated always as identity primary key,
  app text,
  actor text,
  action text not null,
  customer_id bigint,
  details jsonb,
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id bigint generated always as identity primary key,
  app text not null,
  customer_id bigint,
  title text not null,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists delivery_proofs (
  id bigint generated always as identity primary key,
  customer_id bigint,
  courier_name text,
  delivery_status text,
  address text,
  photo_url text,
  delivered_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Existing customers table optional helper columns
alter table customers add column if not exists delivery_status text;
alter table customers add column if not exists delivery_problem_reason text;
alter table customers add column if not exists delivery_problem_note text;
alter table customers add column if not exists delivery_problem_time text;
