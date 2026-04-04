import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('emergency_plans')
    .select('*')
    .eq('client_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data || null });
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const fields = ['friend_name','friend_phone','friend_available_hours','friend_email','therapist_name','therapist_phone','therapist_available_hours','therapist_email','substitute_therapist_name','substitute_therapist_phone','substitute_therapist_available_hours','substitute_therapist_email','emergency_service_name','emergency_service_phone'];
  const update: Record<string, string> = {};
  for (const f of fields) {
    if (body[f] !== undefined) update[f] = body[f];
  }

  const { data, error } = await supabase
    .from('emergency_plans')
    .upsert({ client_id: user.id, ...update }, { onConflict: 'client_id' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
