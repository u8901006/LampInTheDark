# Public Post Visibility Design

## Goal

Add a safe public reading experience for approved anonymous posts, while giving each submitter an anonymous way to check their own post status with a tracking code.

## Product Decision

- Only `APPROVED` posts are visible on the public frontend.
- Users do not log in to view their own submission status.
- Each submitted post receives a unique `trackingCode`.
- Users can use that tracking code on a dedicated query page to view their own post.
- Admin moderation flow remains unchanged and continues to operate through the protected admin dashboard.

## Recommended Approach

Use a server-generated tracking code stored on each post record.

This keeps the public flow anonymous, avoids device fingerprint coupling, and allows a user to recover their submission status across devices if they save the tracking code. The frontend may optionally store the code in local browser storage for convenience, but the tracking code remains the real source of truth.

## User Flows

### 1. Submit anonymous post

1. User opens `/write`.
2. User submits content and emotion tags.
3. Backend creates the post, assigns a `trackingCode`, and runs moderation.
4. Frontend shows:
   - submission result status
   - tracking code
   - link to `/my-post`

### 2. Check my post

1. User opens `/my-post`.
2. User enters the tracking code.
3. Frontend calls a dedicated lookup endpoint.
4. If found, frontend shows the post content and moderation status.
5. If not found, frontend shows a safe error message.

### 3. Read public posts

1. User opens `/posts`.
2. Frontend loads a list of approved posts only.
3. User sees a public feed ordered by newest first.

## Data Model

Add `tracking_code` to `posts`.

### Requirements

- string value generated on the server
- unique index in the database
- difficult to guess in practice
- available in API responses only where appropriate

### Example shape

- `tracking_code`: `AB12CD34EF56`

## Public Data Exposure Rules

### Public feed (`/posts`)

Expose only safe fields:

- `id`
- `content`
- `emotionTags`
- `createdAt`

Do not expose:

- `trackingCode`
- `deviceFingerprintHash`
- `reviewedBy`
- internal moderation metadata not needed by public readers

### My post lookup (`/my-post`)

Expose:

- `trackingCode`
- `content`
- `emotionTags`
- `status`
- `createdAt`
- optionally a minimal user-facing moderation summary

Do not expose internal reviewer identity or raw internal moderation data.

## Routes and API Design

### Pages

- `/write`
  - existing submission page
  - updated to display tracking code after successful submission
- `/my-post`
  - new page with tracking code input and result view
- `/posts`
  - new public approved-post feed

### APIs

- `POST /api/v1/posts`
  - keep existing submission behavior
  - extend response with `trackingCode`
- `GET /api/v1/posts`
  - return approved posts only
- `GET /api/v1/posts/[trackingCode]`
  - return one post by tracking code for owner-side lookup
  - `404` if not found
  - `422` if the tracking code format is invalid

## UI Notes

### `/write`

- keep current moderation result messaging
- add a visible tracking code panel after successful submission
- include copy-friendly text and a link to `/my-post`

### `/my-post`

- simple single-field form for tracking code
- result card shows post content and status
- errors should be phrased gently and clearly

### `/posts`

- simple list of approved posts
- newest first
- no search, pagination, reactions, or detail page in this phase

## Error Handling

- Invalid tracking code format: show validation error before or after request
- Unknown tracking code: show not found message without leaking system details
- Submission failure: keep existing failure messaging on `/write`
- Public feed failure: show retry-friendly fallback state

## Security and Privacy

- Tracking codes must be server-generated, not client-generated.
- Public feed must never include non-approved posts.
- Owner lookup must be keyed only by tracking code.
- Avoid exposing device fingerprint or reviewer identity in public-facing APIs.
- Keep admin review actions fully separate from public reading flows.

## Testing Strategy

- repository tests for tracking code persistence and lookup
- API tests for:
  - submission returning tracking code
  - public feed returning only approved posts
  - tracking-code lookup success / 404 / 422
- page tests for:
  - `/write` success state rendering tracking code
  - `/my-post` query form and result rendering
  - `/posts` approved feed rendering

## Out of Scope

- authenticated user accounts for submitters
- per-user multi-post history dashboard
- public post detail pages
- search/filter on the public feed
- reactions, comments, or sharing features
