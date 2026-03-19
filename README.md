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
