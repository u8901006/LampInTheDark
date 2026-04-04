# DBT-PTSD Electronic Diary Card System - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the anonymous message board into a DBT-PTSD electronic diary card system with client self-registration, 4 worksheet types (weekly/daily diary cards, emergency plan, life timeline, sleep diary), and a single-therapist admin backend.

**Architecture:** Next.js 15 App Router + Supabase Auth + PostgreSQL with RLS. Clients authenticate via Supabase Auth (email+password), therapist uses a single pre-seeded account. All data isolated per-client via RLS. Clean repository pattern with dependency injection for testability.

**Tech Stack:** Next.js 15, React 19, TypeScript, Supabase (Auth + PostgreSQL + RLS), Vitest, Tailwind CSS, Vercel

**Design Doc:** `docs/plans/2026-04-04-dbt-ptsd-diary-card-design.md`

---

## Phase 1: Foundation - Remove Old, Setup New DB

### Task 1: Remove message board files

**Files:**
- Remove: `app/write/` (entire directory)
- Remove: `app/posts/` (entire directory)
- Remove: `app/my-post/` (entire directory)
- Remove: `app/api/v1/posts/` (entire directory)
- Remove: `app/api/v1/recommendations/` (entire directory)
- Remove: `app/api/v1/admin/queue/` (entire directory)
- Remove: `app/api/v1/admin/metrics/` (entire directory)
- Remove: `app/api/v1/admin/posts/` (entire directory)
- Remove: `app/api/v1/admin/login/` (entire directory)
- Remove: `components/post/` (entire directory)
- Remove: `components/admin/moderation-actions.tsx`
- Remove: `components/admin/queue-filters.tsx`
- Remove: `components/admin/metrics-cards.tsx`
- Remove: `lib/moderation/` (entire directory)
- Remove: `lib/posts/` (entire directory)
- Remove: `lib/recommendations/` (entire directory)
- Remove: `lib/api/posts.ts`
- Remove: `lib/api/admin-queue.ts`
- Remove: `lib/api/admin-metrics.ts`
- Remove: `lib/api/admin-login.ts`
- Remove: `lib/admin/metrics.ts`
- Remove: `lib/admin/runtime.ts`
- Remove: `lib/admin/auth.ts` (will rewrite)
- Remove: `tests/` (all old test files - will rewrite)

**Step 1:** Delete all listed files and directories.

**Step 2:** Run `npm run build` to verify no import errors from deleted files. Fix any remaining imports.

**Step 3:** Commit
```bash
git add -A
git commit -m "chore: remove message board feature files"
```

---

### Task 2: Create new Supabase migration - profiles + enable client signup

**Files:**
- Create: `supabase/migrations/20260404_create_profiles.sql`

**Step 1: Write the migration**

```sql
-- Enable public signup for clients
ALTER DATABASE postgres SET app.settings.enable_signup = 'true';

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('client', 'therapist')),
  display_name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: users can read own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: users can update own profile (but not role)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Trigger: auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, display_name)
  VALUES (
    NEW.id,
    'client',
    COALESCE(NEW.raw_user_meta_data->>'display_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Therapist profile will be seeded manually
```

**Step 2:** Run migration against local Supabase (or note for remote).

**Step 3:** Commit
```bash
git add supabase/migrations/20260404_create_profiles.sql
git commit -m "feat: add profiles table with auto-creation trigger"
```

---

### Task 3: Create diary card tables migration

**Files:**
- Create: `supabase/migrations/20260404_create_diary_cards.sql`

**Step 1: Write the migration**

