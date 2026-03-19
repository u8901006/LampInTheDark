import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('README Supabase workflow', () => {
  it('documents local Supabase start and db push commands', () => {
    const readme = readFileSync('README.md', 'utf8');

    expect(readme).toContain('supabase start');
    expect(readme).toContain('supabase db push');
    expect(readme).toContain('supabase/config.toml');
    expect(readme).toContain('supabase/seed.sql');
  });
});
