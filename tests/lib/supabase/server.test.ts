import { describe, expect, it, vi } from 'vitest';

import { createSupabaseServerClients } from '@/lib/supabase/server';

describe('createSupabaseServerClients', () => {
  it('builds anon and admin clients from env', () => {
    const createClient = vi.fn((url: string, key: string) => ({ url, key }));

    const clients = createSupabaseServerClients(
      {
        url: 'https://example.supabase.co',
        anonKey: 'anon-key',
        serviceRoleKey: 'service-role-key'
      },
      createClient
    );

    expect(createClient).toHaveBeenCalledTimes(2);
    expect(clients.admin).toEqual({ url: 'https://example.supabase.co', key: 'service-role-key' });
    expect(clients.anon).toEqual({ url: 'https://example.supabase.co', key: 'anon-key' });
  });
});
