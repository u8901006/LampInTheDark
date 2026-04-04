import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: client } = await supabase
    .from('profiles')
    .select('id, display_name, created_at')
    .eq('id', id)
    .eq('role', 'client')
    .single();

  if (!client) {
    return <p style={{ color: 'var(--muted)' }}>找不到此案主</p>;
  }

  const [weeklyCards, dailyEntries, emergencyPlan, timeline, sleepDiaries] = await Promise.all([
    supabase.from('diary_cards').select('id, week_start, week_end, created_at').eq('client_id', id).order('week_start', { ascending: false }),
    supabase.from('daily_diary_entries').select('id, entry_date, created_at').eq('client_id', id).order('entry_date', { ascending: false }),
    supabase.from('emergency_plans').select('id').eq('client_id', id).single(),
    supabase.from('life_timelines').select('id').eq('client_id', id).single(),
    supabase.from('sleep_diaries').select('id, entry_date').eq('client_id', id).order('entry_date', { ascending: false }),
  ]);

  const sectionTitle: React.CSSProperties = {
    fontSize: '1.2rem',
    margin: '1.75rem 0 0.75rem',
    color: 'var(--accent)',
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
        {client.display_name || '未命名案主'}
      </h1>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        註冊日期：{new Date(client.created_at).toLocaleDateString('zh-TW')}
      </p>

      <h2 style={sectionTitle}>每週日誌卡</h2>
      {weeklyCards.data && weeklyCards.data.length > 0 ? (
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {weeklyCards.data.map(card => (
            <Link
              key={card.id}
              href={`/admin/diary/weekly/${card.id}`}
              className="card"
              style={{
                display: 'block',
                padding: '0.85rem 1.1rem',
                textDecoration: 'none',
                color: 'var(--text)',
              }}
            >
              {card.week_start} ~ {card.week_end}
            </Link>
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>尚無每週日誌卡</p>
      )}

      <h2 style={sectionTitle}>每日日誌卡</h2>
      {dailyEntries.data && dailyEntries.data.length > 0 ? (
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {dailyEntries.data.map(entry => (
            <Link
              key={entry.id}
              href={`/admin/diary/daily/${entry.id}`}
              className="card"
              style={{
                display: 'block',
                padding: '0.85rem 1.1rem',
                textDecoration: 'none',
                color: 'var(--text)',
              }}
            >
              {entry.entry_date}
            </Link>
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>尚無每日日誌卡</p>
      )}

      <h2 style={sectionTitle}>緊急計劃</h2>
      {emergencyPlan.data ? (
        <div className="card" style={{ padding: '0.85rem 1.1rem' }}>
          <p style={{ margin: 0 }}>已填寫緊急計劃</p>
        </div>
      ) : (
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>尚未填寫緊急計劃</p>
      )}

      <h2 style={sectionTitle}>生命歷程圖</h2>
      {timeline.data ? (
        <div className="card" style={{ padding: '0.85rem 1.1rem' }}>
          <p style={{ margin: 0 }}>已建立生命歷程圖</p>
        </div>
      ) : (
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>尚未建立生命歷程圖</p>
      )}

      <h2 style={sectionTitle}>睡眠日記</h2>
      {sleepDiaries.data && sleepDiaries.data.length > 0 ? (
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {sleepDiaries.data.map(s => (
            <div key={s.id} className="card" style={{ padding: '0.85rem 1.1rem' }}>
              {s.entry_date}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>尚無睡眠日記記錄</p>
      )}
    </div>
  );
}
