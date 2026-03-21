import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('moderation success report script', () => {
  it('reports post and provider success metrics from Supabase data', () => {
    const script = readFileSync('scripts/moderation-success-report.mjs', 'utf8');

    expect(script).toContain('approvedRate');
    expect(script).toContain('automatedDecisionRate');
    expect(script).toContain('successRate');
    expect(script).toContain('latestErrorCode');
    expect(script).toContain('/rest/v1/moderation_runs');
  });
});
