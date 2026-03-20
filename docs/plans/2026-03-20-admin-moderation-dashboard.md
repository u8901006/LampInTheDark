# Admin Moderation Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a protected admin moderation backend with Supabase-authenticated access, queue management actions, search/filter support, and AI moderation usage metrics.

**Architecture:** Admin pages and APIs are protected by Supabase Auth plus an `admin_users` authorization table. A dedicated login page leads to a protected queue page that combines moderation actions and metrics sourced from `posts` and `moderation_runs`.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Supabase Auth, Supabase Postgres, existing repository and API modules.

---

## 1. Definition Of Done

- `/admin/login` exists and uses Supabase Auth.
- `/admin/queue` is protected and visible only to admin users.
- `admin_users` authorization exists in schema.
- Admin queue supports keyword search and filtering.
- Admin can approve or reject queued posts.
- Metrics endpoint and summary cards show provider usage, success, latency, and manual-review ratio.
- Tests cover auth guard, moderation actions, metrics aggregation, and page rendering.
- `npm test` and `npm run build` pass.

## 2. Assumptions And Constraints

- First version uses one admin role only.
- Existing moderation backend contract remains intact.
- Existing production `posts` and `moderation_runs` schema can be extended safely.
- Service-role access remains server-side only.

## 3. Risks And Rollback

- Risk: admin auth is added but route guards remain inconsistent.
  - Mitigation: centralize admin session and role checks.
- Risk: metrics queries become tightly coupled to UI.
  - Mitigation: create a dedicated metrics repository layer.
- Risk: moderation actions lack auditability.
  - Mitigation: add reviewer metadata fields.
- Rollback: disable new admin pages/routes and revert schema additions while keeping existing moderation data intact.

## 4. Task List

### Task 1: Add failing tests for admin auth and protected routes

**Files:**
- Create: `tests/app/admin/login/page.test.tsx`
- Create: `tests/lib/admin/auth.test.ts`
- Test: `tests/app/admin/login/page.test.tsx`
- Test: `tests/lib/admin/auth.test.ts`

**Step 1: Write the failing tests**

Cover:

- `/admin/login` renders a login form
- unauthenticated access to protected admin flow is rejected or redirected
- authenticated non-admin users are denied

**Step 2: Run tests to verify they fail**

Run: `npm test -- --run tests/app/admin/login/page.test.tsx tests/lib/admin/auth.test.ts`
Expected: FAIL because login page and admin auth utilities do not exist yet.

**Step 3: Write minimal implementation**

Do not implement yet.

**Step 4: Re-run to confirm red state**

Run: `npm test -- --run tests/app/admin/login/page.test.tsx tests/lib/admin/auth.test.ts`
Expected: FAIL

**Step 5: Commit**

```bash
git add tests/app/admin/login/page.test.tsx tests/lib/admin/auth.test.ts
git commit -m "test(admin): add auth guard coverage"
```

### Task 2: Add migration and types for admin authorization and review metadata

**Files:**
- Create: `supabase/migrations/20260320_add_admin_users.sql`
- Modify: `supabase/types.ts`
- Create: `tests/supabase/migrations/add-admin-users.test.ts`

**Step 1: Write the failing migration test**

Check for:

- `create table if not exists admin_users`
- `reviewed_at`
- `reviewed_by`
- `review_note`

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/supabase/migrations/add-admin-users.test.ts`
Expected: FAIL because migration file does not exist yet.

**Step 3: Write minimal implementation**

Create migration and update types for:

- `admin_users`
- additional moderation review fields on `posts`

**Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/supabase/migrations/add-admin-users.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add supabase/migrations/20260320_add_admin_users.sql supabase/types.ts tests/supabase/migrations/add-admin-users.test.ts
git commit -m "feat(admin): add admin authorization schema"
```

### Task 3: Implement admin auth helpers and login page

**Files:**
- Create: `lib/admin/auth.ts`
- Create: `app/admin/login/page.tsx`
- Test: `tests/app/admin/login/page.test.tsx`
- Test: `tests/lib/admin/auth.test.ts`

**Step 1: Run the failing auth tests**

Run: `npm test -- --run tests/app/admin/login/page.test.tsx tests/lib/admin/auth.test.ts`
Expected: FAIL because login page and helpers are missing.

**Step 2: Write minimal implementation**

Implement:

- session lookup helper
- admin role verification via `admin_users`
- login page UI and basic sign-in flow entry point

**Step 3: Run tests to verify they pass**

Run: `npm test -- --run tests/app/admin/login/page.test.tsx tests/lib/admin/auth.test.ts`
Expected: PASS

**Step 4: Run build check**

Run: `npm run build`
Expected: PASS

**Step 5: Commit**

```bash
git add lib/admin/auth.ts app/admin/login/page.tsx tests/app/admin/login/page.test.tsx tests/lib/admin/auth.test.ts
git commit -m "feat(admin): add protected login flow"
```

### Task 4: Add failing tests for queue management and metrics API

**Files:**
- Create: `tests/lib/admin/metrics.test.ts`
- Modify: `tests/app/api/v1/admin/queue/route.test.ts`
- Create: `tests/app/api/v1/admin/posts/route.test.ts`
- Create: `tests/app/api/v1/admin/metrics/route.test.ts`

