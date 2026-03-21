import type { ProviderName } from '@/lib/moderation/types';

interface RawEnv {
  NVIDIA_API_KEY?: string;
  NVIDIA_MODERATION_MODEL?: string;
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODEL?: string;
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

  if (!env.OPENROUTER_API_KEY || !env.OPENROUTER_MODEL) {
    throw new Error('Missing OpenRouter moderation configuration');
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
        name: 'openrouter',
        apiKey: env.OPENROUTER_API_KEY,
        model: env.OPENROUTER_MODEL,
        timeoutMs: 3500
      }
    }
  };
}
