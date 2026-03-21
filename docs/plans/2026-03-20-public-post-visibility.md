# Public Post Visibility Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a public approved-post feed and an anonymous tracking-code lookup flow so users can read approved posts and check their own submission status.

**Architecture:** Extend the `posts` data model with a server-generated `tracking_code`, keep public reads limited to `APPROVED` posts, and add a dedicated owner-side lookup API keyed by tracking code. Reuse the current write flow, then add two small App Router pages for public feed and personal status lookup.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Supabase-backed repository layer, Vitest.

---

### Task 1: Add tracking code to the post schema

**Files:**
- Create: `supabase/migrations/20260320_add_post_tracking_codes.sql`
- Modify: `supabase/types.ts`
- Modify: `lib/posts/store.ts`
- Test: `tests/supabase/migrations/add-post-tracking-codes.test.ts`

**Step 1: Write the failing migration test**

Add a test that reads `supabase/migrations/20260320_add_post_tracking_codes.sql` and expects:
- `tracking_code` column on `posts`
- unique index on `tracking_code`

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/supabase/migrations/add-post-tracking-codes.test.ts`
Expected: FAIL because the migration file does not exist yet.

**Step 3: Write the migration**

Create a migration that:
- adds `tracking_code text` to `posts`
- backfills existing rows if needed with a safe placeholder strategy or generated value strategy appropriate to this project
- sets `tracking_code` to not null after backfill
- adds a unique index on `tracking_code`

**Step 4: Update TypeScript types**

Add `tracking_code` to `supabase/types.ts` and `trackingCode` to in-memory/store types in `lib/posts/store.ts`.

**Step 5: Run test to verify it passes**

Run: `npm test -- --run tests/supabase/migrations/add-post-tracking-codes.test.ts`
Expected: PASS

### Task 2: Persist and query tracking codes in the repository

**Files:**
- Modify: `lib/posts/repository.ts`
- Modify: `lib/posts/store.ts`
- Test: `tests/lib/posts/repository.test.ts`

**Step 1: Write the failing repository tests**

Add tests for:
- saving a post persists `trackingCode`
- looking up one post by tracking code returns the expected record
- listing public posts returns only approved posts ordered newest first

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/lib/posts/repository.test.ts`
Expected: FAIL because repository methods/fields do not exist yet.

**Step 3: Write minimal repository changes**

Extend the repository with methods such as:
- `findPostByTrackingCode(trackingCode)`
- `listPublicPosts()`

Ensure:
- `savePost()` writes `trackingCode`
- public listing filters by `APPROVED`
- tracking lookup returns one post with safe mapped fields

**Step 4: Run repository tests**

Run: `npm test -- --run tests/lib/posts/repository.test.ts`
Expected: PASS

### Task 3: Return a tracking code from post submission

**Files:**
- Modify: `app/api/v1/posts/route.ts`
- Modify: `lib/posts/runtime.ts` if needed
- Test: `tests/app/api/v1/posts/route.test.ts`

**Step 1: Write the failing API test**

Add a test expecting `POST /api/v1/posts` to return:
- `success: true`
- moderation status
- `trackingCode`

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/app/api/v1/posts/route.test.ts`
Expected: FAIL because no tracking code is returned yet.

**Step 3: Implement minimal submission change**

Generate a tracking code on the server during post creation and include it in the persisted post and API response.

**Step 4: Re-run the API test**

Run: `npm test -- --run tests/app/api/v1/posts/route.test.ts`
Expected: PASS

### Task 4: Add tracking-code lookup API

**Files:**
- Create: `app/api/v1/posts/[trackingCode]/route.ts`
- Test: `tests/app/api/v1/posts/tracking-code-route.test.ts`

**Step 1: Write the failing route tests**

Add tests for:
- valid tracking code returns the post
- unknown tracking code returns `404`
- invalid format returns `422`

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/app/api/v1/posts/tracking-code-route.test.ts`
Expected: FAIL because the route does not exist yet.

**Step 3: Implement minimal route**

Create the route handler using the repository lookup method and return only owner-safe fields.

**Step 4: Re-run the route tests**

Run: `npm test -- --run tests/app/api/v1/posts/tracking-code-route.test.ts`
Expected: PASS

### Task 5: Add public approved-post feed API behavior