**Step 1: Write the failing tests**

Cover:

- queue filtering by status/provider/decision
- moderation approve/reject action
- metrics aggregation for provider count, success rate, latency, manual-review ratio

**Step 2: Run tests to verify they fail**

Run: `npm test -- --run tests/app/api/v1/admin/queue/route.test.ts tests/app/api/v1/admin/posts/route.test.ts tests/app/api/v1/admin/metrics/route.test.ts tests/lib/admin/metrics.test.ts`
Expected: FAIL because filtering, metrics, and moderation action routes are not implemented yet.

**Step 3: Write minimal implementation**

Do not implement yet.

**Step 4: Re-run to confirm red state**

Run: `npm test -- --run tests/app/api/v1/admin/queue/route.test.ts tests/app/api/v1/admin/posts/route.test.ts tests/app/api/v1/admin/metrics/route.test.ts tests/lib/admin/metrics.test.ts`
Expected: FAIL

**Step 5: Commit**

```bash
git add tests/app/api/v1/admin/queue/route.test.ts tests/app/api/v1/admin/posts/route.test.ts tests/app/api/v1/admin/metrics/route.test.ts tests/lib/admin/metrics.test.ts
git commit -m "test(admin): add moderation and metrics API coverage"
```

### Task 5: Implement repositories and APIs for admin moderation and metrics

**Files:**
- Create: `lib/admin/metrics.ts`
- Modify: `lib/posts/repository.ts`
- Modify: `lib/api/admin-queue.ts`
- Create: `app/api/v1/admin/posts/[id]/route.ts`
- Create: `app/api/v1/admin/metrics/route.ts`
- Test: `tests/lib/admin/metrics.test.ts`
- Test: `tests/app/api/v1/admin/posts/route.test.ts`
- Test: `tests/app/api/v1/admin/metrics/route.test.ts`

**Step 1: Run the failing admin API tests**

Run: `npm test -- --run tests/app/api/v1/admin/queue/route.test.ts tests/app/api/v1/admin/posts/route.test.ts tests/app/api/v1/admin/metrics/route.test.ts tests/lib/admin/metrics.test.ts`
Expected: FAIL because implementations are incomplete.

**Step 2: Write minimal implementation**

Implement:

- queue search and filters
- approve/reject action with reviewer metadata
- metrics aggregation helpers sourced from `moderation_runs`
- protected admin API handlers

**Step 3: Run tests to verify they pass**

Run: `npm test -- --run tests/app/api/v1/admin/queue/route.test.ts tests/app/api/v1/admin/posts/route.test.ts tests/app/api/v1/admin/metrics/route.test.ts tests/lib/admin/metrics.test.ts`
Expected: PASS

**Step 4: Run regression checks**

Run: `npm test -- --run tests/app/api/v1/posts/route.test.ts tests/app/api/v1/admin/queue/route.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add lib/admin/metrics.ts lib/posts/repository.ts lib/api/admin-queue.ts app/api/v1/admin/posts/[id]/route.ts app/api/v1/admin/metrics/route.ts tests/lib/admin/metrics.test.ts tests/app/api/v1/admin/posts/route.test.ts tests/app/api/v1/admin/metrics/route.test.ts
git commit -m "feat(admin): add moderation actions and metrics APIs"
```

### Task 6: Build protected admin dashboard UI

**Files:**
- Modify: `app/admin/queue/page.tsx`
- Create: `components/admin/metrics-cards.tsx`
- Create: `components/admin/queue-filters.tsx`
- Create: `components/admin/moderation-actions.tsx`
- Test: `tests/app/admin/queue/page.test.tsx`

**Step 1: Write the failing page test**

Add assertions for:

- metrics summary cards render
- search and filter controls render
- approve/reject actions render

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/app/admin/queue/page.test.tsx`
Expected: FAIL because current admin page is only a simple list.

**Step 3: Write minimal implementation**

Implement the queue page with:

- metrics cards
- filter toolbar
- queue entries with moderation actions
- layout consistent with the existing warm visual design system

**Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/app/admin/queue/page.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add app/admin/queue/page.tsx components/admin/metrics-cards.tsx components/admin/queue-filters.tsx components/admin/moderation-actions.tsx tests/app/admin/queue/page.test.tsx
git commit -m "feat(admin): add moderation dashboard UI"
```

### Task 7: Final verification

**Files:**
- Test: `tests/**`

**Step 1: Run focused admin verification**

Run: `npm test -- --run tests/app/admin/login/page.test.tsx tests/lib/admin/auth.test.ts tests/app/api/v1/admin/queue/route.test.ts tests/app/api/v1/admin/posts/route.test.ts tests/app/api/v1/admin/metrics/route.test.ts tests/lib/admin/metrics.test.ts tests/app/admin/queue/page.test.tsx`
Expected: PASS

**Step 2: Run full test suite**

Run: `npm test`
Expected: PASS

**Step 3: Run production build**

Run: `npm run build`
Expected: PASS

**Step 4: Manual verification checklist**

Confirm:

- unauthenticated admin access is blocked
- admin login works
- queue filters narrow results correctly
- approve/reject actions update state
- metrics cards show values from actual data

**Step 5: Commit**

```bash
git add app components lib supabase tests
git commit -m "test(admin): verify protected moderation dashboard"
```
