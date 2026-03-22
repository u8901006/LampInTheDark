import { afterEach, describe, expect, it, vi } from 'vitest';

import { createModerateWithZhipu } from '@/lib/moderation/providers/zhipu';

describe('createModerateWithZhipu', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls Zhipu chat completions endpoint with correct model', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: '{"label":"approved","confidence":0.95,"reason":"safe"}'
            }
          }
        ]
      })
    });

    const moderateWithZhipu = createModerateWithZhipu({
      apiKey: 'zhipu-key',
      model: 'glm-5-turbo',
      fetchImpl: fetchMock
    });

    const result = await moderateWithZhipu({ content: 'test', traceId: 'trace-1', timeoutMs: 15000 });

    expect(result.provider).toBe('zhipu');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          authorization: 'Bearer zhipu-key'
        }),
        body: expect.stringContaining('"model":"glm-5-turbo"')
      })
    );
    expect(result.kind).toBe('decision');
    if (result.kind !== 'decision') {
      throw new Error('Expected decision result');
    }
    expect(result.raw.decision).toBe('APPROVED');
  });

  it('returns technical failure on HTTP error', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => 'rate limited'
    });

    const moderateWithZhipu = createModerateWithZhipu({
      apiKey: 'zhipu-key',
      model: 'glm-5-turbo',
      fetchImpl: fetchMock
    });

    const result = await moderateWithZhipu({ content: 'test', traceId: 'trace-2', timeoutMs: 15000 });

    expect(result.kind).toBe('technical_failure');
    if (result.kind !== 'technical_failure') {
      throw new Error('Expected technical_failure');
    }
    expect(result.provider).toBe('zhipu');
    expect(result.errorCode).toBe('HTTP_429');
  });

  it('parses rejected label correctly', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: '{"label":"rejected","confidence":0.9,"reason":"harmful content"}'
            }
          }
        ]
      })
    });

    const moderateWithZhipu = createModerateWithZhipu({
      apiKey: 'zhipu-key',
      model: 'glm-5-turbo',
      fetchImpl: fetchMock
    });

    const result = await moderateWithZhipu({ content: 'bad content', traceId: 'trace-3', timeoutMs: 15000 });

    expect(result.kind).toBe('decision');
    if (result.kind !== 'decision') {
      throw new Error('Expected decision result');
    }
    expect(result.raw.decision).toBe('REJECTED');
  });

  it('parses crisis label correctly', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: '{"label":"crisis","confidence":0.85,"reason":"self-harm indicators"}'
            }
          }
        ]
      })
    });

    const moderateWithZhipu = createModerateWithZhipu({
      apiKey: 'zhipu-key',
      model: 'glm-5-turbo',
      fetchImpl: fetchMock
    });

    const result = await moderateWithZhipu({ content: 'crisis content', traceId: 'trace-4', timeoutMs: 15000 });

    expect(result.kind).toBe('decision');
    if (result.kind !== 'decision') {
      throw new Error('Expected decision result');
    }
    expect(result.raw.decision).toBe('CRISIS');
  });
});
