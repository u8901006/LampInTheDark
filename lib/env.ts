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
}

export interface EnvSource {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
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

  return {
    supabase: {
      url: publicEnv.supabaseUrl,
      anonKey: publicEnv.supabaseAnonKey,
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY
    }
  };
}
