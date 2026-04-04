import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('diary_cards')
    .select(`
      *,
      daily_entries:diary_card_daily_entries(*),
      new_paths:diary_card_new_paths(*),
      trauma_networks:diary_card_trauma_networks(*),
      problem_behaviors:diary_card_problem_behaviors(*)
    `)
    .eq('id', id)
    .eq('client_id', user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const {
    medications,
    weekly_most_positive,
    weekly_most_negative,
    daily_entries,
    new_paths,
    trauma_networks,
    problem_behaviors,
  } = body;

  const { error: updateError } = await supabase
    .from('diary_cards')
    .update({
      medications,
      weekly_most_positive,
      weekly_most_negative,
    })
    .eq('id', id)
    .eq('client_id', user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (daily_entries) {
    await supabase.from('diary_card_daily_entries').delete().eq('diary_card_id', id);
    if (daily_entries.length) {
      await supabase.from('diary_card_daily_entries').insert(
        daily_entries.map((e: Record<string, unknown>) => ({ ...e, diary_card_id: id }))
      );
    }
  }

  if (new_paths) {
    await supabase.from('diary_card_new_paths').delete().eq('diary_card_id', id);
    if (new_paths.length) {
      await supabase.from('diary_card_new_paths').insert(
        new_paths.map((p: Record<string, unknown>, i: number) => ({
          ...p,
          diary_card_id: id,
          path_number: i + 1,
        }))
      );
    }
  }

  if (trauma_networks) {
    await supabase.from('diary_card_trauma_networks').delete().eq('diary_card_id', id);
    if (trauma_networks.length) {
      await supabase.from('diary_card_trauma_networks').insert(
        trauma_networks.map((t: Record<string, unknown>) => ({ ...t, diary_card_id: id }))
      );
    }
  }

  if (problem_behaviors) {
    await supabase.from('diary_card_problem_behaviors').delete().eq('diary_card_id', id);
    if (problem_behaviors.length) {
      await supabase.from('diary_card_problem_behaviors').insert(
        problem_behaviors.map((b: Record<string, unknown>) => ({ ...b, diary_card_id: id }))
      );
    }
  }

  const { data: fullCard } = await supabase
    .from('diary_cards')
    .select(`
      *,
      daily_entries:diary_card_daily_entries(*),
      new_paths:diary_card_new_paths(*),
      trauma_networks:diary_card_trauma_networks(*),
      problem_behaviors:diary_card_problem_behaviors(*)
    `)
    .eq('id', id)
    .single();

  return NextResponse.json({ data: fullCard });
}
