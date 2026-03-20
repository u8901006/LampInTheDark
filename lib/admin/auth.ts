import type { SupabaseClient } from '@supabase/supabase-js';

export const ADMIN_SESSION_COOKIE = 'litd_admin_session';

interface AuthUser {
  id: string;
  email?: string | null;
}

interface AnonAuthClient {
  auth: {
    getUser: (token: string) => Promise<{ data: { user: AuthUser | null }; error: { message: string } | null }>;
    signInWithPassword: (credentials: { email: string; password: string }) => Promise<{
      data: { session: { access_token: string } | null; user: AuthUser | null };
      error: { message: string } | null;
    }>;
  };
}

interface AdminLookupClient {
  from: SupabaseClient['from'];
}

export interface AdminIdentity {
  userId: string;
  email: string | null;
}

export function readAdminSessionToken(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) {
    return null;
  }

  const cookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`));

  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : null;
}

export function createAdminSessionCookie(token: string): string {
  return `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800`;
}

export function clearAdminSessionCookie(): string {
  return `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export async function verifyAdminSession(
  token: string | null,
  dependencies: { anonClient: AnonAuthClient; adminClient: AdminLookupClient }
): Promise<AdminIdentity | null> {
  if (!token) {
    return null;
  }

  const authResult = await dependencies.anonClient.auth.getUser(token);
  if (authResult.error || !authResult.data.user) {
    return null;
  }

  const user = authResult.data.user;
  const { data, error } = await dependencies.adminClient.from('admin_users').select('user_id').eq('user_id', user.id);
  if (error || !data || data.length === 0) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email ?? null
  };
}

export async function signInAdmin(
  credentials: { email: string; password: string },
  dependencies: { anonClient: AnonAuthClient; adminClient: AdminLookupClient }
): Promise<{ token: string; identity: AdminIdentity } | null> {
  const signInResult = await dependencies.anonClient.auth.signInWithPassword(credentials);
  if (signInResult.error || !signInResult.data.session?.access_token) {
    return null;
  }

  const identity = await verifyAdminSession(signInResult.data.session.access_token, dependencies);
  if (!identity) {
    return null;
  }

  return {
    token: signInResult.data.session.access_token,
    identity
  };
}
