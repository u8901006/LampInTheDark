import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('add admin users migration', () => {
  it('creates admin_users and review metadata columns', () => {
    const sql = readFileSync('supabase/migrations/20260320_add_admin_users.sql', 'utf8');

    expect(sql).toContain('create table if not exists admin_users');
    expect(sql).toContain('alter table posts add column if not exists reviewed_at');
    expect(sql).toContain('alter table posts add column if not exists reviewed_by');
    expect(sql).toContain('alter table posts add column if not exists review_note');
  });
});
