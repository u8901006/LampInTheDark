# Release: Admin Moderation Dashboard

## Summary

This release adds a protected admin moderation backend for LampInTheDark, including authenticated admin access, moderation actions, queue filtering, and AI moderation metrics.

## Added

- Protected admin login page at `/admin/login`
- Protected moderation dashboard at `/admin/queue`
- Admin APIs for login, moderation queue, post review actions, and metrics
- Supabase-based admin authorization via `admin_users`
- Review metadata support on posts: `reviewed_at`, `reviewed_by`, `review_note`
- Dashboard UI components for metrics cards, queue filters, and moderation actions

## Improved

- Queue filtering now supports status, provider, decision, and keyword search
- Login flow now supports browser form submission with redirect-based success/failure handling
- Metrics now use a recent 7-day moderation window consistently
- Queue query matching is aligned for case-insensitive content search

## Testing

- Added admin auth coverage
- Added login route and login page coverage
- Added queue API and dashboard UI coverage
- Added metrics aggregation coverage
- Added migration coverage for admin schema changes
- Verified with:
  - `npm test`
  - `npm run build`

## Technical Notes

- Admin access is enforced through Supabase Auth plus `admin_users`
- Admin queue and metrics are server-protected routes
- PR merged to `main` with merge commit `849aaea`