```sql
-- Weekly diary cards
CREATE TABLE public.diary_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  week_end date NOT NULL,
  medications text NOT NULL DEFAULT '',
  weekly_most_positive text NOT NULL DEFAULT '',
  weekly_most_negative text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, week_start)
);

CREATE INDEX idx_diary_cards_client_id ON public.diary_cards(client_id);
CREATE INDEX idx_diary_cards_week_start ON public.diary_cards(week_start);

-- Daily entries within a weekly card
CREATE TABLE public.diary_card_daily_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diary_card_id uuid NOT NULL REFERENCES public.diary_cards(id) ON DELETE CASCADE,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  positive_events text NOT NULL DEFAULT '',
  unpleasant_events text NOT NULL DEFAULT '',
  treatment_commitment smallint CHECK (treatment_commitment BETWEEN 0 AND 5),
  self_compassion smallint CHECK (self_compassion BETWEEN 0 AND 5),
  pain smallint CHECK (pain BETWEEN 0 AND 5),
  sleep smallint CHECK (sleep BETWEEN 0 AND 5),
  dissociation smallint CHECK (dissociation BETWEEN 0 AND 5),
  trauma_intrusion_frequency smallint CHECK (trauma_intrusion_frequency >= 0),
  trauma_intrusion_max_intensity smallint CHECK (trauma_intrusion_max_intensity BETWEEN 0 AND 5),
  suicidal_ideation smallint CHECK (suicidal_ideation BETWEEN 0 AND 5),
  skills_used smallint CHECK (skills_used BETWEEN 0 AND 5),
  physical_exercise smallint CHECK (physical_exercise BETWEEN 0 AND 6),
  pleasant_activities smallint CHECK (pleasant_activities BETWEEN 0 AND 5),
  therapy_homework_done boolean,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (diary_card_id, day_of_week)
);

-- New paths (1 or 2 per weekly card)
CREATE TABLE public.diary_card_new_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diary_card_id uuid NOT NULL REFERENCES public.diary_cards(id) ON DELETE CASCADE,
  path_number smallint NOT NULL CHECK (path_number BETWEEN 1 AND 2),
  description text NOT NULL DEFAULT '',
  thought_about boolean,
  practiced smallint CHECK (practiced BETWEEN 0 AND 5),
  UNIQUE (diary_card_id, path_number)
);

-- Trauma networks
CREATE TABLE public.diary_card_trauma_networks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diary_card_id uuid NOT NULL REFERENCES public.diary_cards(id) ON DELETE CASCADE,
  description text NOT NULL DEFAULT '',
  frequency smallint CHECK (frequency BETWEEN 0 AND 5),
  intensity smallint CHECK (intensity BETWEEN 0 AND 5)
);

-- Problem behaviors
CREATE TABLE public.diary_card_problem_behaviors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  diary_card_id uuid NOT NULL REFERENCES public.diary_cards(id) ON DELETE CASCADE,
  description text NOT NULL DEFAULT '',
  impulsivity smallint CHECK (impulsivity BETWEEN 0 AND 5),
  acted boolean
);

-- Daily diary entries (standalone daily version)
CREATE TABLE public.daily_diary_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  positive_events text NOT NULL DEFAULT '',
  unpleasant_events text NOT NULL DEFAULT '',
  treatment_commitment smallint CHECK (treatment_commitment BETWEEN 0 AND 5),
  self_compassion smallint CHECK (self_compassion BETWEEN 0 AND 5),
  pain smallint CHECK (pain BETWEEN 0 AND 5),
  sleep smallint CHECK (sleep BETWEEN 0 AND 5),
  dissociation smallint CHECK (dissociation BETWEEN 0 AND 5),
  trauma_intrusion_frequency smallint CHECK (trauma_intrusion_frequency >= 0),
  trauma_intrusion_max_intensity smallint CHECK (trauma_intrusion_max_intensity BETWEEN 0 AND 5),
  suicidal_ideation smallint CHECK (suicidal_ideation BETWEEN 0 AND 5),
  skills_used smallint CHECK (skills_used BETWEEN 0 AND 5),
  physical_exercise smallint CHECK (physical_exercise BETWEEN 0 AND 6),
  pleasant_activities smallint CHECK (pleasant_activities BETWEEN 0 AND 5),
  therapy_homework_done boolean,
  new_paths jsonb NOT NULL DEFAULT '[]',
  trauma_networks jsonb NOT NULL DEFAULT '[]',
  problem_behaviors jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, entry_date)
);

CREATE INDEX idx_daily_diary_entries_client_id ON public.daily_diary_entries(client_id);
CREATE INDEX idx_daily_diary_entries_entry_date ON public.daily_diary_entries(entry_date);

-- RLS for all diary card tables
ALTER TABLE public.diary_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_card_daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_card_new_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_card_trauma_networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_card_problem_behaviors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_diary_entries ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is therapist
CREATE OR REPLACE FUNCTION public.is_therapist()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'therapist'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- diary_cards policies
CREATE POLICY "Clients CRUD own diary cards"
  ON public.diary_cards FOR ALL
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Therapist reads all diary cards"
  ON public.diary_cards FOR SELECT
  USING (public.is_therapist());

-- diary_card_daily_entries policies
CREATE POLICY "Clients CRUD own daily entries"
  ON public.diary_card_daily_entries FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.diary_cards WHERE id = diary_card_id AND client_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.diary_cards WHERE id = diary_card_id AND client_id = auth.uid()
  ));

CREATE POLICY "Therapist reads all daily entries"
  ON public.diary_card_daily_entries FOR SELECT
  USING (public.is_therapist());

-- diary_card_new_paths policies
CREATE POLICY "Clients CRUD own new paths"
  ON public.diary_card_new_paths FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.diary_cards WHERE id = diary_card_id AND client_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.diary_cards WHERE id = diary_card_id AND client_id = auth.uid()
  ));

CREATE POLICY "Therapist reads all new paths"
  ON public.diary_card_new_paths FOR SELECT
  USING (public.is_therapist());

-- diary_card_trauma_networks policies
CREATE POLICY "Clients CRUD own trauma networks"
  ON public.diary_card_trauma_networks FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.diary_cards WHERE id = diary_card_id AND client_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.diary_cards WHERE id = diary_card_id AND client_id = auth.uid()
  ));

CREATE POLICY "Therapist reads all trauma networks"
  ON public.diary_card_trauma_networks FOR SELECT
  USING (public.is_therapist());

-- diary_card_problem_behaviors policies
CREATE POLICY "Clients CRUD own problem behaviors"
  ON public.diary_card_problem_behaviors FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.diary_cards WHERE id = diary_card_id AND client_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.diary_cards WHERE id = diary_card_id AND client_id = auth.uid()
  ));

CREATE POLICY "Therapist reads all problem behaviors"
  ON public.diary_card_problem_behaviors FOR SELECT
  USING (public.is_therapist());

-- daily_diary_entries policies
CREATE POLICY "Clients CRUD own daily diary"
  ON public.daily_diary_entries FOR ALL
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Therapist reads all daily diary"
  ON public.daily_diary_entries FOR SELECT
  USING (public.is_therapist());

-- auto-update updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_diary_cards_updated_at
  BEFORE UPDATE ON public.diary_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_diary_card_daily_entries_updated_at
  BEFORE UPDATE ON public.diary_card_daily_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_daily_diary_entries_updated_at
  BEFORE UPDATE ON public.daily_diary_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

**Step 2:** Commit
```bash
git add supabase/migrations/20260404_create_diary_cards.sql
git commit -m "feat: add diary card tables with RLS policies"
```

---

### Task 4: Create emergency plan, life timeline, sleep diary tables migration

**Files:**
- Create: `supabase/migrations/20260404_create_worksheets.sql`

**Step 1: Write the migration**

```sql
-- Emergency Plans
CREATE TABLE public.emergency_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  friend_name text NOT NULL DEFAULT '',
  friend_phone text NOT NULL DEFAULT '',
  friend_available_hours text NOT NULL DEFAULT '',
  friend_email text NOT NULL DEFAULT '',
  therapist_name text NOT NULL DEFAULT '',
  therapist_phone text NOT NULL DEFAULT '',
  therapist_available_hours text NOT NULL DEFAULT '',
  therapist_email text NOT NULL DEFAULT '',
  substitute_therapist_name text NOT NULL DEFAULT '',
  substitute_therapist_phone text NOT NULL DEFAULT '',
  substitute_therapist_available_hours text NOT NULL DEFAULT '',
  substitute_therapist_email text NOT NULL DEFAULT '',
  emergency_service_name text NOT NULL DEFAULT '',
  emergency_service_phone text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Life Timelines
