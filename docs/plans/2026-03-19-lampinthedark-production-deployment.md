# LampInTheDark Production Deployment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prepare LampInTheDark for production-only deployment on Vercel with Supabase Cloud, including environment configuration, release workflow documentation, and deploy-time verification assets.

**Architecture:** The Next.js application remains deployed on Vercel while Supabase Cloud provides the production database. Production releases follow a conservative order: verify code, confirm secrets, apply migrations to Supabase, deploy the app to Vercel, then run smoke tests and observe logs.

**Tech Stack:** Next.js 15, React 19, TypeScript, Supabase Cloud, Vercel, GitHub.

---

## 1. Definition Of Done

- Production deployment docs describe Vercel + Supabase Cloud setup.
- `.env.example` and docs align with required production variables.
- A deployment checklist exists for migration-first production releases.
- A smoke-test command set or script exists for post-deploy verification.
- Project docs explain rollback strategy and operator workflow.
- All tests still pass and the app still builds.

## 2. Assumptions And Constraints

- Target environment is production only; no preview/staging work is included.
- Production secrets will be entered manually in Vercel or platform UI, not committed.
- Database migrations remain manually applied for now.
- Work must not introduce destructive git history changes or secret leakage.

## 3. Risks And Rollback

- Risk: docs drift from runtime requirements.
  - Mitigation: update `.env.example`, README, and deployment plan together.
- Risk: release steps are followed in the wrong order.
  - Mitigation: provide a release checklist and smoke-test section.
- Risk: production failure after deployment.
  - Mitigation: document Vercel rollback-first strategy and compatible-schema guidance.
- Rollback: restore prior Vercel deployment and pause DB changes unless a safe manual rollback is validated.

## 4. Task List

### Task 1: Add failing tests for production deployment docs and scripts

**Files:**
- Create: `tests/docs/deployment-readme.test.ts`
- Create: `tests/scripts/smoke-test.test.ts`
- Test: `tests/docs/deployment-readme.test.ts`
- Test: `tests/scripts/smoke-test.test.ts`

**Step 1: Write the failing tests**

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('deployment README content', () => {
  it('documents Vercel production deployment and Supabase Cloud migration order', () => {
    const readme = readFileSync('README.md', 'utf8');

    expect(readme).toContain('Vercel');
    expect(readme).toContain('Supabase Cloud');
    expect(readme).toContain('migrations before deploy');
  });
});
```

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('production smoke test script', () => {
  it('checks production homepage and API endpoints', () => {
    const script = readFileSync('scripts/smoke-test.mjs', 'utf8');

    expect(script).toContain('/api/v1/posts');
    expect(script).toContain('/api/v1/admin/queue');
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- --run tests/docs/deployment-readme.test.ts tests/scripts/smoke-test.test.ts`
Expected: FAIL because the production deployment docs/script do not exist yet.

**Step 3: Write minimal implementation**

Do not implement yet.

**Step 4: Run tests to verify red state is real**

Run: `npm test -- --run tests/docs/deployment-readme.test.ts tests/scripts/smoke-test.test.ts`
Expected: FAIL for missing required deployment content.

**Step 5: Commit**

```bash
git add tests/docs/deployment-readme.test.ts tests/scripts/smoke-test.test.ts
git commit -m "test(deploy): add production deployment checks"
```

### Task 2: Add deployment smoke-test script

**Files:**
- Create: `scripts/smoke-test.mjs`
- Modify: `package.json`
- Test: `tests/scripts/smoke-test.test.ts`

**Step 1: Run the failing smoke-test test**

Run: `npm test -- --run tests/scripts/smoke-test.test.ts`
Expected: FAIL because `scripts/smoke-test.mjs` is missing.

**Step 2: Write minimal implementation**

Create a script that:

- reads a base URL from `process.env.SMOKE_TEST_BASE_URL`
- checks `/`
- checks `GET /api/v1/admin/queue`
- performs a minimal `POST /api/v1/posts` request with safe sample payload
- exits non-zero on any failure

Add package script:

```json
{
  "scripts": {
    "smoke": "node scripts/smoke-test.mjs"
  }
}
```

**Step 3: Run test to verify it passes**

Run: `npm test -- --run tests/scripts/smoke-test.test.ts`
Expected: PASS

