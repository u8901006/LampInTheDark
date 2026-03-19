import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('deployment checklist docs', () => {
  it('includes pre-deploy, deploy, and rollback sections', () => {
    const doc = readFileSync('docs/deployment-checklist.md', 'utf8');

    expect(doc).toContain('Pre-Deploy');
    expect(doc).toContain('Deploy');
    expect(doc).toContain('Rollback');
  });
});
