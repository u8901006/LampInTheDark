# DBT-PTSD Electronic Diary Card System - Design Document

**Date**: 2026-04-04
**Status**: Approved
**Author**: LampInTheDark Team

## Overview

Transform the existing anonymous message board into a **DBT-PTSD electronic diary card system**. The platform allows therapy clients (案主) to fill in DBT-PTSD worksheets digitally, while a therapist (治療師) can view all client data from an admin backend. Source material: *DBT-PTSD Clients Manual 4-2024 (Trad. Chinese) 1.1*, pages 12-15.

## Requirements Summary

| Requirement | Detail |
|---|---|
| Client auth | Self-registration with email + password |
| Therapist auth | Single therapist account (manual setup) |
| Diary card - Weekly | One record per week (Sun-Sat), as per PDF p.13 |
| Diary card - Daily | One record per day, same fields as weekly |
| Emergency plan | Contact info worksheet, PDF p.12 |
| Life timeline | Interactive line chart, PDF p.14 |
| Sleep diary | Daily sleep log, PDF p.15 |
| Data isolation | Clients can only see their own data |
| Therapist access | Therapist can see all clients' data |
| Message board | Completely removed |

## Architecture

### Tech Stack (unchanged)

- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **Deployment**: Vercel
- **Testing**: Vitest

### User Roles

| Role | Registration | Permissions |
|---|---|---|
| Client (案主) | Self-registration (email + password) | CRUD own worksheets only |
| Therapist (治療師) | Manual setup (seed / env) | Read all clients' worksheets |

## Database Schema

### profiles

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK, FK → auth.users |
| role | text | NOT NULL, CHECK ('client', 'therapist') |
| display_name | text | NOT NULL |
| created_at | timestamptz | NOT NULL, default now() |

### diary_cards (每週日誌卡)

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK, default gen_random_uuid() |
| client_id | uuid | NOT NULL, FK → profiles(id) |
| week_start | date | NOT NULL |
| week_end | date | NOT NULL |
| medications | text | default '' |
| weekly_most_positive | text | default '' |
| weekly_most_negative | text | default '' |
| created_at | timestamptz | NOT NULL, default now() |
| updated_at | timestamptz | NOT NULL, default now() |

**Unique**: (client_id, week_start)

### diary_card_daily_entries (每週日誌卡 - 每日明細)

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| diary_card_id | uuid | NOT NULL, FK → diary_cards(id) ON DELETE CASCADE |
| day_of_week | smallint | NOT NULL, CHECK (0-6) |
| positive_events | text | default '' |
| unpleasant_events | text | default '' |
| treatment_commitment | smallint | CHECK (0-5) |
| self_compassion | smallint | CHECK (0-5) |
| pain | smallint | CHECK (0-5) |
| sleep | smallint | CHECK (0-5) |
| dissociation | smallint | CHECK (0-5) |
| trauma_intrusion_frequency | smallint | >= 0 |
| trauma_intrusion_max_intensity | smallint | CHECK (0-5) |
| suicidal_ideation | smallint | CHECK (0-5) |
| skills_used | smallint | CHECK (0-5) |
| physical_exercise | smallint | CHECK (0-6) |
| pleasant_activities | smallint | CHECK (0-5) |
| therapy_homework_done | boolean | |
| created_at | timestamptz | NOT NULL, default now() |
| updated_at | timestamptz | NOT NULL, default now() |

**Unique**: (diary_card_id, day_of_week)

### diary_card_new_paths (新路徑)

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| diary_card_id | uuid | NOT NULL, FK → diary_cards(id) ON DELETE CASCADE |
| path_number | smallint | NOT NULL, CHECK (1-2) |
| description | text | default '' |
| thought_about | boolean | |
| practiced | smallint | CHECK (0-5) |

### diary_card_trauma_networks (創傷網路)

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| diary_card_id | uuid | NOT NULL, FK → diary_cards(id) ON DELETE CASCADE |
| description | text | default '' |
| frequency | smallint | CHECK (0-5) |
| intensity | smallint | CHECK (0-5) |

### diary_card_problem_behaviors (問題行為)

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| diary_card_id | uuid | NOT NULL, FK → diary_cards(id) ON DELETE CASCADE |
| description | text | default '' |
| impulsivity | smallint | CHECK (0-5) |
| acted | boolean | |

### daily_diary_entries (每日日誌卡 - 單日獨立版)

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| client_id | uuid | NOT NULL, FK → profiles(id) |
| entry_date | date | NOT NULL |
| positive_events | text | default '' |
| unpleasant_events | text | default '' |
| treatment_commitment | smallint | CHECK (0-5) |
| self_compassion | smallint | CHECK (0-5) |
| pain | smallint | CHECK (0-5) |
| sleep | smallint | CHECK (0-5) |
| dissociation | smallint | CHECK (0-5) |
| trauma_intrusion_frequency | smallint | >= 0 |
| trauma_intrusion_max_intensity | smallint | CHECK (0-5) |
| suicidal_ideation | smallint | CHECK (0-5) |
| skills_used | smallint | CHECK (0-5) |
| physical_exercise | smallint | CHECK (0-6) |
| pleasant_activities | smallint | CHECK (0-5) |
| therapy_homework_done | boolean | |
| new_paths | jsonb | default '[]' |
| trauma_networks | jsonb | default '[]' |
| problem_behaviors | jsonb | default '[]' |
| created_at | timestamptz | NOT NULL, default now() |
| updated_at | timestamptz | NOT NULL, default now() |

