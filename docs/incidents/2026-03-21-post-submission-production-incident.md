# Production Incident: Post Submission and Public Post APIs

## Summary

On 2026-03-21, the production site showed `送出失敗，請稍後再試` for anonymous submissions and returned `500` for public post read endpoints.

## Impact

- Users could not reliably submit valid anonymous posts.
- `GET /api/v1/posts` returned `500`.
- `GET /api/v1/posts/[trackingCode]` returned `500`.
- Short invalid submissions showed an unhelpful generic error message.

## Root Causes

### 1. Frontend/backend validation mismatch

- Frontend only checked for non-empty content.
- Backend required post content length to be at least 10 characters.
- Result: short submissions reached the API and came back as a generic validation failure.

### 2. Production deployment lag

- The custom domain was still serving an older Vercel production deployment.
- New routes such as `/posts`, `/my-post`, and `/api/v1/posts/[trackingCode]` were not yet active on the live site.

### 3. Production database schema drift

- Production Supabase had not yet applied all required migrations.
- Missing `tracking_code` caused public feed and tracking lookup failures.
- Missing `reviewed_at`, `reviewed_by`, and `review_note` caused valid post submission failures.

### 4. Production secrets were incomplete

- Vercel production was missing server-side secrets needed by runtime code:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NVIDIA_API_KEY`
  - `OPENROUTER_API_KEY`

## Evidence Collected

- Production `POST /api/v1/posts` returned `422` with generic validation message for short content.
- Production `GET /api/v1/posts` initially returned `405`, proving the site was still on an older deployment.
- Vercel deployment logs showed an older route list without `/posts` and `/my-post`.
- Supabase REST checks returned:
  - `column posts.tracking_code does not exist`
  - `column posts.review_note does not exist`
- Vercel runtime logs showed:
  - `Could not find the 'review_note' column of 'posts' in the schema cache`

## Fixes Applied

### Application fixes

- Aligned frontend and backend validation for minimum post length.
- Replaced generic validation failure text with `留言內容至少需要 10 個字。`

### Deployment fixes

- Redeployed the latest `main` branch to `lampinthedark-prod`.
- Verified the live homepage exposed `/posts` and `/my-post`.

### Environment fixes

- Added required production secrets to Vercel.
- Confirmed the production project was `lampinthedark-prod` under `cy-lees-projects`.

### Database fixes

- Applied the `tracking_code` migration to production.
- Applied the admin review metadata migration to production.

## Final Verification

- `GET /api/v1/posts` -> `200 OK`
- `GET /api/v1/posts/[trackingCode]` -> `404 Not Found` for unknown code, which is correct behavior
- `POST /api/v1/posts` with valid content -> `201 Created`
- `POST /api/v1/posts` with short content -> `422` and correct user-facing validation message

## Preventive Actions

- Always verify that production Vercel aliases point to the latest intended deployment.
- Always verify production environment variables before deploy.
- Always apply all Supabase migrations before production deploy.
- Add a production smoke test that checks:
  - `POST /api/v1/posts`
  - `GET /api/v1/posts`
  - `GET /api/v1/posts/[trackingCode]`
- Consider reducing public read runtime coupling so public APIs do not require unrelated moderation provider secrets.
