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
      json: async () => ({
        choices: [
          {
            message: {
              content: '{"label":"approved","confidence":0.98,"reason":"safe"}'
            }
          }
        ]
      })
    });

    const moderateWithNvidia = createModerateWithNvidia({
      apiKey: 'nvidia-key',
      model: 'nvidia/safety',
      fetchImpl: fetchMock
    });

    const result = await moderateWithNvidia({ content: 'test', traceId: 'trace-1', timeoutMs: 2500 });

    expect(result.provider).toBe('nvidia');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"model":"nvidia/safety"')
      })
    );
    expect(result.kind).toBe('decision');
    if (result.kind !== 'decision') {
      throw new Error('Expected decision result');
    }
    expect(result.raw.decision).toBe('APPROVED');
  });

  it('normalizes bare NVIDIA model names for the chat completions API', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: '{"label":"approved","confidence":0.98,"reason":"safe"}'
            }
          }
        ]
      })
    });

    const moderateWithNvidia = createModerateWithNvidia({
      apiKey: 'nvidia-key',
      model: 'Nemotron-3-Super-120B-A12B',
      fetchImpl: fetchMock
    });

    await moderateWithNvidia({ content: 'test', traceId: 'trace-2', timeoutMs: 2500 });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      expect.objectContaining({
        body: expect.stringContaining('"model":"nvidia/nemotron-3-super-120b-a12b"')
      })
    );
  });
});
