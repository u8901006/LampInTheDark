import type { ProviderName } from '@/lib/moderation/types';

interface RawEnv {
  NVIDIA_API_KEY?: string;
  NVIDIA_MODERATION_MODEL?: string;
  ZHIPU_API_KEY?: string;
  ZHIPU_MODERATION_MODEL?: string;
  MODERATION_FALLBACK_ENABLED?: string;
}

interface ProviderConfig {
  name: ProviderName;
  apiKey: string;
  model: string;
  timeoutMs: number;
}

export interface ModerationConfig {
  fallbackEnabled: boolean;
  providers: {
    primary: ProviderConfig;
    fallback: ProviderConfig;
  };
}

export function getModerationConfig(env: RawEnv): ModerationConfig {
  if (!env.NVIDIA_API_KEY || !env.NVIDIA_MODERATION_MODEL) {
    throw new Error('Missing NVIDIA moderation configuration');
  }

  if (!env.ZHIPU_API_KEY) {
    throw new Error('Missing Zhipu moderation configuration');
  }

  return {
    fallbackEnabled: env.MODERATION_FALLBACK_ENABLED !== 'false',
    providers: {
      primary: {
        name: 'nvidia',
        apiKey: env.NVIDIA_API_KEY,
        model: env.NVIDIA_MODERATION_MODEL,
        timeoutMs: 20000
      },
      fallback: {
        name: 'zhipu',
        apiKey: env.ZHIPU_API_KEY,
        model: env.ZHIPU_MODERATION_MODEL || 'glm-5-turbo',
        timeoutMs: 15000
      }
    }
  };
}
