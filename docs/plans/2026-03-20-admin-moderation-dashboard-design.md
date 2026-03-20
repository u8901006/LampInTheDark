# Admin Moderation Dashboard Design

## Context

The production site already includes:

- public anonymous posting via `/write`
- moderation persistence in `posts` and `moderation_runs`
- a minimal admin queue page at `/admin/queue`

The current admin page is only a simple read-only list and is not protected by real authentication.
The product now needs a real admin backend that can:

- require login
- allow moderation decisions such as approve or reject
- support search and filtering across submitted posts
- expose AI moderation usage and reliability signals

## Goal

Create a secure first-version admin backend with:

- authenticated access to `/admin/*`
- post moderation actions
- searchable/filterable moderation queue
- AI usage metrics for providers, latency, success, and manual review rates

## Decision Summary

### Recommended approach

Use `Supabase Auth` for admin sign-in and a dedicated `admin_users` authorization table.

Organize the first version around:

- `/admin/login`
- `/admin/queue`

with `/admin/queue` combining both moderation operations and top-line AI usage metrics.

### Why this approach

- fits the current Supabase-based architecture naturally
- keeps auth and authorization server-side and explicit
- avoids shipping a public admin surface accidentally
- delivers the highest-value admin experience in one page before splitting into more views

### Rejected alternatives

- shared password gate only
  - too weak for production-sensitive moderation tools
- separate queue page and metrics page from the start
  - cleaner long-term, but adds complexity for a first secure release

## Information Architecture

### `/admin/login`

- dedicated sign-in page
- minimal Traditional Chinese login flow for operators
- redirects successful admin users to `/admin/queue`

### `/admin/queue`

- protected page only accessible to authenticated admin users
- contains:
  - metrics summary cards
  - search and filtering controls
  - moderation queue list with actions

## Authentication And Authorization

### Authentication

- use `Supabase Auth`
- admin signs in through `/admin/login`
- server-side guard checks the active session on all `/admin/*` routes and pages

### Authorization

- introduce `admin_users`
- only authenticated users whose `user_id` exists in `admin_users` may access admin pages and APIs

### Access rules

- unauthenticated request to `/admin/*` → redirect to `/admin/login`
- authenticated non-admin request to admin API → `403`
- authenticated admin request → allowed

## Data Model Changes

### New table

`admin_users`

Suggested columns:

- `user_id`
- `created_at`

### Recommended additions to `posts`

- `reviewed_at`
- `reviewed_by`
- `review_note` (optional)

These fields support auditability for manual moderation decisions.

## Admin APIs

### `GET /api/v1/admin/queue`

Responsibilities:

- return moderation queue items
- support keyword search
- support filtering by:
  - post status
  - provider
  - moderation decision

### `PATCH /api/v1/admin/posts/:id`

Responsibilities:

- approve a post
- reject a post
- record reviewer metadata

### `GET /api/v1/admin/metrics`

Responsibilities:

- aggregate recent moderation runs
- report provider usage and quality metrics

## Metrics Scope

### First-version metrics

- `NVIDIA` usage count
- `OpenRouter` usage count
- success count / rate
- average `latency_ms`
- manual-review ratio
- error / timeout count

### Calculation source

- aggregate from `moderation_runs`
- derive queue ratio from `posts.status`

### Time window

- first version can default to recent 7 days

## Page Layout

### Summary cards

Top row cards for:

- provider requests
- success rate
- average latency
- manual-review ratio

### Search and filters

- keyword search for post id or content excerpt
- status dropdown
- provider dropdown
- decision dropdown

### Moderation list

Each row/card should show:

- post id
- content excerpt
- current status
- moderation path
- provider attempts summary
- latency / error / confidence summary
- action buttons:
  - `核准`
  - `拒絕`

## Security Boundaries

- all admin APIs must verify both session and admin role
- do not expose full raw provider payloads in the dashboard
- do not expose secrets or internal provider auth details
- keep service-role usage on the server only
- return user-friendly error responses without leaking internals

## UI Direction

- keep the warm palette of the public site
- make the admin view denser and more operational, but not harsh or clinical
- optimize for scan speed and moderation efficiency
- mobile support should preserve core readability and actions, even if the layout stacks vertically

## Testing Scope

### Auth tests

- unauthenticated admin access redirects or rejects
- non-admin authenticated access returns `403`
- admin access succeeds

### Queue tests

- search works
- filters work
- moderation actions update stored state

### Metrics tests

- provider counts
- success/error/manual-review aggregations
- average latency calculation

### UI tests

- login page renders
- queue page renders summary cards and controls
- moderation actions are visible only in the protected admin flow

## Final Recommendation

Build a secure first-version admin backend with `Supabase Auth + admin_users`, a protected `/admin/login`, and a consolidated `/admin/queue` page that combines moderation actions and AI usage metrics.

This gives the project an operationally useful backend without over-expanding the architecture before the moderation workflow matures further.