CREATE TABLE public.life_timelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.life_timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timeline_id uuid NOT NULL REFERENCES public.life_timelines(id) ON DELETE CASCADE,
  age integer NOT NULL,
  score integer NOT NULL CHECK (score BETWEEN -100 AND 100),
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_life_timeline_events_timeline_id ON public.life_timeline_events(timeline_id);

-- Sleep Diaries
CREATE TABLE public.sleep_diaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  bedtime time,
  wakeup_time time,
  sleep_quality text CHECK (sleep_quality IN ('awake', 'dozing', 'asleep', 'nightmare')),
  major_night_events text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, entry_date)
);

CREATE INDEX idx_sleep_diaries_client_id ON public.sleep_diaries(client_id);
CREATE INDEX idx_sleep_diaries_entry_date ON public.sleep_diaries(entry_date);

-- RLS
ALTER TABLE public.emergency_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_diaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients CRUD own emergency plan"
  ON public.emergency_plans FOR ALL
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Therapist reads all emergency plans"
  ON public.emergency_plans FOR SELECT
  USING (public.is_therapist());

CREATE POLICY "Clients CRUD own timeline"
  ON public.life_timelines FOR ALL
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Therapist reads all timelines"
  ON public.life_timelines FOR SELECT
  USING (public.is_therapist());