**Step 4: Verify no regressions in package config**

Run: `npm test -- --run tests/scripts/smoke-test.test.ts tests/lib/env.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add scripts/smoke-test.mjs package.json package-lock.json tests/scripts/smoke-test.test.ts
git commit -m "feat(deploy): add production smoke test script"
```

### Task 3: Update README with cloud deployment workflow

**Files:**
- Modify: `README.md`
- Test: `tests/docs/deployment-readme.test.ts`

**Step 1: Run the failing README deployment test**

Run: `npm test -- --run tests/docs/deployment-readme.test.ts`
Expected: FAIL because README lacks full production deployment instructions.

**Step 2: Write minimal implementation**

Update README to include:

- Vercel production deployment target
- Supabase Cloud production project setup
- required production environment variables
- release order: tests/build -> env verify -> migration -> deploy -> smoke test
- rollback-first guidance using Vercel

**Step 3: Run test to verify it passes**

Run: `npm test -- --run tests/docs/deployment-readme.test.ts`
Expected: PASS

**Step 4: Re-run related workflow tests**

Run: `npm test -- --run tests/docs/deployment-readme.test.ts tests/docs/readme-supabase-workflow.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add README.md tests/docs/deployment-readme.test.ts
git commit -m "docs(deploy): add production release workflow"
```

### Task 4: Add deployment checklist and operator docs

**Files:**
- Create: `docs/deployment-checklist.md`
- Create: `docs/production-env.md`
- Test: `tests/docs/deployment-checklist.test.ts`

**Step 1: Write the failing test**

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('deployment checklist docs', () => {
  it('includes pre-deploy, deploy, and rollback sections', () => {
    const doc = readFileSync('docs/deployment-checklist.md', 'utf8');

    expect(doc).toContain('Pre-Deploy');
    expect(doc).toContain('Deploy');
    expect(doc).toContain('Rollback');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/docs/deployment-checklist.test.ts`
Expected: FAIL because deployment checklist docs do not exist.

**Step 3: Write minimal implementation**

Create operator docs containing:

- pre-deploy checklist
- exact production variable inventory
- migration-first release order
- post-deploy smoke-test steps
- rollback checklist

**Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/docs/deployment-checklist.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add docs/deployment-checklist.md docs/production-env.md tests/docs/deployment-checklist.test.ts
git commit -m "docs(ops): add deployment operator checklist"
```

### Task 5: Align environment examples and release commands

**Files:**
- Modify: `.env.example`
- Modify: `README.md`
- Test: `tests/lib/env.test.ts`
- Test: `tests/docs/deployment-readme.test.ts`

**Step 1: Add a failing expectation if needed**

Extend an existing test so it verifies all documented production env keys appear in `.env.example`.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/lib/env.test.ts`
Expected: FAIL if `.env.example` and runtime expectations drift.

**Step 3: Write minimal implementation**

Ensure `.env.example` includes all production variables and that README references the same keys consistently.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/lib/env.test.ts tests/docs/deployment-readme.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add .env.example README.md tests/lib/env.test.ts tests/docs/deployment-readme.test.ts
git commit -m "chore(deploy): align production env documentation"
```

### Task 6: Final verification and release-readiness check

**Files:**
- Modify: `README.md`
- Modify: `docs/deployment-checklist.md`
- Test: `tests/**`

**Step 1: Run targeted deployment-related verification**

Run: `npm test -- --run tests/docs/deployment-readme.test.ts tests/docs/readme-supabase-workflow.test.ts tests/docs/deployment-checklist.test.ts tests/scripts/smoke-test.test.ts tests/lib/env.test.ts`
Expected: PASS

**Step 2: Run full test suite**

Run: `npm test`
Expected: PASS

**Step 3: Run production build verification**

Run: `npm run build`
Expected: PASS

**Step 4: Review release checklist for requirements coverage**

Confirm the docs cover:

- Vercel setup
- Supabase Cloud setup
- migration-first release order
- smoke testing
- rollback guidance

**Step 5: Commit**

```bash
git add README.md docs/deployment-checklist.md docs/production-env.md scripts/smoke-test.mjs tests package.json package-lock.json
git commit -m "feat(deploy): document production release workflow"
```
