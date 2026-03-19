# LampInTheDark Production Deployment Design

## Context

`LampInTheDark` currently runs as a `Next.js 15` application with `Supabase`-backed persistence and moderation flows.
The approved deployment target is **production only**, using **Vercel** for the application runtime and **Supabase Cloud** for the database and related platform services.

The current codebase already includes:

- App Router pages and API routes
- Supabase repository wiring for `posts` and `moderation_runs`
- local `supabase/config.toml`, `seed.sql`, and migrations
- moderation fallback logic: `NVIDIA -> OpenRouter -> MANUAL_REVIEW`

This design defines the production deployment architecture, environment setup, migration order, rollback policy, and go-live verification sequence.

## Goal

Deploy LampInTheDark safely to the cloud with:

- Vercel hosting the production app
- Supabase Cloud hosting the production database
- a conservative release flow where **database migrations are applied before app deployment**
- clear rollback and smoke-test procedures

## Decision Summary

### Recommended approach

Use **Vercel + Supabase Cloud** with a **manual production release sequence**.

Flow:

1. Create a production Supabase Cloud project.
2. Configure production environment variables in Vercel.
3. Apply production database migrations manually.
4. Deploy the application to Vercel production.
5. Run production smoke tests.

### Why this approach

- matches the current `Next.js App Router` hosting model naturally
- avoids unnecessary early-stage operational complexity
- keeps database migration risk explicit and controllable
- allows later evolution to CI-driven migration and deployment after production stabilizes

### Rejected alternatives

- auto-running production migrations on every push to `main`
  - too risky for an early-stage project without proven rollback automation
- manual-only app deployment outside Vercel
  - adds operational burden without clear benefit for the current stack

## Architecture

### Production topology

- **Frontend and API runtime**: `Vercel Production`
- **Database and platform backend**: `Supabase Cloud`
- **Source control**: `GitHub`
- **Deployment source branch**: `main`

### Runtime responsibilities

#### Vercel

- host the `Next.js 15` application
- execute App Router pages and API routes
- store production runtime secrets
- provide deployment rollback to previous successful app versions

#### Supabase Cloud

- host `posts` and `moderation_runs` tables
- manage database credentials and project URL
- serve as the persistence layer for submission and moderation audit data

## Production Environment Variables

### Public variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

These may be exposed to browser code and must contain only client-safe values.

### Server-only variables

- `SUPABASE_SERVICE_ROLE_KEY`
- `NVIDIA_API_KEY`
- `NVIDIA_MODERATION_MODEL`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `MODERATION_FALLBACK_ENABLED=true`

These must exist only in Vercel server/runtime configuration and must never be committed to git.

## Security Controls

- keep all secrets in Vercel environment variable settings, not repository files
- do not commit `.env.local` or any production secret material
- use `NEXT_PUBLIC_*` only for values safe to expose in browser bundles
- restrict Vercel project access to trusted maintainers
- prefer service-role usage only in server-side code paths
- if provider credentials fail, rotate or replace only in environment settings and redeploy

## Release Sequence

### Required order

1. Verify application tests and build locally.
2. Verify production environment variables are present in Vercel.
3. Apply production migrations to Supabase Cloud.
4. Trigger or confirm Vercel production deployment.
5. Run smoke tests against the production URL.

### Why migrations must run first

The application code expects `posts` and `moderation_runs` to exist.
If the app deploys before schema creation, production API requests can fail immediately.

## Production Rollback Strategy

### App rollback

Primary rollback path: **Vercel rollback to the previous successful deployment**.

Use this for:

- broken page rendering
- API logic regressions
- incorrect runtime configuration after correction

### Database rollback

For the initial production phase, do **not** rely on automatic down-migrations.

Use a conservative policy:

- take a backup before production schema changes
- prefer backward-compatible schema changes where possible
- if application logic fails after deploy, rollback the app first before attempting schema reversal

### Operational degradation

If moderation providers become unstable in production:

- keep the application live
- route more traffic to `MANUAL_REVIEW`
- update provider configuration or temporary fallback settings in Vercel

## Production Verification Checklist

### Before deployment

- `npm test` passes
- `npm run build` passes
- migration file set is reviewed
- Vercel production env is complete
- Supabase production project exists and is reachable

### After deployment

- production home page returns successfully
- `POST /api/v1/posts` returns expected success or validation responses
- `GET /api/v1/admin/queue` returns `200`
- Vercel function logs show no obvious runtime failures
- Supabase receives `posts` and `moderation_runs` inserts

### Monitoring focus

- provider timeout rate
- unexpected `MANUAL_REVIEW` spikes
- API `5xx` rate
- Vercel function invocation failures

## Domain Strategy

- initial launch may use the default Vercel domain
- custom domain binding can follow after production stability is confirmed

## Risks

- production env variable mistakes can break server-side moderation or DB access
- migration mistakes can impact production writes immediately
- provider instability may increase manual-review volume
- lack of preview/staging means production-only verification requires disciplined release checks

## Mitigations

- keep `.env.example` aligned with runtime expectations
- use a documented manual release checklist
- apply DB changes before app deploy
- verify production with smoke tests immediately after release
- prefer Vercel rollback over rushed DB rollback when the schema is already compatible

## Final Recommendation

For the current stage of LampInTheDark, use a **production-only Vercel + Supabase Cloud deployment** with:

- manual migration application
- automatic Vercel production deployment from `main`
- strict env management
- Vercel-based app rollback
- production smoke-test verification after every release

This provides the best balance of speed, safety, and operational simplicity for the existing project maturity.
