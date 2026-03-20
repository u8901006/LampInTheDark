# Anonymous Write Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Traditional Chinese anonymous submission flow with a homepage CTA that routes users to a dedicated `/write` page and submits posts through the existing moderation API.

**Architecture:** Keep the existing moderation and persistence layers intact. Add a homepage call-to-action, create a dedicated write page, build a client-side submission form that calls `POST /api/v1/posts`, and render Traditional Chinese validation and result states.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, existing API routes, existing Vitest setup.

---

## 1. Definition Of Done

- Homepage contains a Traditional Chinese CTA linking to `/write`.
- `/write` exists and renders an anonymous post form in Traditional Chinese.
- Form submits to the existing post API.
- Success, manual-review, and error states are shown in Traditional Chinese.
- Existing tests remain green and new UI tests cover the core flow.
- Production build remains green.

## 2. Assumptions And Constraints

- Backend moderation API stays unchanged.
- First version uses only required inputs: post content and emotion tags.
- No login, public feed, or advanced content editor is added.
- UI should preserve the current calm visual direction.

## 3. Risks And Rollback

- Risk: front-end validation drifts from API expectations.
  - Mitigation: reuse the same field constraints conceptually and cover with tests.
- Risk: Traditional Chinese copy becomes inconsistent across pages.
  - Mitigation: update touched public pages together.
- Risk: client submission state becomes tangled in a single large page component.
  - Mitigation: extract focused form/result components if needed.
- Rollback: revert the homepage CTA and `/write` page while leaving backend APIs untouched.

## 4. Task List

### Task 1: Add failing tests for homepage CTA and write page shell

**Files:**
- Create: `tests/app/write/page.test.tsx`
- Modify: `tests/app/api/v1/posts/next-route.test.ts`
- Test: `tests/app/write/page.test.tsx`

**Step 1: Write the failing test**

```tsx
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import HomePage from '@/app/page';
import WritePage from '@/app/write/page';

describe('public anonymous write UI', () => {
  it('shows a Traditional Chinese CTA on the homepage and a write page title', () => {
    const home = renderToStaticMarkup(<HomePage />);
    const write = renderToStaticMarkup(<WritePage />);

    expect(home).toContain('匿名留言');
    expect(home).toContain('/write');
    expect(write).toContain('匿名留言');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/app/write/page.test.tsx`
Expected: FAIL because `/write` page and updated homepage CTA do not exist yet.

**Step 3: Write minimal implementation**

Do not implement yet.

**Step 4: Re-run to verify red state**

Run: `npm test -- --run tests/app/write/page.test.tsx`
Expected: FAIL

**Step 5: Commit**

```bash
git add tests/app/write/page.test.tsx
git commit -m "test(ui): add anonymous write page coverage"
```

### Task 2: Add homepage CTA and `/write` page shell

**Files:**
- Modify: `app/page.tsx`
- Create: `app/write/page.tsx`
- Modify: `app/globals.css`
- Test: `tests/app/write/page.test.tsx`

**Step 1: Run the failing test**

Run: `npm test -- --run tests/app/write/page.test.tsx`
Expected: FAIL because homepage and write page are not updated yet.

**Step 2: Write minimal implementation**

Implement:

- Traditional Chinese homepage copy
- primary CTA linking to `/write`
- a `/write` page shell with title and helper copy
- only minimal CSS updates needed for layout consistency

**Step 3: Run test to verify it passes**

Run: `npm test -- --run tests/app/write/page.test.tsx`
Expected: PASS

**Step 4: Check build impact**

Run: `npm run build`
Expected: PASS

**Step 5: Commit**

```bash
git add app/page.tsx app/write/page.tsx app/globals.css tests/app/write/page.test.tsx
git commit -m "feat(ui): add anonymous write page shell"
```

### Task 3: Add failing tests for form behavior and Traditional Chinese states

**Files:**
- Create: `tests/components/post/anonymous-post-form.test.tsx`
- Test: `tests/components/post/anonymous-post-form.test.tsx`

**Step 1: Write the failing tests**

Cover:

