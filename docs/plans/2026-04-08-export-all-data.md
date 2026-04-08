# Export All Data Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add homepage buttons that export all locally stored data as downloadable TXT and JSON files.

**Architecture:** Keep export logic browser-only. Read the five existing `localStorage` keys into one snapshot object, then generate either raw JSON or a human-readable TXT string and download it via `Blob`.

**Tech Stack:** Next.js App Router, React client components, TypeScript, browser `localStorage`, `Blob`, `URL.createObjectURL`

---

### Task 1: Build export helpers

**Files:**
- Modify: `lib/storage.ts`
- Create: `lib/export.ts`

**Step 1: Add snapshot reading helper**
- Expose a helper that returns all current local data in one object.

**Step 2: Add TXT formatter**
- Convert emergency plan, timeline, sleep diary, daily diary, and weekly diary into one readable plain-text document.

**Step 3: Add download helper**
- Create a browser-only function that downloads a given string as a file.

### Task 2: Add homepage export controls

**Files:**
- Modify: `app/page.tsx`

**Step 1: Add export buttons**
- Add `匯出 TXT` and `匯出 JSON` buttons near the homepage heading.

**Step 2: Wire button behavior**
- TXT button downloads `lampinthedark-export.txt`.
- JSON button downloads `lampinthedark-export.json`.

**Step 3: Handle empty state**
- Still allow export when there is no data.

### Task 3: Verify behavior

**Files:**
- No permanent files required

**Step 1: Run build**
- Run: `npm run build`

**Step 2: Verify in browser**
- Confirm both buttons appear.
- Confirm TXT and JSON download.
- Confirm exported files contain stored data.
