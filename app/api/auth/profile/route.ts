import { NextResponse } from 'next/server';

import { buildClientProfile } from '@/lib/auth/profile';
import { getBearerToken } from '@/lib/auth/url';
import { createAdminClient, createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const admin = createAdminClient();
  const bearerToken = getBearerToken(request.headers.get('authorization'));

  let user = null;

  if (bearerToken) {
    const {
      data: { user: bearerUser },
    } = await admin.auth.getUser(bearerToken);
    user = bearerUser;
  } else {
    const supabase = await createClient();
    const {
      data: { user: cookieUser },
    } = await supabase.auth.getUser();
    user = cookieUser;
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) {
    const { error } = await admin.from('profiles').insert(buildClientProfile(user.id, user.user_metadata));
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
