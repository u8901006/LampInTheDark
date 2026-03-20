export type ProviderName = 'nvidia' | 'openrouter';

export type ModerationDecision =
  | 'APPROVED'
  | 'REJECTED'
  | 'CRISIS'
  | 'UNCERTAIN'
  | 'ERROR'
  | 'MANUAL_REVIEW';

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface NormalizedModerationResult {
  decision: Exclude<ModerationDecision, 'MANUAL_REVIEW'>;
  confidence: number | null;
  reasonCode: string | null;
  rawResponseRedacted: Record<string, unknown>;
}

export interface ProviderDecisionResult {
  provider: ProviderName;
  kind: 'decision';
  raw: NormalizedModerationResult;
  latencyMs: number;
}

export interface ProviderTechnicalFailureResult {
  provider: ProviderName;
  kind: 'technical_failure';
  errorCode: string;
  latencyMs: number;
}

export type ProviderModerationResult =
  | ProviderDecisionResult
  | ProviderTechnicalFailureResult;

export interface ModerationRunRecord {
  provider: ProviderName;
  attemptOrder: number;
  decision: ModerationDecision;
  confidence: number | null;
  reasonCode: string | null;
  latencyMs: number;
  errorCode: string | null;
  rawResponseRedacted: Record<string, unknown>;
  createdAt?: string | null;
}

export interface ModerateInput {
  content: string;
  traceId: string;
}
