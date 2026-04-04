-- ============================================================
-- Diary Card tables migration
-- ============================================================

-- -----------------------------------------------------------
-- Helper: updated_at trigger function
-- -----------------------------------------------------------
create function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------
-- Helper: is_therapist() check
-- -----------------------------------------------------------
create function public.is_therapist()
returns boolean
language sql
security definer stable
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'therapist'
  );
$$;

-- -----------------------------------------------------------
-- 1. diary_cards (weekly diary card header)
-- -----------------------------------------------------------
create table public.diary_cards (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,
  week_end date not null,
  medications text not null default '',
  weekly_most_positive text not null default '',
  weekly_most_negative text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint diary_cards_client_week unique (client_id, week_start)
);

create index idx_diary_cards_client_id on public.diary_cards (client_id);
create index idx_diary_cards_week_start on public.diary_cards (week_start);

alter table public.diary_cards enable row level security;

create policy "Clients CRUD own diary cards"
  on public.diary_cards for all
  using (auth.uid() = client_id)
  with check (auth.uid() = client_id);

create policy "Therapists read diary cards"
  on public.diary_cards for select
  using (public.is_therapist());

create trigger diary_cards_updated_at
  before update on public.diary_cards
  for each row execute function public.update_updated_at();

-- -----------------------------------------------------------
-- 2. diary_card_daily_entries (daily detail within weekly card)
-- -----------------------------------------------------------
create table public.diary_card_daily_entries (
  id uuid primary key default gen_random_uuid(),
  diary_card_id uuid not null references public.diary_cards(id) on delete cascade,
  day_of_week smallint not null check (day_of_week >= 0 and day_of_week <= 6),
  positive_events text default '',
  unpleasant_events text default '',
  treatment_commitment smallint check (treatment_commitment >= 0 and treatment_commitment <= 5),
  self_compassion smallint check (self_compassion >= 0 and self_compassion <= 5),
  pain smallint check (pain >= 0 and pain <= 5),
  sleep smallint check (sleep >= 0 and sleep <= 5),
  dissociation smallint check (dissociation >= 0 and dissociation <= 5),
  trauma_intrusion_frequency smallint check (trauma_intrusion_frequency >= 0),
  trauma_intrusion_max_intensity smallint check (trauma_intrusion_max_intensity >= 0 and trauma_intrusion_max_intensity <= 5),
  suicidal_ideation smallint check (suicidal_ideation >= 0 and suicidal_ideation <= 5),
  skills_used smallint check (skills_used >= 0 and skills_used <= 5),
  physical_exercise smallint check (physical_exercise >= 0 and physical_exercise <= 6),
  pleasant_activities smallint check (pleasant_activities >= 0 and pleasant_activities <= 5),
  therapy_homework_done boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint diary_card_daily_entries_card_day unique (diary_card_id, day_of_week)
);

alter table public.diary_card_daily_entries enable row level security;

create policy "Clients CRUD own daily entries"
  on public.diary_card_daily_entries for all
  using (
    exists (
      select 1 from public.diary_cards dc
      where dc.id = diary_card_id and dc.client_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.diary_cards dc
      where dc.id = diary_card_id and dc.client_id = auth.uid()
    )
  );

create policy "Therapists read daily entries"
  on public.diary_card_daily_entries for select
  using (
    exists (
      select 1 from public.diary_cards dc
      where dc.id = diary_card_id and public.is_therapist()
    )
  );

create trigger diary_card_daily_entries_updated_at
  before update on public.diary_card_daily_entries
  for each row execute function public.update_updated_at();

-- -----------------------------------------------------------
-- 3. diary_card_new_paths
-- -----------------------------------------------------------
create table public.diary_card_new_paths (
  id uuid primary key default gen_random_uuid(),
  diary_card_id uuid not null references public.diary_cards(id) on delete cascade,
  path_number smallint not null check (path_number >= 1 and path_number <= 2),
  description text default '',
  thought_about boolean,
  practiced smallint check (practiced >= 0 and practiced <= 5),
  constraint diary_card_new_paths_card_number unique (diary_card_id, path_number)
);

alter table public.diary_card_new_paths enable row level security;

create policy "Clients CRUD own new paths"
  on public.diary_card_new_paths for all
  using (
    exists (
      select 1 from public.diary_cards dc
      where dc.id = diary_card_id and dc.client_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.diary_cards dc
      where dc.id = diary_card_id and dc.client_id = auth.uid()
    )
  );

