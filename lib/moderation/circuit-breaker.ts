import type { CircuitState } from '@/lib/moderation/types';

interface CircuitBreakerOptions {
  failureThreshold: number;
  cooldownMs: number;
}

export class ProviderCircuitBreaker {
  private consecutiveFailures = 0;

  private state: CircuitState = 'closed';

  private openedAt = 0;

  constructor(private readonly options: CircuitBreakerOptions) {}

  getState(now = Date.now()): CircuitState {
    if (this.state === 'open' && now - this.openedAt >= this.options.cooldownMs) {
      this.state = 'half-open';
    }

    return this.state;
  }

  canRequest(now = Date.now()): boolean {
    return this.getState(now) !== 'open';
  }

  recordFailure(now = Date.now()): void {
    this.consecutiveFailures += 1;

    if (this.consecutiveFailures >= this.options.failureThreshold) {
      this.state = 'open';
      this.openedAt = now;
    }
  }

  recordSuccess(): void {
    this.consecutiveFailures = 0;
    this.state = 'closed';
  }
}
