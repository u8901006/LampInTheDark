# Write Flow UX Design

## Goal

Improve the `/write` experience so users can complete the anonymous posting flow smoothly, understand emotional tagging faster, and always see a clear next step after submission.

## Product Decisions

- Keep the user on `/write` after submission.
- Replace the form area with a completion card after a successful submission instead of redirecting to a different page.
- Expand the emotion options from a small text-only set to a richer emoji-assisted selection list.
- Add strong next-step navigation inside the completion state, including a clear way back to the homepage.

## Recommended Interaction Model

Use an in-place state transition on the existing `/write` page.

This keeps the experience fast and emotionally gentle. A user writes, submits, and immediately sees a stable completion state without page navigation or context loss. The completion card becomes the handoff point for the next action: return home, browse public posts, check personal post status, or start over.

## User Flow

### 1. Writing state

The user opens `/write` and sees:

- a short explanation of moderation and privacy
- a textarea for the post body
- a richer emoji-based emotion selector
- validation that is readable and immediate

### 2. Submission state

When the user submits:

- the submit button enters loading state
- the request is posted to `/api/v1/posts`
- the form content is locked during submission

### 3. Completion state

When submission succeeds:

- the form area is replaced by a completion card
- the card shows the moderation outcome
- the card shows the tracking code prominently
- the card shows 4 next actions:
  - return home
  - view public posts
  - check my post
  - write another post

### 4. Retry / error state

If submission fails:

- keep the form visible
- preserve user content and selected emotion tags
- show a clear error state without losing work

## Emotion Tag Design

Replace the current 5-item text-only set with a richer 12-item emoji-assisted list.

### Proposed set

- `😢 悲傷`
- `😞 失落`
- `😔 孤單`
- `😐 麻木`
- `😰 焦慮`
- `😣 壓力`
- `😡 憤怒`
- `😕 困惑`
- `🥺 委屈`
- `🙂 希望`
- `🙏 感激`
- `😌 放鬆`

### Why this set

- broad enough to capture common emotional states
- compact enough to avoid decision fatigue
- emoji improves scanning and lowers cognitive friction
- keeps a balanced mix of distress and recovery-oriented states

## UI Structure

### Writing state

- page heading and short helper text
- short note explaining the tracking code and later lookup
- textarea
- emotion chip grid with emoji + Chinese label
- validation feedback under each field
- primary submit button

### Completion card

- status title based on outcome
- supportive explanatory copy
- highlighted tracking code block
- action buttons:
  - `回首頁`
  - `查看公開留言`
  - `查詢我的留言`
  - `再寫一則`

## State Behavior

### Success and manual review

- swap the form for the completion card
- keep the page location unchanged
- show the same action set for both states

### Crisis

- still use the completion card layout
- prioritize safety-oriented text
- keep the same navigation actions available

### Write another post

- reset the completion state
- return to an empty form
- clear the old tracking code from the visible state

## Accessibility and UX Notes

- keep emotion chips keyboard-focusable buttons
- maintain clear focus styling for chip selection and action buttons
- ensure emoji is paired with readable text, never emoji-only
- preserve reduced-motion friendly behavior
- ensure action buttons stack cleanly on mobile

## Out of Scope

- separate success page
- save draft behavior
- localStorage persistence for unfinished writing
- grouped accordion emotion categories
- analytics instrumentation

## Testing Strategy

- validate that the expanded emotion list renders correctly
- validate the completion card replaces the form after success
- validate the card contains `回首頁`, `查看公開留言`, `查詢我的留言`, and `再寫一則`
- validate `再寫一則` returns the UI to the writing state
