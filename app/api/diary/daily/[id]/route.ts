import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('daily_diary_entries')
    .select('*')
    .eq('id', id)
    .eq('client_id', user.id)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const {
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
    .update({
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
    })
    .eq('id', id)
    .eq('client_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
