import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('GitHub Actions CI workflow', () => {
  it('runs npm test and npm run build on pushes and pull requests', () => {
    const workflow = readFileSync('.github/workflows/ci.yml', 'utf8');

    expect(workflow).toContain('pull_request:');
    expect(workflow).toContain('push:');
    expect(workflow).toContain('npm test');
    expect(workflow).toContain('npm run build');
  });
});
