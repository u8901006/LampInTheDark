import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let { data: timeline } = await supabase
    .from('life_timelines')
    .select('*')
    .eq('client_id', user.id)
    .single();

  if (!timeline) {
    const { data: created } = await supabase
      .from('life_timelines')
      .insert({ client_id: user.id })
      .select()
      .single();
    timeline = created;
  }

  const { data: events } = await supabase
    .from('life_timeline_events')
    .select('*')
    .eq('timeline_id', timeline.id)
    .order('age', { ascending: true });

  return NextResponse.json({ data: { ...timeline, events: events || [] } });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { age, score, description } = await request.json();

  let { data: timeline } = await supabase
    .from('life_timelines')
    .select('id')
    .eq('client_id', user.id)
    .single();

  if (!timeline) {
    const { data: created } = await supabase
      .from('life_timelines')
      .insert({ client_id: user.id })
      .select()
      .single();
    timeline = created;
  }

  if (!timeline) return NextResponse.json({ error: 'Timeline not found' }, { status: 500 });

  const { data, error } = await supabase
    .from('life_timeline_events')
    .insert({ timeline_id: timeline.id, age, score, description })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
