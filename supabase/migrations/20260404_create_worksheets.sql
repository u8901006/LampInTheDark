-- Emergency Plans
create table public.emergency_plans (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references public.profiles(id) on delete cascade,
  friend_name text not null default '',
  friend_phone text not null default '',
  friend_available_hours text not null default '',
  friend_email text not null default '',
  therapist_name text not null default '',
  therapist_phone text not null default '',
  therapist_available_hours text not null default '',
  therapist_email text not null default '',
  substitute_therapist_name text not null default '',
  substitute_therapist_phone text not null default '',
  substitute_therapist_available_hours text not null default '',
  substitute_therapist_email text not null default '',
  emergency_service_name text not null default '',
  emergency_service_phone text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Life Timelines
create table public.life_timelines (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Life Timeline Events
create table public.life_timeline_events (
  id uuid primary key default gen_random_uuid(),
  timeline_id uuid not null references public.life_timelines(id) on delete cascade,
  age integer not null,
  score integer not null check (score >= -100 and score <= 100),
  description text not null default '',
  created_at timestamptz not null default now()
);

create index idx_life_timeline_events_timeline_id on public.life_timeline_events(timeline_id);

-- Sleep Diaries
create table public.sleep_diaries (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  entry_date date not null,
  bedtime time,
  wakeup_time time,
  sleep_quality text check (sleep_quality in ('awake', 'dozing', 'asleep', 'nightmare')),
  major_night_events text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, entry_date)
);

create index idx_sleep_diaries_client_id on public.sleep_diaries(client_id);
create index idx_sleep_diaries_entry_date on public.sleep_diaries(entry_date);

-- Enable RLS
alter table public.emergency_plans enable row level security;
alter table public.life_timelines enable row level security;
alter table public.life_timeline_events enable row level security;
alter table public.sleep_diaries enable row level security;

-- Emergency Plans policies
create policy "Clients full CRUD own emergency plan"
  on public.emergency_plans for all
  using (client_id = auth.uid())
  with check (client_id = auth.uid());

create policy "Therapists read emergency plans"
  on public.emergency_plans for select
  using (public.is_therapist());

-- Life Timelines policies
create policy "Clients full CRUD own life timeline"
  on public.life_timelines for all
  using (client_id = auth.uid())
  with check (client_id = auth.uid());

create policy "Therapists read life timelines"
  on public.life_timelines for select
  using (public.is_therapist());

-- Life Timeline Events policies
create policy "Clients full CRUD own timeline events"
  on public.life_timeline_events for all
  using (
    exists (
      select 1 from public.life_timelines
      where life_timelines.id = life_timeline_events.timeline_id
        and life_timelines.client_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.life_timelines
      where life_timelines.id = life_timeline_events.timeline_id
        and life_timelines.client_id = auth.uid()
    )
  );

create policy "Therapists read timeline events"
  on public.life_timeline_events for select
  using (
    exists (
      select 1 from public.life_timelines
      where life_timelines.id = life_timeline_events.timeline_id
        and public.is_therapist()
    )
  );

-- Sleep Diaries policies
create policy "Clients full CRUD own sleep diaries"
  on public.sleep_diaries for all
  using (client_id = auth.uid())
  with check (client_id = auth.uid());

create policy "Therapists read sleep diaries"
  on public.sleep_diaries for select
  using (public.is_therapist());

-- Updated-at triggers
create trigger set_updated_at
  before update on public.emergency_plans
  for each row execute function public.update_updated_at();

create trigger set_updated_at
  before update on public.life_timelines
  for each row execute function public.update_updated_at();

create trigger set_updated_at
  before update on public.sleep_diaries
  for each row execute function public.update_updated_at();
