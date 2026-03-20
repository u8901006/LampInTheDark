import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('custom domain docs', () => {
  it('documents the Vercel custom domain setup sequence', () => {
    const doc = readFileSync('docs/custom-domain.md', 'utf8');

    expect(doc).toContain('vercel domains add');
    expect(doc).toContain('DNS');
    expect(doc).toContain('lampinthedark-prod.vercel.app');
  });
});
