import { createProviderAdapter } from '@/lib/moderation/providers/shared';

export function createModerateWithNvidia(options: {
  apiKey: string;
  model: string;
  fetchImpl?: typeof fetch;
}) {
  return createProviderAdapter({
    ...options,
    model: normalizeNvidiaModel(options.model),
    endpoint: 'https://integrate.api.nvidia.com/v1/chat/completions',
    provider: 'nvidia'
  });
}

function normalizeNvidiaModel(model: string): string {
  if (model.includes('/')) {
    return model.toLowerCase();
  }

  return `nvidia/${model.toLowerCase()}`;
}
