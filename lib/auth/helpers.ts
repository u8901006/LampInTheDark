import { createClient } from '@/lib/supabase/server';
import type { ProfileRow } from '@/supabase/types';

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<ProfileRow | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}

export async function isTherapist(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.role === 'therapist';
}

export async function requireClient() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'client') {
    return null;
  }
  return profile;
}

export async function requireTherapist() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'therapist') {
    return null;
  }
  return profile;
}
