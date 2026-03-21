# Write Flow UX Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve the `/write` page with a richer emoji emotion selector and an in-place completion experience that gives users clear next steps after submission.

**Architecture:** Keep the existing `/write` route and submission API, but convert the client-side form into a small state machine with two primary UI modes: writing and completed. Expand the emotion selector data model to richer emoji-assisted tags and update the submission result area into a full completion card with navigation actions.

**Tech Stack:** Next.js App Router, React 19, TypeScript, existing client components, Vitest.

---

### Task 1: Expand the emotion tag model

**Files:**
- Modify: `components/post/emotion-tag-selector.tsx`
- Test: `tests/components/post/emotion-tag-selector.test.tsx`

**Step 1: Write the failing test**

Add a test that expects the selector to render the new emoji-assisted tag set, including examples like `😢 悲傷`, `😰 焦慮`, and `🙂 希望`.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/components/post/emotion-tag-selector.test.tsx`
Expected: FAIL because the old 5-tag list is still present.

**Step 3: Write minimal implementation**

Replace the old tag list with the approved 12-item emoji + text list while preserving button semantics and selection behavior.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/components/post/emotion-tag-selector.test.tsx`
Expected: PASS

### Task 2: Turn submission result into a full completion card

**Files:**
- Modify: `components/post/submission-result.tsx`
- Test: `tests/components/post/submission-result.test.tsx`

**Step 1: Write the failing test**

Add a test expecting the result component, when given a success state and tracking code, to render:
- status copy
- tracking code
- `回首頁`
- `查看公開留言`
- `查詢我的留言`
- `再寫一則`

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/components/post/submission-result.test.tsx`
Expected: FAIL because the current component only renders a small note and one lookup link.

**Step 3: Write minimal implementation**

Refactor the result component into a completion card UI with the approved action set. Keep state-specific copy for `APPROVED`, `MANUAL_REVIEW`, `CRISIS`, and `ERROR`.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/components/post/submission-result.test.tsx`
Expected: PASS

### Task 3: Replace the form with the completion card after success

**Files:**
- Modify: `components/post/anonymous-post-form.tsx`
- Test: `tests/components/post/anonymous-post-form.test.tsx`

**Step 1: Write the failing test**

Add a test for the completed state expecting the form area to switch into a completion experience rather than keeping the input form visible after success.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/components/post/anonymous-post-form.test.tsx`
Expected: FAIL because the current component always renders the form and appends the result below it.

**Step 3: Write minimal implementation**

Introduce a simple UI branch:
- writing mode shows textarea + emotion selector + submit button
- completed mode shows the completion card only

Keep `ERROR` in writing mode so users do not lose their content.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/components/post/anonymous-post-form.test.tsx`
Expected: PASS

### Task 4: Implement the `再寫一則` reset action

**Files:**
- Modify: `components/post/anonymous-post-form.tsx`
- Modify: `components/post/submission-result.tsx`
- Test: `tests/components/post/anonymous-post-form.test.tsx`

**Step 1: Write the failing test**

Add a test expecting the completion card reset action to return the component to a clean writing state.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/components/post/anonymous-post-form.test.tsx`
Expected: FAIL because no reset action exists yet.

**Step 3: Write minimal implementation**

Pass a reset callback from the form to the completion card and restore:
- `state = idle`
- cleared `trackingCode`
- empty content
- empty selected tags

**Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/components/post/anonymous-post-form.test.tsx`
Expected: PASS

### Task 5: Improve `/write` page guidance copy

**Files:**
- Modify: `app/write/page.tsx`
- Test: `tests/app/write/page.test.tsx`

**Step 1: Write the failing test**

Add or update a test expecting the `/write` page copy to mention the flow clearly and include a visible path back home and onward navigation in the completed experience.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/app/write/page.test.tsx`
Expected: FAIL if the page copy does not match the new UX expectations.

**Step 3: Write minimal implementation**

Adjust helper copy to support the improved flow without duplicating the completion card actions.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/app/write/page.test.tsx`
Expected: PASS

### Task 6: Full verification

**Files:**
- Verify only

**Step 1: Run focused UX tests**

Run:
`npm test -- --run tests/components/post/emotion-tag-selector.test.tsx tests/components/post/submission-result.test.tsx tests/components/post/anonymous-post-form.test.tsx tests/app/write/page.test.tsx`

Expected: PASS

**Step 2: Run full test suite**

Run: `npm test`
Expected: PASS

**Step 3: Run production build**

Run: `npm run build`
Expected: PASS

**Step 4: Commit**

```bash
git add app components tests docs/plans
git commit -m "feat(write): improve submission flow UX"
```
