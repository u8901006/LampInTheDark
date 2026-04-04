import { describe, expect, it } from 'vitest';

import { buildClientProfile } from '@/lib/auth/profile';

describe('buildClientProfile', () => {
  it('builds a client profile from user metadata', () => {
    expect(
      buildClientProfile('user-1', { display_name: 'Test User' })
    ).toEqual({
      id: 'user-1',
      role: 'client',
      display_name: 'Test User',
    });
  });

  it('falls back to an empty display name', () => {
    expect(buildClientProfile('user-1', {})).toEqual({
      id: 'user-1',
      role: 'client',
      display_name: '',
    });
  });
});
