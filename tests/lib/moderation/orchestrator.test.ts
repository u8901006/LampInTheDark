import { describe, expect, it, vi } from 'vitest';

import { createModerationOrchestrator } from '@/lib/moderation/orchestrator';

describe('createModerationOrchestrator', () => {
  it('falls back to OpenRouter when NVIDIA fails technically', async () => {
    const orchestrator = createModerationOrchestrator({
      providers: {
        nvidia: vi.fn().mockResolvedValue({
          provider: 'nvidia',
          kind: 'technical_failure',
          errorCode: 'TIMEOUT',
          latencyMs: 2500
        }),
        openrouter: vi.fn().mockResolvedValue({
          provider: 'openrouter',
          kind: 'decision',
          raw: {
            decision: 'APPROVED',
            confidence: 0.91,
            reasonCode: 'safe',
            rawResponseRedacted: { label: 'approved' }
          },
          latencyMs: 1200
        })
      }
    });

    const result = await orchestrator.moderate({ content: 'hello', traceId: 'trace-1' });

    expect(result.finalDecision).toBe('APPROVED');
    expect(result.path).toBe('nvidia->openrouter');
    expect(result.runs).toHaveLength(2);
  });

  it('routes uncertain decisions to manual review', async () => {
    const orchestrator = createModerationOrchestrator({
      providers: {
        nvidia: vi.fn().mockResolvedValue({
          provider: 'nvidia',
          kind: 'decision',
          raw: {
            decision: 'UNCERTAIN',
            confidence: 0.4,
            reasonCode: 'ambiguous_content',
            rawResponseRedacted: { label: 'uncertain' }
          },
          latencyMs: 1000
        }),
        openrouter: vi.fn()
      }
    });

    const result = await orchestrator.moderate({ content: 'hello', traceId: 'trace-2' });

    expect(result.finalDecision).toBe('MANUAL_REVIEW');
    expect(result.path).toBe('nvidia->manual');
  });

  it('returns crisis immediately when provider flags crisis', async () => {
    const orchestrator = createModerationOrchestrator({
      providers: {
        nvidia: vi.fn().mockResolvedValue({
          provider: 'nvidia',
          kind: 'decision',
          raw: {
            decision: 'CRISIS',
            confidence: 0.99,
            reasonCode: 'self_harm_risk',
            rawResponseRedacted: { label: 'crisis' }
          },
          latencyMs: 700
        }),
        openrouter: vi.fn()
      }
    });

    const result = await orchestrator.moderate({ content: 'hello', traceId: 'trace-3' });

    expect(result.finalDecision).toBe('CRISIS');
    expect(result.path).toBe('nvidia');
  });
});
