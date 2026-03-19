# Deployment Checklist

## Pre-Deploy

- Confirm `npm test` passes
- Confirm `npm run build` passes
- Confirm Vercel production environment variables are populated
- Confirm the target Supabase Cloud project is the intended production project
- Back up production data before schema changes
- Review the migration SQL that will be applied

## Deploy

1. Apply production migrations to Supabase Cloud
2. Trigger or confirm Vercel production deployment from `main`
3. Watch Vercel deployment logs for runtime or build failures
4. Run the smoke test against the production URL
5. Confirm `POST /api/v1/posts` and `GET /api/v1/admin/queue` respond successfully

## Rollback

- Roll back the application in Vercel to the previous successful deployment
- Pause any further production migration changes until the incident is understood
- Only perform database rollback if a safe, validated manual rollback path exists
- Re-run smoke tests after rollback
