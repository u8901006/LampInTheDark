import { describe, expect, it } from 'vitest';

import { getPublicEnv, getServerEnv } from '@/lib/env';

describe('env helpers', () => {
  it('trims public Supabase env values', () => {
    const env = getPublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co \r\n',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key \r\n',
    });

    expect(env).toEqual({
      supabaseUrl: 'https://example.supabase.co',
      supabaseAnonKey: 'anon-key',
    });
  });

  it('trims server Supabase env values', () => {
    const env = getServerEnv({
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co ',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key ',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key \r\n',
    });

    expect(env.supabase).toEqual({
      url: 'https://example.supabase.co',
      anonKey: 'anon-key',
      serviceRoleKey: 'service-role-key',
    });
  });
});
