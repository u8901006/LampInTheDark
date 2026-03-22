# Moderation Provider Migration Design

## Goal

Replace the broken OpenRouter moderation fallback with Zhipu `GLM-5-Turbo`, keep NVIDIA as the primary provider, and improve the real automated moderation success rate in production.

## Problem Statement

The current moderation pipeline has these production issues:

- NVIDIA now works only after endpoint and timeout fixes, but still has intermittent failures.
- OpenRouter fallback is not a healthy backup path and currently fails in production.
- This leaves too many posts falling into `MANUAL_REVIEW`, which keeps the automated decision rate far below the desired target.

The production integration needs a stable primary + fallback design, not a partially broken provider chain.

## Approved Direction

- Keep `NVIDIA` as the primary moderation provider.
- Remove `OpenRouter` from the moderation chain.
- Add `Zhipu` as the fallback provider.
- Use Zhipu chat completions with model `glm-5-turbo`.
- Configure the Zhipu API key as a server-side production secret named `ZHIPU_API_KEY`.

## Architecture

The moderation orchestrator remains the same two-stage decision pipeline:

1. Try primary provider (`nvidia`)
2. If the primary provider fails technically, fall back to secondary provider (`zhipu`)
3. If both fail technically, route to `MANUAL_REVIEW`

The goal is to preserve the current orchestration model while replacing only the failing fallback provider and its configuration.

## Provider Integration Design

### NVIDIA

- Keep the existing corrected `chat/completions` integration
- Keep the normalized model naming logic
- Keep the higher timeout because production evidence showed the shorter timeout was a root cause

### Zhipu

- Use `POST https://open.bigmodel.cn/api/paas/v4/chat/completions`
- Use Bearer authentication with `ZHIPU_API_KEY`
- Use model `glm-5-turbo`
- Use a deterministic moderation prompt that requests JSON output with:
  - `label`
  - `confidence`
  - `reason`
- Parse the model result from `choices[0].message.content`

## Response Normalization

Zhipu will use the same normalized internal decision schema as NVIDIA:

- `approved`
- `rejected`
- `crisis`
- `uncertain`

This means the current normalization layer can either:

- be extended to support `zhipu`, or
- be generalized so provider-specific raw payloads are converted into the same internal shape before normalization.

The preferred approach is to keep the normalizer simple and make the Zhipu adapter produce the same `{ label, confidence, reason }` payload shape already used by the shared adapter.

## Configuration Changes

### Remove

- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`

from the moderation config path.

### Add

- `ZHIPU_API_KEY`
- `ZHIPU_MODERATION_MODEL` (default `glm-5-turbo`, but configurable)

### Resulting provider order

- primary: `nvidia`
- fallback: `zhipu`

## Operational Safety

- Zhipu API key must remain server-only
- No key may be written into code or committed files
- Provider diagnostics should remain in logs so production failures can be traced quickly
- The fallback path should continue to fail closed into `MANUAL_REVIEW` rather than silently auto-approving content

## Testing Strategy

### Unit tests

- NVIDIA provider still works with normalized model names and timeout config
- Zhipu provider correctly calls the documented endpoint
- Zhipu provider correctly parses `choices[0].message.content`
- Config now returns `zhipu` as the fallback provider
- Orchestrator still falls back correctly on primary technical failure

### Production verification

- Deploy to production with `ZHIPU_API_KEY`
- Submit a safe sample post
- Confirm the moderation path is no longer `nvidia->openrouter->manual`
- Confirm successful fallback when NVIDIA is unavailable or times out
- Re-run the moderation success-rate report script

## Success Criteria

- OpenRouter is fully removed from the moderation path
- Zhipu is active as the fallback provider in production
- Production submissions no longer depend on a broken OpenRouter path
- Automated decision rate improves measurably above the current baseline

## Non-Goals

- Replacing NVIDIA as the primary provider
- Redesigning the moderation decision taxonomy
- Building a multi-provider routing system beyond primary + fallback
- Claiming `95%` success without measured production evidence
