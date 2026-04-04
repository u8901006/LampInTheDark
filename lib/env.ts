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

function readRequiredEnv(value: string | undefined, errorMessage: string): string {
  const normalized = value?.trim();
  if (!normalized) {
    throw new Error(errorMessage);
  }
  return normalized;
}

export function getPublicEnv(env: EnvSource): PublicEnv {
  return {
    supabaseUrl: readRequiredEnv(
      env.NEXT_PUBLIC_SUPABASE_URL,
      'Missing public Supabase environment variables'
    ),
    supabaseAnonKey: readRequiredEnv(
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'Missing public Supabase environment variables'
    )
  };
}

export function getServerEnv(env: EnvSource): ServerEnv {
  const publicEnv = getPublicEnv(env);

  return {
    supabase: {
      url: publicEnv.supabaseUrl,
      anonKey: publicEnv.supabaseAnonKey,
      serviceRoleKey: readRequiredEnv(env.SUPABASE_SERVICE_ROLE_KEY, 'Missing SUPABASE_SERVICE_ROLE_KEY')
    }
  };
}
