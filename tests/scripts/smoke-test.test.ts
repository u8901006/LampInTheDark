import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('production smoke test script', () => {
  it('checks production homepage and API endpoints', () => {
    const script = readFileSync('scripts/smoke-test.mjs', 'utf8');

    expect(script).toContain('/api/v1/posts');
    expect(script).toContain('/api/v1/admin/queue');
  });
});
