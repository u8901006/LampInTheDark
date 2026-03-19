import { normalizeModerationResult } from '@/lib/moderation/normalizer';
import type { ProviderModerationResult, ProviderName } from '@/lib/moderation/types';

export interface ProviderAdapterOptions {
  apiKey: string;
  model: string;
  endpoint: string;
  provider: ProviderName;
  fetchImpl?: typeof fetch;
}

export interface ProviderCallInput {
  content: string;
  traceId: string;
  timeoutMs: number;
}

export function createProviderAdapter(options: ProviderAdapterOptions) {
  const fetchImpl = options.fetchImpl ?? fetch;

  return async function moderate(input: ProviderCallInput): Promise<ProviderModerationResult> {
    const startedAt = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), input.timeoutMs);

    try {
      const response = await fetchImpl(options.endpoint, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${options.apiKey}`,
          'content-type': 'application/json',
          'x-trace-id': input.traceId
        },
        body: JSON.stringify({
          model: options.model,
          input: input.content
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        return {
          provider: options.provider,
          kind: 'technical_failure',
          errorCode: mapStatusToError(response.status),
          latencyMs: Date.now() - startedAt
        };
      }

      const payload = (await response.json()) as { label?: string; confidence?: number; reason?: string };
      const raw = normalizeModerationResult(options.provider, payload);

      if (raw.decision === 'ERROR') {
        return {
          provider: options.provider,
          kind: 'technical_failure',
          errorCode: raw.reasonCode ?? `${options.provider}_malformed_response`,
          latencyMs: Date.now() - startedAt
        };
      }

      return {
        provider: options.provider,
        kind: 'decision',
        raw,
        latencyMs: Date.now() - startedAt
      };
    } catch (error) {
      return {
        provider: options.provider,
        kind: 'technical_failure',
        errorCode: error instanceof Error && error.name === 'AbortError' ? 'TIMEOUT' : 'REQUEST_FAILED',
        latencyMs: Date.now() - startedAt
      };
    } finally {
      clearTimeout(timeout);
    }
  };
}

function mapStatusToError(status: number): string {
  if (status === 429) {
    return 'RATE_LIMITED';
  }

  if (status >= 500) {
    return 'UPSTREAM_SERVER_ERROR';
  }

  return 'UPSTREAM_REQUEST_ERROR';
}
