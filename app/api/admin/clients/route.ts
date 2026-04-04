import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
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

  const { data: clients, error } = await supabase
    .from('profiles')
    .select(`
      id,
      display_name,
      created_at
    `)
    .eq('role', 'client')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const enrichedClients = await Promise.all(
    (clients || []).map(async (client) => {
      const [weekly, daily, sleep] = await Promise.all([
        supabase.from('diary_cards').select('id', { count: 'exact', head: true }).eq('client_id', client.id),
        supabase.from('daily_diary_entries').select('id', { count: 'exact', head: true }).eq('client_id', client.id),
        supabase.from('sleep_diaries').select('id', { count: 'exact', head: true }).eq('client_id', client.id),
      ]);

      return {
        ...client,
        weekly_card_count: weekly.count ?? 0,
        daily_entry_count: daily.count ?? 0,
        sleep_diary_count: sleep.count ?? 0,
      };
    })
  );

  return NextResponse.json({ data: enrichedClients });
}
