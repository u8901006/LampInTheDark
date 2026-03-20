# Anonymous Write Page Design

## Context

The public production site currently exposes only a marketing-style homepage and an admin queue page.
Anonymous post submission is available only through `POST /api/v1/posts`, which means end users have no visible browser UI for writing or sending a message.

The approved direction is:

- keep the homepage lightweight
- add a clear homepage CTA
- route users to a dedicated anonymous submission page
- change public-facing UI copy to Traditional Chinese

## Goal

Introduce a Traditional Chinese anonymous submission experience that lets visitors move from the homepage to a dedicated `/write` page and send a post through the existing moderation pipeline.

## Decision Summary

### Recommended approach

Use a two-step public flow:

1. Homepage (`/`) explains the platform and offers a primary CTA: `匿名留言`
2. Dedicated write page (`/write`) presents the full anonymous submission form

### Why this approach

- preserves homepage clarity and emotional calm
- gives the form enough space for supportive copy and clear validation
- avoids crowding the landing page with a full textarea and stateful submission UI
- fits naturally with the current site structure, which is still small and easy to reason about

### Rejected alternatives

- embedding the whole form directly on the homepage
  - faster access, but reduces homepage clarity and increases visual density
- adding a modal before navigating to a form page
  - introduces extra friction without clear first-version value

## Information Architecture

### `/`

- keeps the current platform introduction
- replaces English-facing public copy with Traditional Chinese
- includes a primary CTA: `匿名留言`
- links directly to `/write`

### `/write`

- dedicated anonymous submission page
- Traditional Chinese title, helper copy, and validation text
- focused on one task: writing and submitting a post safely

### `/admin/queue`

- remains admin-facing only
- no public navigation toward this route

## Form Design

### Required visible fields

- `content`
  - multiline textarea
  - primary user input
- `emotionTags`
  - small selectable list of emotional states
  - examples: `悲傷`, `焦慮`, `憤怒`, `壓力`, `希望`

### Hidden/generated values

- `deviceFingerprintHash`
  - generated client-side
  - not shown to the user

### Submission action

- button label: `送出匿名留言`
- disabled while submitting
- loading state must be visible and understandable in Traditional Chinese

## Copy And Language

All public-facing UI added or touched by this feature should use Traditional Chinese.

Examples:

- homepage CTA: `匿名留言`
- page title: `匿名留言`
- helper text: `你的內容會先進行審核，再決定是否公開顯示。`
- validation error: `請輸入留言內容。`
- failure message: `送出失敗，請稍後再試。`

Admin-facing copy can remain as-is for now unless touched by this change.

## Submission States

### Successful accepted response

- show a calm success state in Traditional Chinese
- example: `留言已收到。`

### Manual review response

- show a non-alarming review state
- example: `留言已收到，正在審核中。`

### Crisis response

- show a more supportive and careful message
- avoid technical labels or provider names

### Error response

- show a user-friendly retry message
- do not expose raw API or moderation internals

## Technical Boundaries

### Reuse

- keep the existing `POST /api/v1/posts` API contract
- keep the existing moderation orchestrator and persistence logic
- keep the existing admin queue behavior unchanged

### Avoid in version 1

- user accounts
- public post feed
- editing or deleting posts from the browser
- multi-step onboarding
- overbuilt rich text or attachments

## Component Plan

### Existing files to modify

- `app/page.tsx`
- `app/globals.css`

### New files likely needed

- `app/write/page.tsx`
- `components/post/anonymous-post-form.tsx`
- `components/post/emotion-tag-selector.tsx`
- `components/post/submission-result.tsx`

If the codebase prefers fewer files for a first version, the form can begin inside `app/write/page.tsx` and split later if it grows.

## Testing Scope

### User-facing tests

- homepage CTA links to `/write`
- `/write` renders Traditional Chinese copy
- form validation messages appear in Traditional Chinese
- successful submit state renders correctly
- manual review state renders correctly

### Regression checks

- existing `POST /api/v1/posts` tests remain green
- existing `GET /api/v1/admin/queue` tests remain green
- full `npm test` remains green
- `npm run build` remains green

## Accessibility And UX Notes

- labels and button text must be readable in Traditional Chinese
- keep focus states visible
- preserve keyboard submission flow
- ensure textarea and buttons remain usable on mobile screens
- keep visual tone warm, quiet, and non-clinical

## Final Recommendation

Implement a Traditional Chinese public writing flow with:

- homepage CTA on `/`
- dedicated `/write` page for anonymous submission
- concise and emotionally safe validation/success states
- zero change to the existing moderation backend contract

This is the highest-value first step because it turns the current API-only submission capability into an actual end-user feature without expanding the system beyond its current maturity.
