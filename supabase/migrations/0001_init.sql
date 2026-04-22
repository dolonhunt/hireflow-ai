create extension if not exists "pgcrypto";

create table if not exists workspace_state (
  id text primary key,
  state jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  location text,
  timezone text default 'Asia/Dhaka',
  created_at timestamptz not null default now()
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text not null,
  role_family text not null,
  location text not null,
  salary_min integer,
  salary_max integer,
  required_skills text[] not null default '{}',
  required_languages text[] not null default '{}',
  experience_min_years integer not null default 0,
  summary text not null,
  requires_portfolio boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists job_watchlists (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  title text not null,
  source text not null,
  query text not null,
  location text,
  keywords text[] not null default '{}',
  skill_cluster text[] not null default '{}',
  active boolean not null default true,
  last_run_at timestamptz
);

create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  headline text not null,
  current_company text,
  current_role text,
  location text not null,
  role_family text not null,
  summary text not null,
  years_experience integer not null default 0,
  expected_salary integer,
  languages text[] not null default '{}',
  skills text[] not null default '{}',
  portfolio_urls text[] not null default '{}',
  last_active_at timestamptz not null default now(),
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists candidate_contacts (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  type text not null,
  value text not null,
  provenance text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists candidate_sources (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  source_type text not null,
  import_method text not null,
  url text,
  confidence numeric(4,2) not null default 0.5,
  collected_at timestamptz not null default now()
);

create table if not exists candidate_documents (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  file_name text not null,
  file_type text not null,
  file_size bigint not null,
  storage_path text not null,
  extracted_text text not null,
  hash text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists candidate_job_matches (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  score integer not null,
  score_breakdown jsonb not null,
  recommended_next_action text not null,
  status text not null default 'new',
  reviewed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (candidate_id, job_id)
);

create table if not exists pipeline_entries (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  stage text not null,
  updated_at timestamptz not null default now(),
  unique (candidate_id, job_id)
);

create table if not exists outreach_templates (
  id text primary key,
  name text not null,
  channel text not null,
  language text not null,
  subject text,
  body text not null
);

create table if not exists outreach_events (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  job_id uuid references jobs(id) on delete set null,
  channel text not null,
  template_id text not null references outreach_templates(id),
  rendered_subject text,
  rendered_body text not null,
  sent_at timestamptz,
  reply_state text not null default 'draft',
  next_follow_up_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  job_id uuid references jobs(id) on delete set null,
  type text not null,
  title text not null,
  due_at timestamptz not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists activity_events (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists import_batches (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  file_name text,
  imported_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- Job aggregation table for fetching jobs from Bangladesh job boards
create table if not exists aggregated_jobs (
  id text primary key,
  source text not null,
  source_url text,
  title text not null,
  company text,
  location text,
  job_type text,
  salary text,
  deadline text,
  description text,
  requirements text[],
  posted_at timestamptz,
  fetched_at timestamptz not null default now()
);

-- Index for faster queries on aggregated_jobs
create index if not exists idx_aggregated_jobs_source on aggregated_jobs(source);
create index if not exists idx_aggregated_jobs_fetched_at on aggregated_jobs(fetched_at desc);

-- Notifications table for user notifications
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null,
  title text not null,
  message text not null,
  read boolean not null default false,
  data jsonb,
  created_at timestamptz not null default now()
);

-- Index for notifications
create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_notifications_created_at on notifications(created_at desc);