create policy "Therapists read new paths"
  on public.diary_card_new_paths for select
  using (
    exists (
      select 1 from public.diary_cards dc
      where dc.id = diary_card_id and public.is_therapist()
    )
  );

-- -----------------------------------------------------------
-- 4. diary_card_trauma_networks
-- -----------------------------------------------------------
create table public.diary_card_trauma_networks (
  id uuid primary key default gen_random_uuid(),
  diary_card_id uuid not null references public.diary_cards(id) on delete cascade,
  description text default '',
  frequency smallint check (frequency >= 0 and frequency <= 5),
  intensity smallint check (intensity >= 0 and intensity <= 5)
);

alter table public.diary_card_trauma_networks enable row level security;

create policy "Clients CRUD own trauma networks"
  on public.diary_card_trauma_networks for all
  using (
    exists (
      select 1 from public.diary_cards dc
      where dc.id = diary_card_id and dc.client_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.diary_cards dc
      where dc.id = diary_card_id and dc.client_id = auth.uid()
    )
  );

create policy "Therapists read trauma networks"
  on public.diary_card_trauma_networks for select
  using (
    exists (
      select 1 from public.diary_cards dc
      where dc.id = diary_card_id and public.is_therapist()
    )
  );

-- -----------------------------------------------------------
-- 5. diary_card_problem_behaviors
-- -----------------------------------------------------------
create table public.diary_card_problem_behaviors (
  id uuid primary key default gen_random_uuid(),
  diary_card_id uuid not null references public.diary_cards(id) on delete cascade,
  description text default '',
  impulsivity smallint check (impulsivity >= 0 and impulsivity <= 5),
  acted boolean
);

alter table public.diary_card_problem_behaviors enable row level security;

create policy "Clients CRUD own problem behaviors"
  on public.diary_card_problem_behaviors for all
  using (
    exists (
      select 1 from public.diary_cards dc
      where dc.id = diary_card_id and dc.client_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.diary_cards dc
      where dc.id = diary_card_id and dc.client_id = auth.uid()
    )
  );

create policy "Therapists read problem behaviors"
  on public.diary_card_problem_behaviors for select
  using (
    exists (
      select 1 from public.diary_cards dc
      where dc.id = diary_card_id and public.is_therapist()
    )
  );

-- -----------------------------------------------------------
-- 6. daily_diary_entries (standalone daily diary card)
-- -----------------------------------------------------------
create table public.daily_diary_entries (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  entry_date date not null,
  positive_events text default '',
  unpleasant_events text default '',
  treatment_commitment smallint check (treatment_commitment >= 0 and treatment_commitment <= 5),
  self_compassion smallint check (self_compassion >= 0 and self_compassion <= 5),
  pain smallint check (pain >= 0 and pain <= 5),
  sleep smallint check (sleep >= 0 and sleep <= 5),
  dissociation smallint check (dissociation >= 0 and dissociation <= 5),
  trauma_intrusion_frequency smallint check (trauma_intrusion_frequency >= 0),
  trauma_intrusion_max_intensity smallint check (trauma_intrusion_max_intensity >= 0 and trauma_intrusion_max_intensity <= 5),
  suicidal_ideation smallint check (suicidal_ideation >= 0 and suicidal_ideation <= 5),
  skills_used smallint check (skills_used >= 0 and skills_used <= 5),
  physical_exercise smallint check (physical_exercise >= 0 and physical_exercise <= 6),
  pleasant_activities smallint check (pleasant_activities >= 0 and pleasant_activities <= 5),
  therapy_homework_done boolean,
  new_paths jsonb default '[]',
  trauma_networks jsonb default '[]',
  problem_behaviors jsonb default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_diary_entries_client_date unique (client_id, entry_date)
);

create index idx_daily_diary_entries_client_id on public.daily_diary_entries (client_id);
create index idx_daily_diary_entries_entry_date on public.daily_diary_entries (entry_date);

alter table public.daily_diary_entries enable row level security;

create policy "Clients CRUD own daily diary entries"
  on public.daily_diary_entries for all
  using (auth.uid() = client_id)
  with check (auth.uid() = client_id);

create policy "Therapists read daily diary entries"
  on public.daily_diary_entries for select
  using (public.is_therapist());

create trigger daily_diary_entries_updated_at
  before update on public.daily_diary_entries
  for each row execute function public.update_updated_at();