**Files:**
- Modify: `app/api/v1/posts/route.ts`
- Test: `tests/app/api/v1/posts/next-route.test.ts`

**Step 1: Write the failing public feed test**

Add a test for `GET /api/v1/posts` expecting only approved posts to be returned.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/app/api/v1/posts/next-route.test.ts`
Expected: FAIL if current GET behavior does not filter correctly or does not expose the desired shape.

**Step 3: Implement minimal API update**

Update GET handling to use the public repository method and return only public-safe fields.

**Step 4: Re-run the test**

Run: `npm test -- --run tests/app/api/v1/posts/next-route.test.ts`
Expected: PASS

### Task 6: Show tracking code on the write page

**Files:**
- Modify: `components/post/anonymous-post-form.tsx`
- Modify: `components/post/submission-result.tsx` if needed
- Test: `tests/components/post/anonymous-post-form.test.tsx`

**Step 1: Write the failing component test**

Add a test expecting a successful submission to render the returned `trackingCode` and a link to `/my-post`.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/components/post/anonymous-post-form.test.tsx`
Expected: FAIL because tracking code UI does not exist yet.

**Step 3: Implement minimal UI change**

Store returned `trackingCode` in component state and render a small result panel after success.

**Step 4: Re-run the component test**

Run: `npm test -- --run tests/components/post/anonymous-post-form.test.tsx`
Expected: PASS

### Task 7: Add the my-post lookup page

**Files:**
- Create: `app/my-post/page.tsx`
- Create: `components/post/post-lookup-form.tsx`
- Test: `tests/app/my-post/page.test.tsx`

**Step 1: Write the failing page test**

Add a test expecting `/my-post` to render:
- tracking code input
- submit button
- lookup helper copy

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/app/my-post/page.test.tsx`
Expected: FAIL because the page does not exist yet.

**Step 3: Implement minimal page and client form**

Build a simple query UI that calls `/api/v1/posts/[trackingCode]` and renders the result or error.

**Step 4: Re-run the page test**

Run: `npm test -- --run tests/app/my-post/page.test.tsx`
Expected: PASS

### Task 8: Add the public posts page

**Files:**
- Create: `app/posts/page.tsx`
- Create: `components/post/public-post-list.tsx`
- Test: `tests/app/posts/page.test.tsx`

**Step 1: Write the failing page test**

Add a test expecting `/posts` to render a public approved-post feed heading and at least one rendered post item from mocked data.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/app/posts/page.test.tsx`
Expected: FAIL because the page does not exist yet.

**Step 3: Implement minimal public feed page**

Create a server-rendered page that fetches approved posts through the repository or API and renders them newest first.

**Step 4: Re-run the page test**

Run: `npm test -- --run tests/app/posts/page.test.tsx`
Expected: PASS

### Task 9: Update navigation and user guidance

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/write/page.tsx` if needed
- Test: `tests/app/write/page.test.tsx`

**Step 1: Write the failing UI test**

Update or add a test expecting the frontend to expose links to public reading and/or lookup flow.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/app/write/page.test.tsx`
Expected: FAIL if links or copy are not present.

**Step 3: Implement minimal copy/navigation changes**

Add links such as:
- homepage to `/posts`
- write success UI to `/my-post`

**Step 4: Re-run the UI test**

Run: `npm test -- --run tests/app/write/page.test.tsx`
Expected: PASS

### Task 10: Full verification

**Files:**
- Verify only

**Step 1: Run focused new-feature tests**

Run:
`npm test -- --run tests/supabase/migrations/add-post-tracking-codes.test.ts tests/lib/posts/repository.test.ts tests/app/api/v1/posts/route.test.ts tests/app/api/v1/posts/tracking-code-route.test.ts tests/app/api/v1/posts/next-route.test.ts tests/components/post/anonymous-post-form.test.tsx tests/app/my-post/page.test.tsx tests/app/posts/page.test.tsx tests/app/write/page.test.tsx`

Expected: PASS

**Step 2: Run full test suite**

Run: `npm test`
Expected: PASS

**Step 3: Run production build**

Run: `npm run build`
Expected: PASS

**Step 4: Commit**

```bash
git add app components lib supabase tests docs/plans
git commit -m "feat(posts): add public feed and tracking lookup"
```
