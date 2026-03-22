import { describe, expect, it } from 'vitest';

import { getModerationConfig } from '@/lib/moderation/config';

describe('getModerationConfig', () => {
  it('returns provider settings with Zhipu as fallback', () => {
    const config = getModerationConfig({
      NVIDIA_API_KEY: 'nvidia-key',
      NVIDIA_MODERATION_MODEL: 'nvidia/safety',
      ZHIPU_API_KEY: 'zhipu-key',
      ZHIPU_MODERATION_MODEL: 'glm-5-turbo'
    });

    expect(config.providers.primary.name).toBe('nvidia');
    expect(config.providers.fallback.name).toBe('zhipu');
    expect(config.providers.primary.timeoutMs).toBe(20000);
    expect(config.providers.fallback.timeoutMs).toBe(15000);
  });

  it('uses default Zhipu model when not specified', () => {
    const config = getModerationConfig({
      NVIDIA_API_KEY: 'nvidia-key',
      NVIDIA_MODERATION_MODEL: 'nvidia/safety',
      ZHIPU_API_KEY: 'zhipu-key'
    });

    expect(config.providers.fallback.model).toBe('glm-5-turbo');
  });

  it('throws when ZHIPU_API_KEY is missing', () => {
    expect(() =>
      getModerationConfig({
        NVIDIA_API_KEY: 'nvidia-key',
        NVIDIA_MODERATION_MODEL: 'nvidia/safety'
      })
    ).toThrow('Missing Zhipu moderation configuration');
  });
});
