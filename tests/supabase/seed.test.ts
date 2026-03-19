import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('supabase seed', () => {
  it('seeds example posts and moderation runs for local development', () => {
    const sql = readFileSync('supabase/seed.sql', 'utf8');

    expect(sql).toContain("insert into posts");
    expect(sql).toContain("insert into moderation_runs");
    expect(sql).toContain("MANUAL_REVIEW");
  });
});
