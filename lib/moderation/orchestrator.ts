import { ProviderCircuitBreaker } from '@/lib/moderation/circuit-breaker';
import type {
  ModerateInput,
  ModerationDecision,
  ModerationRunRecord,
  ProviderModerationResult
} from '@/lib/moderation/types';

type ProviderFn = (input: ModerateInput) => Promise<ProviderModerationResult>;

interface OrchestratorDependencies {
  providers: {
    nvidia: ProviderFn;
    zhipu: ProviderFn;
  };
}

export function createModerationOrchestrator(dependencies: OrchestratorDependencies) {
  const breakers = {
    nvidia: new ProviderCircuitBreaker({ failureThreshold: 5, cooldownMs: 60000 }),
    zhipu: new ProviderCircuitBreaker({ failureThreshold: 5, cooldownMs: 60000 })
  };

  return {
    async moderate(input: ModerateInput): Promise<{
      finalDecision: ModerationDecision;
      path: string;
      runs: ModerationRunRecord[];
    }> {
      const runs: ModerationRunRecord[] = [];
      const path: string[] = [];

      const nvidiaAllowed = breakers.nvidia.canRequest();
      if (nvidiaAllowed) {
        const result = await dependencies.providers.nvidia(input);
        path.push('nvidia');
        runs.push(toRunRecord(result, 1));

        if (result.kind === 'technical_failure') {
          breakers.nvidia.recordFailure();
        } else {
          breakers.nvidia.recordSuccess();
          const decision = resolveFinalDecision(result.raw.decision);
          if (decision !== 'MANUAL_REVIEW') {
            return { finalDecision: decision, path: path.join('->'), runs };
          }
          path.push('manual');
          return { finalDecision: 'MANUAL_REVIEW', path: path.join('->'), runs };
        }
      }

      const zhipuAllowed = breakers.zhipu.canRequest();
      if (zhipuAllowed) {
        const result = await dependencies.providers.zhipu(input);
        path.push('zhipu');
        runs.push(toRunRecord(result, runs.length + 1));

        if (result.kind === 'technical_failure') {
          breakers.zhipu.recordFailure();
          path.push('manual');
          return { finalDecision: 'MANUAL_REVIEW', path: path.join('->'), runs };
        }

        breakers.zhipu.recordSuccess();
        const decision = resolveFinalDecision(result.raw.decision);
        if (decision === 'MANUAL_REVIEW') {
          path.push('manual');
        }
        return { finalDecision: decision, path: path.join('->'), runs };
      }

      path.push('manual');
      return { finalDecision: 'MANUAL_REVIEW', path: path.join('->'), runs };
    }
  };
}

function resolveFinalDecision(decision: Exclude<ModerationDecision, 'MANUAL_REVIEW'>): ModerationDecision {
  if (decision === 'UNCERTAIN' || decision === 'ERROR') {
    return 'MANUAL_REVIEW';
  }

  return decision;
}

function toRunRecord(result: ProviderModerationResult, attemptOrder: number): ModerationRunRecord {
  if (result.kind === 'technical_failure') {
    return {
      provider: result.provider,
      attemptOrder,
      decision: 'ERROR',
      confidence: null,
      reasonCode: null,
      latencyMs: result.latencyMs,
      errorCode: result.errorCode,
      rawResponseRedacted: {}
    };
  }

  return {
    provider: result.provider,
    attemptOrder,
    decision: result.raw.decision,
    confidence: result.raw.confidence,
    reasonCode: result.raw.reasonCode,
    latencyMs: result.latencyMs,
    errorCode: null,
    rawResponseRedacted: result.raw.rawResponseRedacted
  };
}
