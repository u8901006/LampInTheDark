export interface PublicEnv {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export interface ServerEnv {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
  moderation: {
    nvidiaApiKey: string;
    nvidiaModel: string;
    openRouterApiKey: string;
    openRouterModel: string;
  };
}

export interface EnvSource {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  NVIDIA_API_KEY?: string;
  NVIDIA_MODERATION_MODEL?: string;
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODEL?: string;
}

export function getPublicEnv(env: EnvSource): PublicEnv {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing public Supabase environment variables');
  }

  return {
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  };
}

export function getServerEnv(env: EnvSource): ServerEnv {
  const publicEnv = getPublicEnv(env);

  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }

  if (!env.NVIDIA_API_KEY || !env.NVIDIA_MODERATION_MODEL) {
    throw new Error('Missing NVIDIA moderation environment variables');
  }

  if (!env.OPENROUTER_API_KEY || !env.OPENROUTER_MODEL) {
    throw new Error('Missing OpenRouter moderation environment variables');
  }

  return {
    supabase: {
      url: publicEnv.supabaseUrl,
      anonKey: publicEnv.supabaseAnonKey,
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY
    },
    moderation: {
      nvidiaApiKey: env.NVIDIA_API_KEY,
      nvidiaModel: env.NVIDIA_MODERATION_MODEL,
      openRouterApiKey: env.OPENROUTER_API_KEY,
      openRouterModel: env.OPENROUTER_MODEL
    }
  };
}