CREATE POLICY "Clients CRUD own timeline events"
  ON public.life_timeline_events FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.life_timelines WHERE id = timeline_id AND client_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.life_timelines WHERE id = timeline_id AND client_id = auth.uid()
  ));

CREATE POLICY "Therapist reads all timeline events"
  ON public.life_timeline_events FOR SELECT
  USING (public.is_therapist());

CREATE POLICY "Clients CRUD own sleep diary"
  ON public.sleep_diaries FOR ALL
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Therapist reads all sleep diaries"
  ON public.sleep_diaries FOR SELECT
  USING (public.is_therapist());

-- updated_at triggers
CREATE TRIGGER trg_emergency_plans_updated_at
  BEFORE UPDATE ON public.emergency_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_life_timelines_updated_at
  BEFORE UPDATE ON public.life_timelines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_sleep_diaries_updated_at
  BEFORE UPDATE ON public.sleep_diaries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

**Step 2:** Commit
```bash
git add supabase/migrations/20260404_create_worksheets.sql
git commit -m "feat: add emergency plan, life timeline, sleep diary tables"
```

---

### Task 5: Update Supabase types

**Files:**
- Modify: `supabase/types.ts`

**Step 1:** Replace the entire file with TypeScript types matching all new tables.

**Step 2:** Commit
```bash
git add supabase/types.ts
git commit -m "feat: update TypeScript types for diary card schema"
```

---

## Phase 2: Auth - Client Registration & Login

### Task 6: Auth pages - Client registration & login

**Files:**
- Create: `app/auth/register/page.tsx`
- Modify: `app/auth/login/page.tsx` (create new)
- Create: `lib/auth/client.ts` (Supabase client-side auth helpers)

**Step 1:** Create `lib/auth/client.ts` - helper functions for sign up, sign in, sign out, get current user.

**Step 2:** Create `app/auth/register/page.tsx` - registration form with:
- Display name field
- Email field
- Password field (min 8 chars)
- Confirm password field
- Submit → calls Supabase `signUp`
- On success, redirect to `/dashboard`

**Step 3:** Create `app/auth/login/page.tsx` - login form with:
- Email field
- Password field
- Submit → calls Supabase `signInWithPassword`
- On success, redirect to `/dashboard`
- Link to register page

**Step 4:** Commit
```bash
git add app/auth/ lib/auth/client.ts
git commit -m "feat: add client registration and login pages"
```

---

### Task 7: Update Supabase client for auth

**Files:**
- Modify: `lib/supabase/server.ts`

**Step 1:** Update to support both anon and authenticated client creation. Add `createClientComponentClient()` helper for client-side components, and update `createServerClient()` to properly handle auth cookies.

**Step 2:** Commit
```bash
git add lib/supabase/server.ts
git commit -m "feat: update Supabase client for auth support"
```

---

### Task 8: Middleware for auth protection

**Files:**
- Create: `middleware.ts` (project root)

**Step 1:** Write Next.js middleware that:
- Protects `/dashboard/*`, `/diary/*`, `/emergency-plan`, `/timeline`, `/sleep-diary` routes — redirect to `/auth/login` if not authenticated
- Protects `/admin/*` routes — redirect to `/admin/login` if not authenticated as therapist
- Allows `/auth/*`, `/`, `/admin/login` without auth

**Step 2:** Commit
```bash
git add middleware.ts
git commit -m "feat: add auth middleware for route protection"
```

---

## Phase 3: Landing Page & Navigation