**Unique**: (client_id, entry_date)

### emergency_plans (緊急計劃)

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| client_id | uuid | NOT NULL, FK → profiles(id), UNIQUE |
| friend_name | text | |
| friend_phone | text | |
| friend_available_hours | text | |
| friend_email | text | |
| therapist_name | text | |
| therapist_phone | text | |
| therapist_available_hours | text | |
| therapist_email | text | |
| substitute_therapist_name | text | |
| substitute_therapist_phone | text | |
| substitute_therapist_available_hours | text | |
| substitute_therapist_email | text | |
| emergency_service_name | text | |
| emergency_service_phone | text | |
| created_at | timestamptz | NOT NULL, default now() |
| updated_at | timestamptz | NOT NULL, default now() |

### life_timelines (生命歷程折線圖)

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| client_id | uuid | NOT NULL, FK → profiles(id), UNIQUE |
| created_at | timestamptz | NOT NULL, default now() |
| updated_at | timestamptz | NOT NULL, default now() |

### life_timeline_events (事件點)

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| timeline_id | uuid | NOT NULL, FK → life_timelines(id) ON DELETE CASCADE |
| age | integer | NOT NULL |
| score | integer | NOT NULL, CHECK (-100 to 100) |
| description | text | NOT NULL |
| created_at | timestamptz | NOT NULL, default now() |

### sleep_diaries (睡眠日記)

| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| client_id | uuid | NOT NULL, FK → profiles(id) |
| entry_date | date | NOT NULL |
| bedtime | time | |
| wakeup_time | time | |
| sleep_quality | text | CHECK ('awake', 'dozing', 'asleep', 'nightmare') |
| major_night_events | text | default '' |
| created_at | timestamptz | NOT NULL, default now() |
| updated_at | timestamptz | NOT NULL, default now() |

**Unique**: (client_id, entry_date)

## Routes

### Client Routes (案主)

| Route | Description |
|---|---|
| `/` | Landing page (login/register) |
| `/auth/login` | Client login |
| `/auth/register` | Client registration |
| `/dashboard` | Client dashboard (worksheet list) |
| `/diary/weekly` | Create/edit weekly diary card |
| `/diary/weekly/[id]` | View specific weekly diary |
| `/diary/daily` | Create/edit daily diary |
| `/diary/daily/[id]` | View specific daily diary |
| `/emergency-plan` | Emergency plan form |
| `/timeline` | Life timeline (interactive chart) |
| `/sleep-diary` | Sleep diary entries |

### Therapist Routes (治療師)

| Route | Description |
|---|---|
| `/admin/login` | Therapist login |
| `/admin/dashboard` | All clients overview |
| `/admin/client/[id]` | Specific client's worksheets |
| `/admin/diary/weekly/[id]` | View weekly diary (read-only) |
| `/admin/diary/daily/[id]` | View daily diary (read-only) |
| `/admin/emergency-plan/[clientId]` | View client's emergency plan |
| `/admin/timeline/[clientId]` | View client's timeline |
| `/admin/sleep-diary/[clientId]` | View client's sleep diary |

## RLS Policies

- **profiles**: Clients read own row; therapist reads all
- **diary_cards**: Clients CRUD own (client_id = auth.uid()); therapist reads all
- **diary_card_daily_entries**: Via diary_cards ownership
- **daily_diary_entries**: Clients CRUD own; therapist reads all
- **emergency_plans**: Clients CRUD own; therapist reads all
- **life_timelines / life_timeline_events**: Clients CRUD own; therapist reads all
- **sleep_diaries**: Clients CRUD own; therapist reads all

## Files to Remove

All message-board related files:
- `app/write/`, `app/posts/`, `app/my-post/`
- `app/api/v1/posts/`, `app/api/v1/recommendations/`
- `components/post/`, `components/admin/moderation-*`, `components/admin/queue-*`
- `lib/moderation/`, `lib/posts/`, `lib/recommendations/`
- `lib/api/posts.ts`, `lib/api/admin-queue.ts`, `lib/api/admin-metrics.ts`
- `supabase/seed.sql` (old seed data)
- Old migration files (keep but supersede)

## Files to Keep/Modify

- `app/globals.css` (adjust theme)
- `app/layout.tsx` (update navigation)
- `lib/supabase/server.ts` (extend for client auth)
- `lib/admin/auth.ts` (adapt for therapist role)
- `components/sound-bath/` (keep or remove per preference)
- CI/CD, deployment configs
