import { normalizeModerationResult } from '@/lib/moderation/normalizer';
import type { ProviderModerationResult, ProviderName } from '@/lib/moderation/types';

type ProviderPayload = {
  label?: string;
  confidence?: number;
  reason?: string;
};

type ChatCompletionPayload = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

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
      console.info('moderation_provider_request', {
        provider: options.provider,
        endpoint: options.endpoint,
        model: options.model,
        hasApiKey: Boolean(options.apiKey)
      });
      const response = await fetchImpl(options.endpoint, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${options.apiKey}`,
          'content-type': 'application/json',
          'x-trace-id': input.traceId
        },
        body: JSON.stringify({
          model: options.model,
          messages: [
            {
              role: 'system',
              content:
                'You are a moderation classifier. Return JSON only with keys label, confidence, reason. label must be one of approved, rejected, crisis, uncertain.'
            },
            {
              role: 'user',
              content: input.content
            }
          ],
          temperature: 0,
          max_tokens: 120,
          response_format: { type: 'json_object' }
        }),
        signal: controller.signal
      });

      console.info('moderation_provider_response', {
        provider: options.provider,
        endpoint: options.endpoint,
        status: response.status,
        ok: response.ok
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        console.error('moderation_provider_http_error', {
          provider: options.provider,
          endpoint: options.endpoint,
          status: response.status,
          body: errorBody.slice(0, 500)
        });
        return {
          provider: options.provider,
          kind: 'technical_failure',
          errorCode: mapStatusToError(response.status),
          latencyMs: Date.now() - startedAt
        };
      }

      const payload = (await response.json()) as ProviderPayload | ChatCompletionPayload;
      const raw = normalizeModerationResult(options.provider, extractProviderPayload(payload));

      if (raw.decision === 'ERROR') {
        console.error('moderation_provider_malformed_response', {
          provider: options.provider,
          endpoint: options.endpoint,
          payload: JSON.stringify(payload).slice(0, 500)
        });
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

function extractProviderPayload(payload: ProviderPayload | ChatCompletionPayload): ProviderPayload {
  if ('label' in payload || 'confidence' in payload || 'reason' in payload) {
    return payload;
  }

  const content = (payload as ChatCompletionPayload).choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    return {};
  }

  try {
    return JSON.parse(content) as ProviderPayload;
  } catch {
    return {};
  }
}

function mapStatusToError(status: number): string {
  if (status >= 400) {
    return `HTTP_${status}`;
  }

  if (status === 429) {
    return 'RATE_LIMITED';
  }

  if (status >= 500) {
    return 'UPSTREAM_SERVER_ERROR';
  }

  return 'UPSTREAM_REQUEST_ERROR';
}