### Task 9: Redesign landing page

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/globals.css` (minor adjustments)

**Step 1:** Rewrite the home page to be a welcome/landing page for the DBT-PTSD diary card system:
- App name and tagline
- Two CTA buttons: "案主登入" → `/auth/login`, "治療師登入" → `/admin/login`
- Brief description of what the app does

**Step 2:** Commit
```bash
git add app/page.tsx app/globals.css
git commit -m "feat: redesign landing page for diary card system"
```

---

### Task 10: Update root layout

**Files:**
- Modify: `app/layout.tsx`

**Step 1:** Update layout:
- Remove SoundBath provider (unless keeping)
- Update metadata (title, description) for diary card system
- Add proper navigation header for authenticated users

**Step 2:** Commit
```bash
git add app/layout.tsx
git commit -m "feat: update root layout for diary card app"
```

---

### Task 11: Create shared layout components

**Files:**
- Create: `components/layout/client-nav.tsx`
- Create: `components/layout/admin-nav.tsx`
- Create: `app/(client)/layout.tsx`
- Create: `app/(admin)/layout.tsx`

**Step 1:** Create client navigation sidebar/header with links to:
- 儀表板 (Dashboard)
- 每週日誌卡
- 每日日誌卡
- 緊急計劃
- 生命歷程圖
- 睡眠日記
- 登出

**Step 2:** Create admin navigation with links to:
- 案主總覽 (Client list)
- 登出

**Step 3:** Create route group layouts that wrap pages with the correct navigation.

**Step 4:** Commit
```bash
git add components/layout/ app/\(client\)/ app/\(admin\)/
git commit -m "feat: add client and admin layouts with navigation"
```

---

## Phase 4: Client Dashboard

### Task 12: Client dashboard page

**Files:**
- Create: `app/(client)/dashboard/page.tsx`
- Create: `lib/diary/repository.ts`

**Step 1:** Create `lib/diary/repository.ts` - data access layer with functions:
- `getWeeklyDiaryCards(clientId)` - list all weekly cards
- `getDailyDiaryEntries(clientId)` - list all daily entries
- `getEmergencyPlan(clientId)` - get emergency plan
- `getSleepDiaries(clientId)` - list sleep diary entries

**Step 2:** Create dashboard page showing:
- Welcome message with display name
- Card grid for each worksheet type:
  - 最近每週日誌卡 (latest weekly cards, max 4)
  - 最近每日日誌卡 (latest daily entries, max 7)
  - 緊急計劃 status (filled / not filled)
  - 最近睡眠日記 (latest entries, max 7)
  - 生命歷程圖 link
- Quick action buttons to create new entries

**Step 3:** Commit
```bash
git add app/\(client\)/dashboard/ lib/diary/repository.ts
git commit -m "feat: add client dashboard page"
```

---

## Phase 5: Weekly Diary Card

### Task 13: Weekly diary card form

**Files:**
- Create: `app/(client)/diary/weekly/page.tsx`
- Create: `app/(client)/diary/weekly/[id]/page.tsx`
- Create: `components/diary/weekly-card-form.tsx`
- Create: `components/diary/scale-input.tsx`
- Create: `app/api/diary/weekly/route.ts`
- Create: `app/api/diary/weekly/[id]/route.ts`

**Step 1:** Create `components/diary/scale-input.tsx` - reusable 0-5 scale component:
- Renders 6 radio buttons (0-5) with labels
- Supports different label ranges (e.g., "沒有" to "非常高")
- Used across all diary card forms

**Step 2:** Create `components/diary/weekly-card-form.tsx` - the main weekly diary card form:
- Header: week date range selector, medications input
- 7 columns (Sun-Sat) with rows for each metric:
  - Positive events (text)
  - Unpleasant events (text)
  - Treatment commitment (0-5)
  - Self-compassion (0-5)
  - Pain (0-5)
  - Sleep (0-5)
  - Dissociation (0-5)
  - Trauma intrusion frequency (number)
  - Trauma intrusion max intensity (0-5)
  - Suicidal ideation (0-5)
  - Skills used (0-5)
  - Physical exercise (0-6)
  - Pleasant activities (0-5)
  - Therapy homework done (checkbox)
- Weekly summary section:
  - Most positive event
  - Most negative event
- New paths section (2 paths, each with description, thought_about, practiced)
- Trauma network section (add/remove, each with description, frequency, intensity)
- Problem behavior section (add/remove, each with description, impulsivity, acted)
- Save button

**Step 3:** Create API routes for CRUD operations on weekly diary cards.

**Step 4:** Create the page components that use the form.

**Step 5:** Commit
```bash
git add app/\(client\)/diary/ components/diary/ app/api/diary/
git commit -m "feat: add weekly diary card form and API"
```

---

### Task 14: Weekly diary card view page

**Files:**
- Create: `app/(client)/diary/weekly/[id]/page.tsx` (view mode)

**Step 1:** Create a read-only view of the weekly diary card showing all filled data in a formatted table/card layout.

**Step 2:** Commit
```bash
git add app/\(client\)/diary/weekly/
git commit -m "feat: add weekly diary card view page"
```

---

## Phase 6: Daily Diary Card

### Task 15: Daily diary card form & view

**Files:**
- Create: `app/(client)/diary/daily/page.tsx`
- Create: `app/(client)/diary/daily/[id]/page.tsx`
- Create: `components/diary/daily-card-form.tsx`
- Create: `app/api/diary/daily/route.ts`
- Create: `app/api/diary/daily/[id]/route.ts`

**Step 1:** Create daily diary form - similar to weekly daily entry but standalone:
- Date picker
- Same scale fields as weekly daily entry
- Inline new paths (1-2, jsonb)
- Inline trauma networks (add/remove, jsonb)
- Inline problem behaviors (add/remove, jsonb)

**Step 2:** Create API routes and view page.

**Step 3:** Commit
```bash
git add app/\(client\)/diary/daily/ components/diary/daily-card-form.tsx app/api/diary/daily/
git commit -m "feat: add daily diary card form, view, and API"
```

---

## Phase 7: Emergency Plan

### Task 16: Emergency plan form

**Files:**
- Create: `app/(client)/emergency-plan/page.tsx`
- Create: `components/emergency/emergency-plan-form.tsx`
- Create: `app/api/emergency-plan/route.ts`

**Step 1:** Create form with 4 contact sections:
1. 一般民眾: name, phone, available hours, email
2. 治療師: name, phone, available hours, email
3. 代理治療師: name, phone, available hours, email
4. 精神科急診服務: name, phone

**Step 2:** Create API route (GET for existing, PUT for upsert).

**Step 3:** Commit
```bash
git add app/\(client\)/emergency-plan/ components/emergency/ app/api/emergency-plan/
git commit -m "feat: add emergency plan form and API"
```

---

## Phase 8: Life Timeline

### Task 17: Life timeline interactive chart

**Files:**
- Create: `app/(client)/timeline/page.tsx`
- Create: `components/timeline/timeline-chart.tsx`
- Create: `components/timeline/event-form.tsx`
- Create: `app/api/timeline/route.ts`
- Create: `app/api/timeline/events/route.ts`

**Step 1:** Create interactive SVG/Canvas chart component:
- X-axis: age (0-100)
- Y-axis: score (-100 to +100)
- Click to add event point
- Drag to adjust position
- Click point to edit description

**Step 2:** Create event form modal:
- Age (integer)
- Score (-100 to +100)
- Description (text)

**Step 3:** Create API routes for CRUD on timeline and events.

**Step 4:** Commit
```bash
git add app/\(client\)/timeline/ components/timeline/ app/api/timeline/
git commit -m "feat: add life timeline interactive chart"
```

---

## Phase 9: Sleep Diary

### Task 18: Sleep diary form & view

**Files:**
- Create: `app/(client)/sleep-diary/page.tsx`
- Create: `components/sleep/sleep-diary-form.tsx`
- Create: `components/sleep/sleep-diary-list.tsx`
- Create: `app/api/sleep-diary/route.ts`

**Step 1:** Create sleep diary form:
- Date picker
- Bedtime (time input)
- Wakeup time (time input)
- Sleep quality selector: 清醒躺著 / 打盹 / 睡著 / 睡著並做惡夢
- Major night events (text)

**Step 2:** Create list view showing recent entries in a table format.

**Step 3:** Create API routes.

**Step 4:** Commit
```bash
git add app/\(client\)/sleep-diary/ components/sleep/ app/api/sleep-diary/
git commit -m "feat: add sleep diary form and list view"
```

---

## Phase 10: Therapist Admin Backend

### Task 19: Therapist login

**Files:**
- Create: `app/admin/login/page.tsx` (rewrite)
- Create: `app/api/admin/auth/route.ts`
- Modify: `lib/admin/auth.ts` (rewrite for therapist role)

**Step 1:** Rewrite therapist login to check profile role = 'therapist' after Supabase auth.

**Step 2:** Commit
```bash
git add app/admin/login/ app/api/admin/auth/ lib/admin/auth.ts
git commit -m "feat: rewrite therapist login with role check"
```

---

### Task 20: Therapist dashboard - client list

**Files:**
- Create: `app/(admin)/admin/dashboard/page.tsx`
- Create: `app/api/admin/clients/route.ts`

**Step 1:** Create dashboard showing:
- List of all registered clients with display_name, registration date
- Last diary card submission date
- Click to view individual client detail

**Step 2:** Create API route that uses service_role_key to fetch all client profiles.

**Step 3:** Commit
```bash
git add app/\(admin\)/admin/dashboard/ app/api/admin/clients/
git commit -m "feat: add therapist dashboard with client list"
```

---

### Task 21: Therapist client detail view

**Files:**
- Create: `app/(admin)/admin/client/[id]/page.tsx`
- Create: `app/api/admin/client/[id]/route.ts`

**Step 1:** Create client detail page showing:
- Client name and registration info
- Tabs/sections for each worksheet type:
  - Weekly diary cards list → click to view detail
  - Daily diary cards list → click to view detail
  - Emergency plan (read-only)
  - Life timeline (read-only chart)
  - Sleep diary entries list

**Step 2:** Create API route to fetch client's data (service_role_key).

**Step 3:** Commit
```bash
git add app/\(admin\)/admin/client/ app/api/admin/client/
git commit -m "feat: add therapist client detail view"
```

---

### Task 22: Therapist diary card view pages

**Files:**
- Create: `app/(admin)/admin/diary/weekly/[id]/page.tsx`
- Create: `app/(admin)/admin/diary/daily/[id]/page.tsx`

**Step 1:** Create read-only views reusing the same display components from client pages.

**Step 2:** Commit
```bash
git add app/\(admin\)/admin/diary/
git commit -m "feat: add therapist diary card view pages"
```

---

## Phase 11: Seed Data & Environment

### Task 23: Update seed data and .env.example

**Files:**
- Modify: `supabase/seed.sql`
- Modify: `.env.example`
- Modify: `lib/env.ts`

**Step 1:** Write new seed data:
- One therapist user (with known email/password for testing)
- Two sample client users
- Sample diary card data for one client

**Step 2:** Update `.env.example` - remove moderation vars, keep Supabase vars.

**Step 3:** Update `lib/env.ts` - remove moderation env vars.

**Step 4:** Commit
```bash
git add supabase/seed.sql .env.example lib/env.ts
git commit -m "feat: update seed data and env config"
```

---

## Phase 12: Testing

### Task 24: Write tests for repository layer

**Files:**
- Create: `tests/lib/diary/repository.test.ts`
- Create: `tests/lib/auth/client.test.ts`

**Step 1:** Write unit tests for diary card repository functions (mocked Supabase).

**Step 2:** Write tests for auth helper functions.

**Step 3:** Run tests: `npm test`

**Step 4:** Commit
```bash
git add tests/
git commit -m "test: add repository and auth tests"
```

---

### Task 25: Write API route tests

**Files:**
- Create: `tests/app/api/diary/weekly.test.ts`
- Create: `tests/app/api/diary/daily.test.ts`
- Create: `tests/app/api/emergency-plan.test.ts`
- Create: `tests/app/api/auth.test.ts`

**Step 1:** Write integration tests for all API routes using the dependency injection pattern.

**Step 2:** Run tests: `npm test`

**Step 3:** Commit
```bash
git add tests/
git commit -m "test: add API route tests"
```

---

## Phase 13: Polish & Deploy

### Task 26: Final cleanup and build verification

**Step 1:** Run `npm run build` — fix any type errors or build failures.

**Step 2:** Run `npm test` — ensure all tests pass.

**Step 3:** Run `npm run lint` — fix any lint issues.

**Step 4:** Update `README.md` to reflect the new app purpose.

**Step 5:** Commit
```bash
git add -A
git commit -m "chore: final cleanup and build verification"
```

---

## Summary

| Phase | Tasks | Description |
|---|---|---|
| 1 | 1-5 | Remove old, create DB schema |
| 2 | 6-8 | Auth (registration, login, middleware) |
| 3 | 9-11 | Landing page, layout, navigation |
| 4 | 12 | Client dashboard |
| 5 | 13-14 | Weekly diary card |
| 6 | 15 | Daily diary card |
| 7 | 16 | Emergency plan |
| 8 | 17 | Life timeline |
| 9 | 18 | Sleep diary |
| 10 | 19-22 | Therapist admin backend |
| 11 | 23 | Seed data & env |
| 12 | 24-25 | Testing |
| 13 | 26 | Polish & deploy |

**Total: 26 tasks across 13 phases.**
