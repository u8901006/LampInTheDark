import { createProviderAdapter } from '@/lib/moderation/providers/shared';

export function createModerateWithOpenRouter(options: {
  apiKey: string;
  model: string;
  fetchImpl?: typeof fetch;
}) {
  return createProviderAdapter({
    ...options,
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    provider: 'openrouter'
  });
}
