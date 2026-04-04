import { NextResponse } from 'next/server';

import { buildClientProfile } from '@/lib/auth/profile';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const redirectTo = new URL('/dashboard', url.origin);

  if (!code) {
    redirectTo.pathname = '/auth/login';
    redirectTo.searchParams.set('error', 'missing_code');
    return NextResponse.redirect(redirectTo);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    redirectTo.pathname = '/auth/login';
    redirectTo.searchParams.set('error', 'auth_callback_failed');
    return NextResponse.redirect(redirectTo);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) {
      await admin.from('profiles').insert(buildClientProfile(user.id, user.user_metadata));
    }
  }

  return NextResponse.redirect(redirectTo);
}
