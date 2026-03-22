# Moderation Provider Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the broken OpenRouter moderation fallback with Zhipu `GLM-5-Turbo` while keeping NVIDIA as the primary provider and improving the production automated moderation success rate.

**Architecture:** Keep the current two-stage moderation orchestrator, but swap the fallback provider from OpenRouter to Zhipu. Reuse the existing chat-completions parsing pattern and normalize Zhipu output into the same internal moderation decision shape used by the current pipeline.

**Tech Stack:** Next.js, TypeScript, Vitest, Vercel production env, Zhipu chat completions API, NVIDIA OpenAI-compatible chat completions API.

---

### Task 1: Update moderation configuration to use Zhipu instead of OpenRouter

**Files:**
- Modify: `lib/moderation/config.ts`
- Test: `tests/lib/moderation/config.test.ts`

**Step 1: Write the failing test**

Update the config test so it expects:
- primary provider remains `nvidia`
- fallback provider becomes `zhipu`
- fallback config comes from `ZHIPU_API_KEY` and `ZHIPU_MODERATION_MODEL`

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/lib/moderation/config.test.ts`
Expected: FAIL because config still requires OpenRouter.

**Step 3: Write minimal implementation**

Modify the moderation config layer to:
- remove OpenRouter dependency from moderation provider selection
- require `ZHIPU_API_KEY`
- support `ZHIPU_MODERATION_MODEL`
- return `zhipu` as the fallback provider name

**Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/lib/moderation/config.test.ts`
Expected: PASS

### Task 2: Add a Zhipu moderation provider adapter

**Files:**
- Create: `lib/moderation/providers/zhipu.ts`
- Test: `tests/lib/moderation/providers/zhipu.test.ts`

**Step 1: Write the failing test**

Add tests expecting the provider to:
- call `https://open.bigmodel.cn/api/paas/v4/chat/completions`
- send `glm-5-turbo` by default
- parse `choices[0].message.content` as JSON
- return a normalized `decision` result when the content is valid

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/lib/moderation/providers/zhipu.test.ts`
Expected: FAIL because the provider file does not exist yet.

**Step 3: Write minimal implementation**

Create the Zhipu provider adapter using the documented request shape and reuse the same internal `{ label, confidence, reason }` extraction pattern.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/lib/moderation/providers/zhipu.test.ts`
Expected: PASS

### Task 3: Wire Zhipu into the runtime and remove OpenRouter from the moderation path

**Files:**
- Modify: `lib/posts/runtime.ts`
- Modify: `lib/moderation/types.ts` if provider names need extension
- Test: `tests/lib/moderation/orchestrator.test.ts`

**Step 1: Write the failing test**

Update orchestrator/runtime tests to expect:
- `nvidia` remains first
- `zhipu` is used as fallback
- fallback still occurs after primary technical failure

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/lib/moderation/orchestrator.test.ts`
Expected: FAIL because runtime still wires `openrouter`.

**Step 3: Write minimal implementation**

Replace `createModerateWithOpenRouter` usage with `createModerateWithZhipu` in the runtime and ensure provider naming is consistent throughout the moderation types.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/lib/moderation/orchestrator.test.ts`
Expected: PASS

### Task 4: Keep NVIDIA fixes and add provider-specific regression coverage

**Files:**
- Modify: `tests/lib/moderation/providers/nvidia.test.ts`
- Modify: `tests/lib/moderation/providers/openrouter.test.ts` or replace/remove if no longer needed
- Modify: `tests/lib/moderation/providers/zhipu.test.ts`

**Step 1: Write the failing regression assertions**

Ensure tests cover:
- NVIDIA model normalization still works
- NVIDIA timeout remains intentionally elevated
- Zhipu provider returns parsed moderation labels correctly
- No production moderation path depends on OpenRouter anymore

**Step 2: Run tests to verify any new assertions fail**

Run: `npm test -- --run tests/lib/moderation/providers/nvidia.test.ts tests/lib/moderation/providers/zhipu.test.ts`
Expected: FAIL until the new behavior is fully implemented.

**Step 3: Write minimal implementation or cleanup**

Keep only the provider behavior still needed by production. If OpenRouter is truly removed from the moderation chain, adjust its tests accordingly or remove obsolete moderation-specific assumptions.

**Step 4: Run tests to verify they pass**

Run: `npm test -- --run tests/lib/moderation/providers/nvidia.test.ts tests/lib/moderation/providers/zhipu.test.ts`
Expected: PASS

### Task 5: Update environment variable documentation and runtime checklist

**Files:**
- Modify: `.env.example`
- Modify: `docs/production-runtime-checklist.md`
- Modify: relevant release/incident docs if needed

**Step 1: Write the failing doc test or review target**

If there is an existing env/doc test, extend it to expect `ZHIPU_API_KEY` / `ZHIPU_MODERATION_MODEL` and to stop referencing OpenRouter as the moderation fallback.

**Step 2: Run the doc test (if present) or verify the old text is still wrong**

Run the relevant targeted test command if one exists.
Expected: FAIL or mismatch against current documentation.

**Step 3: Write minimal documentation updates**

Update `.env.example` and deployment/runtime docs so production operators know:
- NVIDIA is primary
- Zhipu is fallback
- which secrets are required

**Step 4: Verify the documentation update**

Run the relevant doc test or re-read the updated files.
Expected: PASS / matches implementation.

### Task 6: Full verification

**Files:**
- Verify only

**Step 1: Run focused moderation tests**

Run:
`npm test -- --run tests/lib/moderation/config.test.ts tests/lib/moderation/orchestrator.test.ts tests/lib/moderation/providers/nvidia.test.ts tests/lib/moderation/providers/zhipu.test.ts`

Expected: PASS

**Step 2: Run full test suite**

Run: `npm test`
Expected: PASS

**Step 3: Run production build**

Run: `npm run build`
Expected: PASS

**Step 4: Deploy to production**

Update production env to include:
- `ZHIPU_API_KEY`
- `ZHIPU_MODERATION_MODEL=glm-5-turbo`

Then deploy with the project’s normal Vercel production flow.

**Step 5: Verify production provider behavior**

Submit safe production test content and confirm:
- moderation path is not `nvidia->openrouter->manual`
- fallback uses `zhipu` when NVIDIA fails
- automated decisions occur successfully in real traffic

**Step 6: Run the success report**

Run:
`npm run moderation:report`

Expected: measurable improvement over the current 24h baseline.

**Step 7: Commit**

```bash
git add lib tests docs .env.example package.json
git commit -m "fix(moderation): replace openrouter fallback"
```
