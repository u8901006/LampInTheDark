import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('deployment README content', () => {
  it('documents Vercel production deployment and Supabase Cloud migration order', () => {
    const readme = readFileSync('README.md', 'utf8');

    expect(readme).toContain('Vercel');
    expect(readme).toContain('Supabase Cloud');
    expect(readme).toContain('migrations before deploy');
  });
});
