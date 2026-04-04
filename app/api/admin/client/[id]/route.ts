import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'therapist') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: client, error: clientError } = await supabase
    .from('profiles')
    .select('id, display_name, created_at')
    .eq('id', id)
    .eq('role', 'client')
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const [weeklyCards, dailyEntries, emergencyPlan, timeline, sleepDiaries] = await Promise.all([
    supabase.from('diary_cards').select('id, week_start, week_end, created_at').eq('client_id', id).order('week_start', { ascending: false }),
    supabase.from('daily_diary_entries').select('id, entry_date, created_at').eq('client_id', id).order('entry_date', { ascending: false }),
    supabase.from('emergency_plans').select('*').eq('client_id', id).single(),
    supabase.from('life_timelines').select('id').eq('client_id', id).single(),
    supabase.from('sleep_diaries').select('id, entry_date').eq('client_id', id).order('entry_date', { ascending: false }),
  ]);

  return NextResponse.json({
    data: {
      ...client,
      weekly_cards: weeklyCards.data || [],
      daily_entries: dailyEntries.data || [],
      emergency_plan: emergencyPlan.data || null,
      has_timeline: !!timeline.data,
      sleep_diaries: sleepDiaries.data || [],
    },
  });
}
