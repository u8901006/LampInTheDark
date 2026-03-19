# Production Environment Variables

## Vercel Production

### Public

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Server-only

- `SUPABASE_SERVICE_ROLE_KEY`
- `NVIDIA_API_KEY`
- `NVIDIA_MODERATION_MODEL`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `MODERATION_FALLBACK_ENABLED`

## Notes

- Only `NEXT_PUBLIC_*` values may be exposed to browser code
- Keep server-only keys in Vercel project settings only
- Do not commit `.env.local`
- Rotate provider secrets through Vercel, then redeploy
