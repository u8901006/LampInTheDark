import { describe, expect, it } from 'vitest';

import { ProviderCircuitBreaker } from '@/lib/moderation/circuit-breaker';

describe('ProviderCircuitBreaker', () => {
  it('opens after five consecutive failures', () => {
    const breaker = new ProviderCircuitBreaker({ failureThreshold: 5, cooldownMs: 60000 });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      breaker.recordFailure();
    }

    expect(breaker.getState()).toBe('open');
  });
});
