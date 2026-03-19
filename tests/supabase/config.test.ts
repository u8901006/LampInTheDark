import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('supabase config', () => {
  it('defines local stack settings and seed file paths', () => {
    const toml = readFileSync('supabase/config.toml', 'utf8');

    expect(toml).toContain('[db.seed]');
    expect(toml).toContain('enabled = true');
    expect(toml).toContain('sql_paths = ["./seed.sql"]');
    expect(toml).toContain('[auth]');
  });
});