- missing content validation message in Traditional Chinese
- successful submit state
- manual-review submit state

Example assertion targets:

```tsx
expect(markup).toContain('請輸入留言內容');
expect(markup).toContain('留言已收到，正在審核中');
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/components/post/anonymous-post-form.test.tsx`
Expected: FAIL because form component does not exist yet.

**Step 3: Write minimal implementation**

Do not implement yet.

**Step 4: Re-run to confirm red state**

Run: `npm test -- --run tests/components/post/anonymous-post-form.test.tsx`
Expected: FAIL

**Step 5: Commit**

```bash
git add tests/components/post/anonymous-post-form.test.tsx
git commit -m "test(ui): add anonymous post form behavior tests"
```

### Task 4: Implement anonymous post form and result states

**Files:**
- Create: `components/post/anonymous-post-form.tsx`
- Create: `components/post/emotion-tag-selector.tsx`
- Create: `components/post/submission-result.tsx`
- Modify: `app/write/page.tsx`
- Test: `tests/components/post/anonymous-post-form.test.tsx`

**Step 1: Run failing form tests**

Run: `npm test -- --run tests/components/post/anonymous-post-form.test.tsx`
Expected: FAIL because components are missing.

**Step 2: Write minimal implementation**

Implement:

- textarea for `content`
- emotion tag selector
- Traditional Chinese validation
- submit button with loading state
- success/manual-review/error result rendering
- integration with existing `POST /api/v1/posts`

Use a minimal client-side device fingerprint strategy consistent with current backend expectations.

**Step 3: Run test to verify it passes**

Run: `npm test -- --run tests/components/post/anonymous-post-form.test.tsx`
Expected: PASS

**Step 4: Run affected route tests**

Run: `npm test -- --run tests/components/post/anonymous-post-form.test.tsx tests/app/api/v1/posts/route.test.ts tests/app/api/v1/posts/next-route.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add components/post/anonymous-post-form.tsx components/post/emotion-tag-selector.tsx components/post/submission-result.tsx app/write/page.tsx tests/components/post/anonymous-post-form.test.tsx
git commit -m "feat(ui): connect anonymous submission form"
```

### Task 5: Polish public Traditional Chinese copy across touched pages

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/write/page.tsx`
- Modify: `components/post/anonymous-post-form.tsx`
- Test: `tests/app/write/page.test.tsx`
- Test: `tests/components/post/anonymous-post-form.test.tsx`

**Step 1: Add failing copy expectation if needed**

Add explicit assertions for final public-facing Traditional Chinese strings.

**Step 2: Run tests to verify failure**

Run: `npm test -- --run tests/app/write/page.test.tsx tests/components/post/anonymous-post-form.test.tsx`
Expected: FAIL if the final copy is not yet aligned.

**Step 3: Write minimal implementation**

Refine public strings so the user experience feels calm, direct, and fully Traditional Chinese.

**Step 4: Run tests to verify pass**

Run: `npm test -- --run tests/app/write/page.test.tsx tests/components/post/anonymous-post-form.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add app/page.tsx app/write/page.tsx components/post/anonymous-post-form.tsx tests/app/write/page.test.tsx tests/components/post/anonymous-post-form.test.tsx
git commit -m "feat(ui): localize anonymous posting flow"
```

### Task 6: Final verification

**Files:**
- Test: `tests/**`

**Step 1: Run focused verification for the new feature**

Run: `npm test -- --run tests/app/write/page.test.tsx tests/components/post/anonymous-post-form.test.tsx tests/app/api/v1/posts/route.test.ts tests/app/api/v1/posts/next-route.test.ts`
Expected: PASS

**Step 2: Run full test suite**

Run: `npm test`
Expected: PASS

**Step 3: Run production build check**

Run: `npm run build`
Expected: PASS

**Step 4: Manual browser verification checklist**

Confirm:

- homepage CTA leads to `/write`
- `/write` is readable on mobile and desktop
- empty submit shows Traditional Chinese validation
- successful submit shows the correct state text

**Step 5: Commit**

```bash
git add app components tests
git commit -m "test(ui): verify anonymous write flow"
```
