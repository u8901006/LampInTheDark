import { getServerEnv, type EnvSource } from '@/lib/env';
import { getModerationConfig } from '@/lib/moderation/config';
import { createModerationOrchestrator } from '@/lib/moderation/orchestrator';
import { createModerateWithNvidia } from '@/lib/moderation/providers/nvidia';
import { createModerateWithZhipu } from '@/lib/moderation/providers/zhipu';
import { createPostRepository } from '@/lib/posts/repository';
import { createSupabaseServerClients } from '@/lib/supabase/server';

export function createRuntimePostDependencies(envSource?: EnvSource) {
  const env = getServerEnv(envSource ?? (process.env as EnvSource));
  const clients = createSupabaseServerClients({
    url: env.supabase.url,
    anonKey: env.supabase.anonKey,
    serviceRoleKey: env.supabase.serviceRoleKey
  });
  const repository = createPostRepository(clients.admin);
  const moderationConfig = getModerationConfig({
    NVIDIA_API_KEY: env.moderation.nvidiaApiKey,
    NVIDIA_MODERATION_MODEL: env.moderation.nvidiaModel,
    ZHIPU_API_KEY: env.moderation.zhipuApiKey,
    ZHIPU_MODERATION_MODEL: env.moderation.zhipuModel,
    MODERATION_FALLBACK_ENABLED: 'true'
  });
  const moderateWithNvidia = createModerateWithNvidia({
    apiKey: moderationConfig.providers.primary.apiKey,
    model: moderationConfig.providers.primary.model
  });
  const moderateWithZhipu = createModerateWithZhipu({
    apiKey: moderationConfig.providers.fallback.apiKey,
    model: moderationConfig.providers.fallback.model
  });
  const moderate = createModerationOrchestrator({
    providers: {
      nvidia: (input) =>
        moderateWithNvidia({ ...input, timeoutMs: moderationConfig.providers.primary.timeoutMs }),
      zhipu: (input) =>
        moderateWithZhipu({ ...input, timeoutMs: moderationConfig.providers.fallback.timeoutMs })
    }
  }).moderate;

  return {
    moderate,
    savePost: repository.savePost,
    listAdminQueue: repository.listAdminQueue,
    findPostByTrackingCode: repository.findPostByTrackingCode,
    listPublicPosts: repository.listPublicPosts
  };
}

export function createPublicRuntimePostDependencies(envSource?: EnvSource) {
  const env = getServerEnv(envSource ?? (process.env as EnvSource));
  const clients = createSupabaseServerClients({
    url: env.supabase.url,
    anonKey: env.supabase.anonKey,
    serviceRoleKey: env.supabase.serviceRoleKey
  });
  const repository = createPostRepository(clients.admin);

  return {
    findPostByTrackingCode: repository.findPostByTrackingCode,
    listPublicPosts: repository.listPublicPosts
  };
}
