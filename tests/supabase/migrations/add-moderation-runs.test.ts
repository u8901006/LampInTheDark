import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('add moderation runs migration', () => {
  it('creates the moderation_runs table and expected indexes', () => {
    const sql = readFileSync('supabase/migrations/20260319_add_moderation_runs.sql', 'utf8');

    expect(sql).toContain('create table if not exists posts');
    expect(sql).toContain('create table if not exists moderation_runs');
    expect(sql).toContain('create index if not exists moderation_runs_post_id_idx');
    expect(sql).toContain('create index if not exists posts_status_created_at_idx');
  });
});
