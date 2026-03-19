import { afterEach, describe, expect, it, vi } from 'vitest';

import { createModerateWithNvidia } from '@/lib/moderation/providers/nvidia';

describe('createModerateWithNvidia', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns normalized metadata for a successful provider call', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ label: 'approved', confidence: 0.98, reason: 'safe' })
    });

    const moderateWithNvidia = createModerateWithNvidia({
      apiKey: 'nvidia-key',
      model: 'nvidia/safety',
      fetchImpl: fetchMock
    });

    const result = await moderateWithNvidia({ content: 'test', traceId: 'trace-1', timeoutMs: 2500 });

    expect(result.provider).toBe('nvidia');
    expect(result.raw.decision).toBe('APPROVED');
  });
});
