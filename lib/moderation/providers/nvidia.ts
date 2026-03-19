import { createProviderAdapter } from '@/lib/moderation/providers/shared';

export function createModerateWithNvidia(options: {
  apiKey: string;
  model: string;
  fetchImpl?: typeof fetch;
}) {
  return createProviderAdapter({
    ...options,
    endpoint: 'https://integrate.api.nvidia.com/v1/moderate',
    provider: 'nvidia'
  });
}
