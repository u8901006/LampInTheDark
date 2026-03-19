import { createClient, type SupabaseClient } from '@supabase/supabase-js';

interface SupabaseServerConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

type CreateClientFn<T> = (url: string, key: string) => T;

export function createSupabaseServerClients<T = SupabaseClient>(
  config: SupabaseServerConfig,
  createClientFn: CreateClientFn<T> = createClient as unknown as CreateClientFn<T>
): { anon: T; admin: T } {
  return {
    anon: createClientFn(config.url, config.anonKey),
    admin: createClientFn(config.url, config.serviceRoleKey)
  };
}
