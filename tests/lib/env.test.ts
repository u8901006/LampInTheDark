import { describe, expect, it } from 'vitest';

import { getPublicEnv, getServerEnv } from '@/lib/env';

describe('env helpers', () => {
  it('returns typed server env config for moderation and Supabase', () => {
    const env = getServerEnv({
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
      NVIDIA_API_KEY: 'nvidia-key',
      NVIDIA_MODERATION_MODEL: 'nvidia/model',
      OPENROUTER_API_KEY: 'openrouter-key',
      OPENROUTER_MODEL: 'openrouter/model'
    });

    expect(env.supabase.url).toBe('https://example.supabase.co');
    expect(env.supabase.serviceRoleKey).toBe('service-role-key');
    expect(env.moderation.nvidiaApiKey).toBe('nvidia-key');
  });

  it('returns only public env values for the client', () => {
    const env = getPublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key'
    });

    expect(env).toEqual({
      supabaseUrl: 'https://example.supabase.co',
      supabaseAnonKey: 'anon-key'
    });
  });
});
