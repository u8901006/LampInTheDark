import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();

  const { data: event } = await supabase
    .from('life_timeline_events')
    .select('timeline_id')
    .eq('id', id)
    .single();

  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: timeline } = await supabase
    .from('life_timelines')
    .select('client_id')
    .eq('id', event.timeline_id)
    .single();

  if (!timeline || timeline.client_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('life_timeline_events')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: event } = await supabase
    .from('life_timeline_events')
    .select('timeline_id')
    .eq('id', id)
    .single();

  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: timeline } = await supabase
    .from('life_timelines')
    .select('client_id')
    .eq('id', event.timeline_id)
    .single();

  if (!timeline || timeline.client_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await supabase.from('life_timeline_events').delete().eq('id', id);
  return NextResponse.json({ success: true });
}
