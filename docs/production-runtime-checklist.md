# Production Runtime Checklist

## Vercel Project

- Confirm the intended project is `lampinthedark-prod`
- Confirm the production domain aliases include:
  - `https://leepsyclinic.uk`
  - `https://www.leepsyclinic.uk`
- Confirm the deployment being aliased is the latest intended `main`

## Required Vercel Production Environment Variables

### Public

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Server-only

- `SUPABASE_SERVICE_ROLE_KEY`
- `NVIDIA_API_KEY`
- `NVIDIA_MODERATION_MODEL`
- `ZHIPU_API_KEY`
- `ZHIPU_MODERATION_MODEL` (defaults to `glm-5-turbo`)
- `MODERATION_FALLBACK_ENABLED`

## Required Supabase Production Migrations

- `supabase/migrations/20260320_add_admin_users.sql`
- `supabase/migrations/20260320_add_post_tracking_codes.sql`

## Pre-Deploy Checks

- `npm test`
- `npm run build`
- Verify Vercel production env vars are populated
- Verify Supabase production project is the intended one
- Verify all required migrations are applied before deploy

## Post-Deploy Smoke Tests

- Homepage loads and shows expected latest links
- `GET /api/v1/posts` returns `200`
- `GET /api/v1/posts/[trackingCode]` returns `404` for an unknown code
- `POST /api/v1/posts` with short content returns `422` and user-readable validation text
- `POST /api/v1/posts` with valid content returns `201`
- `/posts` page loads
- `/my-post` page loads

## If Production Fails

- Check whether the aliased deployment is actually the latest deployment
- Check Vercel runtime logs for `500` responses
- Check whether server-side env vars are missing or empty
- Probe Supabase REST directly for missing columns used by the failing endpoint
- Confirm the latest migration files have been applied to production
