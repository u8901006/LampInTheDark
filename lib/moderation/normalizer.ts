import type { NormalizedModerationResult, ProviderName } from '@/lib/moderation/types';

type ProviderPayload = {
  label?: string;
  confidence?: number;
  reason?: string;
};

const LABEL_MAP: Record<string, NormalizedModerationResult['decision']> = {
  approved: 'APPROVED',
  rejected: 'REJECTED',
  crisis: 'CRISIS',
  uncertain: 'UNCERTAIN'
};

export function normalizeModerationResult(
  provider: ProviderName,
  payload: ProviderPayload
): NormalizedModerationResult {
  const normalizedLabel = payload.label?.toLowerCase();

  if (!normalizedLabel || !(normalizedLabel in LABEL_MAP)) {
    return {
      decision: 'ERROR',
      confidence: null,
      reasonCode: `${provider}_malformed_response`,
      rawResponseRedacted: redactPayload(payload)
    };
  }

  return {
    decision: LABEL_MAP[normalizedLabel],
    confidence: typeof payload.confidence === 'number' ? payload.confidence : null,
    reasonCode: payload.reason ?? null,
    rawResponseRedacted: redactPayload(payload)
  };
}

function redactPayload(payload: ProviderPayload): Record<string, unknown> {
  return {
    label: payload.label ?? null,
    confidence: payload.confidence ?? null,
    reason: payload.reason ?? null
  };
}
