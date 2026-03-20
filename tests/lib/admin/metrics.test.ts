import { describe, expect, it } from 'vitest';

import { computeModerationMetrics } from '@/lib/admin/metrics';

describe('computeModerationMetrics', () => {
  it('aggregates provider counts, success rate, latency and manual review ratio', () => {
    const metrics = computeModerationMetrics([
      {
        id: 'post-1',
        status: 'MANUAL_REVIEW',
        moderationPath: 'nvidia->manual',
        moderationRuns: [
          { provider: 'nvidia', attemptOrder: 1, decision: 'ERROR', confidence: null, reasonCode: null, latencyMs: 100, errorCode: 'TIMEOUT', rawResponseRedacted: {} }
        ]
      },
      {
        id: 'post-2',
        status: 'APPROVED',
        moderationPath: 'nvidia',
        moderationRuns: [
          { provider: 'nvidia', attemptOrder: 1, decision: 'APPROVED', confidence: 0.9, reasonCode: 'safe', latencyMs: 50, errorCode: null, rawResponseRedacted: {} },
          { provider: 'openrouter', attemptOrder: 2, decision: 'REJECTED', confidence: 0.8, reasonCode: 'unsafe', latencyMs: 70, errorCode: null, rawResponseRedacted: {} }
        ]
      }
    ]);

    expect(metrics.providerCounts.nvidia).toBe(2);
    expect(metrics.providerCounts.openrouter).toBe(1);
    expect(metrics.errorCount).toBe(1);
    expect(metrics.averageLatencyMs).toBe(73);
    expect(metrics.manualReviewRatio).toBe(0.5);
  });

  it('only counts moderation runs from the recent seven-day window', () => {
    const metrics = computeModerationMetrics(
      [
        {
          id: 'post-1',
          status: 'MANUAL_REVIEW',
          moderationPath: 'nvidia->manual',
          moderationRuns: [
            { provider: 'nvidia', attemptOrder: 1, decision: 'ERROR', confidence: null, reasonCode: null, latencyMs: 100, errorCode: 'TIMEOUT', rawResponseRedacted: {}, createdAt: '2026-03-20T00:00:00.000Z' },
            { provider: 'openrouter', attemptOrder: 2, decision: 'APPROVED', confidence: 0.8, reasonCode: 'safe', latencyMs: 50, errorCode: null, rawResponseRedacted: {}, createdAt: '2026-03-10T00:00:00.000Z' }
          ]
        }
      ],
      { now: new Date('2026-03-20T12:00:00.000Z') }
    );

    expect(metrics.providerCounts.nvidia).toBe(1);
    expect(metrics.providerCounts.openrouter).toBe(0);
    expect(metrics.averageLatencyMs).toBe(100);
    expect(metrics.manualReviewRatio).toBe(1);
  });

  it('ignores manual review items whose moderation runs are outside the recent window', () => {
    const metrics = computeModerationMetrics(
      [
        {
          id: 'post-old',
          status: 'MANUAL_REVIEW',
          moderationPath: 'nvidia->manual',
          moderationRuns: [
            { provider: 'nvidia', attemptOrder: 1, decision: 'ERROR', confidence: null, reasonCode: null, latencyMs: 90, errorCode: 'TIMEOUT', rawResponseRedacted: {}, createdAt: '2026-03-01T00:00:00.000Z' }
          ]
        }
      ],
      { now: new Date('2026-03-20T12:00:00.000Z') }
    );

    expect(metrics.manualReviewRatio).toBe(0);
  });
});
