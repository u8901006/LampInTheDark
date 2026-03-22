import { describe, expect, it, vi } from 'vitest';

import { createModerationOrchestrator } from '@/lib/moderation/orchestrator';

describe('createModerationOrchestrator', () => {
  it('falls back to Zhipu when NVIDIA fails technically', async () => {
    const orchestrator = createModerationOrchestrator({
      providers: {
        nvidia: vi.fn().mockResolvedValue({
          provider: 'nvidia',
          kind: 'technical_failure',
          errorCode: 'TIMEOUT',
          latencyMs: 2500
        }),
        zhipu: vi.fn().mockResolvedValue({
          provider: 'zhipu',
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
    expect(result.path).toBe('nvidia->zhipu');
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
        zhipu: vi.fn()
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
        zhipu: vi.fn()
      }
    });

    const result = await orchestrator.moderate({ content: 'hello', traceId: 'trace-3' });

    expect(result.finalDecision).toBe('CRISIS');
    expect(result.path).toBe('nvidia');
  });

  it('falls back to manual review when both providers fail', async () => {
    const orchestrator = createModerationOrchestrator({
      providers: {
        nvidia: vi.fn().mockResolvedValue({
          provider: 'nvidia',
          kind: 'technical_failure',
          errorCode: 'TIMEOUT',
          latencyMs: 2500
        }),
        zhipu: vi.fn().mockResolvedValue({
          provider: 'zhipu',
          kind: 'technical_failure',
          errorCode: 'HTTP_429',
          latencyMs: 500
        })
      }
    });

    const result = await orchestrator.moderate({ content: 'hello', traceId: 'trace-4' });

    expect(result.finalDecision).toBe('MANUAL_REVIEW');
    expect(result.path).toBe('nvidia->zhipu->manual');
  });
});
