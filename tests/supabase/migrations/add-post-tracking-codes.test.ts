import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('add post tracking codes migration', () => {
  it('adds a tracking_code column and unique index to posts', () => {
    const sql = readFileSync('supabase/migrations/20260320_add_post_tracking_codes.sql', 'utf8');

    expect(sql).toContain('alter table posts add column if not exists tracking_code');
    expect(sql).toContain("set tracking_code = concat('track_', encode(gen_random_bytes(8), 'hex'))");
    expect(sql).toContain('create unique index if not exists posts_tracking_code_idx');
  });
});
