import { getServerEnv, type EnvSource } from '@/lib/env';
import { createPostRepository } from '@/lib/posts/repository';
import { createSupabaseServerClients } from '@/lib/supabase/server';

export function createAdminRuntime(envSource: EnvSource = process.env as EnvSource) {
  const env = getServerEnv(envSource);
  const clients = createSupabaseServerClients({
    url: env.supabase.url,
    anonKey: env.supabase.anonKey,
    serviceRoleKey: env.supabase.serviceRoleKey
  });
  const repository = createPostRepository(clients.admin);

  return {
    anonClient: clients.anon,
    adminClient: clients.admin,
    repository
  };
}
