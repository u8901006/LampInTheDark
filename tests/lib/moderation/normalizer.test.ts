import { describe, expect, it } from 'vitest';

import { normalizeModerationResult } from '@/lib/moderation/normalizer';

describe('normalizeModerationResult', () => {
  it('maps provider-specific uncertainty to platform UNCERTAIN', () => {
    const result = normalizeModerationResult('nvidia', {
      label: 'uncertain',
      confidence: 0.42,
      reason: 'ambiguous_content'
    });

    expect(result.decision).toBe('UNCERTAIN');
    expect(result.confidence).toBe(0.42);
    expect(result.reasonCode).toBe('ambiguous_content');
  });
});
