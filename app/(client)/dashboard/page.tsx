import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const displayName = profile?.display_name || '案主';

  const [weeklyCards, dailyEntries, emergencyPlan, sleepDiaries] = await Promise.all([
    supabase.from('diary_cards').select('id, week_start, week_end, updated_at').eq('client_id', user.id).order('week_start', { ascending: false }).limit(4),
    supabase.from('daily_diary_entries').select('id, entry_date, updated_at').eq('client_id', user.id).order('entry_date', { ascending: false }).limit(7),
    supabase.from('emergency_plans').select('id').eq('client_id', user.id).single(),
    supabase.from('sleep_diaries').select('id, entry_date').eq('client_id', user.id).order('entry_date', { ascending: false }).limit(7),
  ]);

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
        歡迎回來，{displayName}
      </h1>
      <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
        以下是你最近的工作表記錄
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <DashboardCard
          title="每週日誌卡"
          count={weeklyCards.data?.length || 0}
          items={weeklyCards.data?.map(c => ({
            label: `${c.week_start} ~ ${c.week_end}`,
            href: `/diary/weekly/${c.id}`,
          })) || []}
          createHref="/diary/weekly"
          createLabel="新增每週日誌"
        />

        <DashboardCard
          title="每日日誌卡"
          count={dailyEntries.data?.length || 0}
          items={dailyEntries.data?.map(d => ({
            label: d.entry_date,
            href: `/diary/daily/${d.id}`,
          })) || []}
          createHref="/diary/daily"
          createLabel="新增每日日誌"
        />

        <DashboardCard
          title="緊急計劃"
          count={emergencyPlan.data ? 1 : 0}
          items={emergencyPlan.data ? [{ label: '已填寫', href: '/emergency-plan' }] : []}
          createHref="/emergency-plan"
          createLabel={emergencyPlan.data ? '編輯緊急計劃' : '填寫緊急計劃'}
        />

        <DashboardCard
          title="睡眠日記"
          count={sleepDiaries.data?.length || 0}
          items={sleepDiaries.data?.map(s => ({
            label: s.entry_date,
            href: `/sleep-diary`,
          })) || []}
          createHref="/sleep-diary"
          createLabel="記錄睡眠"
        />

        <div className="card" style={{ padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 0.75rem', fontSize: '1.1rem' }}>生命歷程圖</h3>
          <Link className="primary-link" href="/timeline" style={{ fontSize: '0.9rem', padding: '0.6rem 1rem' }}>
            開啟生命歷程圖
          </Link>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, count, items, createHref, createLabel }: {
  title: string;
  count: number;
  items: { label: string; href: string }[];
  createHref: string;
  createLabel: string;
}) {
  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>
        {title}
        {count > 0 && (
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)', marginLeft: '0.5rem' }}>
            ({count} 筆)
          </span>
        )}
      </h3>
      {items.length > 0 && (
        <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem', lineHeight: 1.8 }}>
          {items.map((item, i) => (
            <li key={i}>
              <Link href={item.href} style={{ color: 'var(--accent)' }}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link className="primary-link" href={createHref} style={{ fontSize: '0.9rem', padding: '0.6rem 1rem' }}>
        {createLabel}
      </Link>
    </div>
  );
}
