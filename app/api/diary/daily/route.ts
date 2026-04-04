import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('daily_diary_entries')
    .select('*')
    .eq('client_id', user.id)
    .order('entry_date', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const {
    entry_date,
    positive_events,
    unpleasant_events,
    treatment_commitment,
    self_compassion,
    pain,
    sleep,
    dissociation,
    trauma_intrusion_frequency,
    trauma_intrusion_max_intensity,
    suicidal_ideation,
    skills_used,
    physical_exercise,
    pleasant_activities,
    therapy_homework_done,
    new_paths,
    trauma_networks,
    problem_behaviors,
  } = body;

  const { data, error } = await supabase
    .from('daily_diary_entries')
    .insert({
      client_id: user.id,
      entry_date,
      positive_events: positive_events || '',
      unpleasant_events: unpleasant_events || '',
      treatment_commitment,
      self_compassion,
      pain,
      sleep,
      dissociation,
      trauma_intrusion_frequency,
      trauma_intrusion_max_intensity,
      suicidal_ideation,
      skills_used,
      physical_exercise,
      pleasant_activities,
      therapy_homework_done,
      new_paths: new_paths || [],
      trauma_networks: trauma_networks || [],
      problem_behaviors: problem_behaviors || [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
