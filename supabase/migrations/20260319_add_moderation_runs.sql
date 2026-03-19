create extension if not exists pgcrypto;

create table if not exists posts (
  id text primary key,
  content text not null,
  emotion_tags text[] not null default '{}',
  device_fingerprint_hash text not null,
  status text not null check (status in ('APPROVED', 'REJECTED', 'CRISIS', 'MANUAL_REVIEW')),
  moderation_path text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists moderation_runs (
  id uuid primary key default gen_random_uuid(),
  post_id text not null references posts(id) on delete cascade,
  provider text not null,
  model text,
  attempt_order integer not null,
  decision text not null,
  confidence numeric,
  reason_code text,
  latency_ms integer not null,
  error_code text,
  raw_response_redacted jsonb not null default '{}'::jsonb,
  trace_id text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists posts_status_created_at_idx on posts (status, created_at desc);
create index if not exists moderation_runs_post_id_idx on moderation_runs (post_id);
create index if not exists moderation_runs_provider_idx on moderation_runs (provider);
create index if not exists moderation_runs_created_at_idx on moderation_runs (created_at desc);
