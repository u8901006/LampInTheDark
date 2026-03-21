# Release: Write Flow UX Improvement

## Summary

This release improves the anonymous writing experience by making emotional tagging easier to scan, clarifying what happens after submission, and giving users obvious next-step navigation without leaving the write page.

## Added

- Emoji-assisted emotion tags on the write form
- A full completion card after successful submission
- Clear post-submission actions:
  - return home
  - view public posts
  - check my post
  - write another post

## Changed

- The `/write` flow now stays on the same page after submission
- Successful submission replaces the form area with a guided completion experience
- Emotion selection is now capped at 5 tags to match backend validation
- Form inputs are locked during submission to avoid accidental mid-submit edits

## User Impact

- Users no longer get stuck after submitting a post
- Returning to the homepage is now obvious
- Emotional tagging is faster and more expressive
- The write flow feels more guided and complete

## Verification

- `npm test`
- `npm run build`
- Production deployment verified on `https://www.leepsyclinic.uk/write`
