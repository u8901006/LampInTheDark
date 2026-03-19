import { afterEach, describe, expect, it, vi } from 'vitest';

import { createModerateWithOpenRouter } from '@/lib/moderation/providers/openrouter';

describe('createModerateWithOpenRouter', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns normalized metadata for a successful provider call', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ label: 'approved', confidence: 0.91, reason: 'safe' })
    });

    const moderateWithOpenRouter = createModerateWithOpenRouter({
      apiKey: 'openrouter-key',
      model: 'meta-llama/llama-3.1-8b-instruct:free',
      fetchImpl: fetchMock
    });

    const result = await moderateWithOpenRouter({ content: 'test', traceId: 'trace-1', timeoutMs: 3500 });

    expect(result.provider).toBe('openrouter');
    expect(result.raw.decision).toBe('APPROVED');
  });
});
