import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
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
    .eq('client_id', user.id)
    .order('week_start', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const {
    week_start,
    week_end,
    medications,
    weekly_most_positive,
    weekly_most_negative,
    daily_entries,
    new_paths,
    trauma_networks,
    problem_behaviors,
  } = body;

  const { data: card, error: cardError } = await supabase
    .from('diary_cards')
    .insert({
      client_id: user.id,
      week_start,
      week_end,
      medications: medications || '',
      weekly_most_positive: weekly_most_positive || '',
      weekly_most_negative: weekly_most_negative || '',
    })
    .select()
    .single();

  if (cardError) {
    return NextResponse.json({ error: cardError.message }, { status: 500 });
  }

  const cardId = card.id;

  if (daily_entries?.length) {
    await supabase.from('diary_card_daily_entries').insert(
      daily_entries.map((e: Record<string, unknown>) => ({ ...e, diary_card_id: cardId }))
    );
  }

  if (new_paths?.length) {
    await supabase.from('diary_card_new_paths').insert(
      new_paths.map((p: Record<string, unknown>, i: number) => ({
        ...p,
        diary_card_id: cardId,
        path_number: i + 1,
      }))
    );
  }

  if (trauma_networks?.length) {
    await supabase.from('diary_card_trauma_networks').insert(
      trauma_networks.map((t: Record<string, unknown>) => ({ ...t, diary_card_id: cardId }))
    );
  }

  if (problem_behaviors?.length) {
    await supabase.from('diary_card_problem_behaviors').insert(
      problem_behaviors.map((b: Record<string, unknown>) => ({ ...b, diary_card_id: cardId }))
    );
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
    .eq('id', cardId)
    .single();

  return NextResponse.json({ data: fullCard }, { status: 201 });
}
