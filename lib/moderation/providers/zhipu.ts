import { createProviderAdapter } from '@/lib/moderation/providers/shared';

export function createModerateWithZhipu(options: {
  apiKey: string;
  model: string;
  fetchImpl?: typeof fetch;
}) {
  return createProviderAdapter({
    ...options,
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    provider: 'zhipu'
  });
}
