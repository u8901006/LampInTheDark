import { describe, expect, it } from 'vitest';

import { getModerationConfig } from '@/lib/moderation/config';

describe('getModerationConfig', () => {
  it('returns provider settings and timeout values', () => {
    const config = getModerationConfig({
      NVIDIA_API_KEY: 'nvidia-key',
      NVIDIA_MODERATION_MODEL: 'nvidia/safety',
      OPENROUTER_API_KEY: 'openrouter-key',
      OPENROUTER_MODEL: 'meta-llama/llama-3.1-8b-instruct:free'
    });

    expect(config.providers.primary.name).toBe('nvidia');
    expect(config.providers.fallback.name).toBe('openrouter');
    expect(config.providers.primary.timeoutMs).toBe(20000);
    expect(config.providers.fallback.timeoutMs).toBe(3500);
  });
});
