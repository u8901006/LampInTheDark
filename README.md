# LampInTheDark

Next.js 15 + Supabase-ready application scaffold for the LampInTheDark moderation fallback design.

## Stack

- Next.js 15 App Router
- React 19
- Supabase client integration
- TypeScript + Vitest

## Environment

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NVIDIA_API_KEY`
- `NVIDIA_MODERATION_MODEL`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `MODERATION_FALLBACK_ENABLED`

## Commands

```bash
npm install
npm test
npm run dev
```

## Production Deployment

The recommended production target is `Vercel` for the app runtime and `Supabase Cloud` for the database.

### Production environment variables

Configure these in Vercel Production:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NVIDIA_API_KEY`
- `NVIDIA_MODERATION_MODEL`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `MODERATION_FALLBACK_ENABLED`

### Release order

Use a migration-first release flow for production:

1. Run `npm test`
2. Run `npm run build`
3. Verify Vercel production secrets are set
4. Apply Supabase Cloud migrations before deploy
5. Deploy to Vercel production
6. Run smoke tests against production

This project intentionally applies `migrations before deploy` so the app never reaches production before `posts` and `moderation_runs` exist.

### Production smoke test

After deployment:

```bash
SMOKE_TEST_BASE_URL=https://your-production-url.vercel.app npm run smoke
```

### Rollback guidance

- Roll back the app first using a previous successful Vercel deployment
- Treat Supabase Cloud schema changes conservatively and prefer backward-compatible migrations
- If moderation providers degrade, route more requests to manual review instead of forcing risky runtime changes

## Local Supabase Workflow

This repo expects local Supabase settings in `supabase/config.toml` and development seed data in `supabase/seed.sql`.

1. Install the Supabase CLI if `supabase --version` is not available on your machine.
2. Start the local stack:

```bash
supabase start
```

3. Apply schema changes from `supabase/migrations`:

```bash
supabase db push
```

4. If you want to rebuild local data from the checked-in seed file, reset the local database:

```bash
supabase db reset
```

5. Run the app against the local stack:

```bash
npm run dev
```

The local Supabase services default to:

- API: `http://127.0.0.1:54321`
- DB: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- Studio: `http://127.0.0.1:54323`

For local app development, put the generated local keys into `.env.local` and keep that file uncommitted.

See also:

- `supabase/config.toml`
- `supabase/seed.sql`
- `docs/deployment-checklist.md`
- `docs/production-env.md`
