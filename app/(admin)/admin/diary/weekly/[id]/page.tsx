import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

const thStyle: React.CSSProperties = { padding: '0.5rem', borderBottom: '1px solid var(--line)', textAlign: 'left', fontSize: '0.85rem' };

const metricLabels: Record<string, string> = {
  positive_events: '正向事件',
  unpleasant_events: '不快事件',
  treatment_commitment: '治療投入',
  self_compassion: '自我慈悲',
  pain: '痛苦',
  sleep: '睡眠',
  dissociation: '解離',
  trauma_intrusion_frequency: '侵入頻率',
  trauma_intrusion_max_intensity: '侵入強度',
  suicidal_ideation: '自殺意念',
  skills_used: '技巧使用',
  physical_exercise: '體能運動',
  pleasant_activities: '愉快活動',
  therapy_homework_done: '治療練習',
};

function renderMetricRows(entries: Record<string, unknown>[]) {
  const metrics = Object.keys(metricLabels);
  const days = [0, 1, 2, 3, 4, 5, 6];
  return metrics.map(metric => (
    <tr key={metric}>
      <td style={{ padding: '0.4rem', borderBottom: '1px solid var(--line)', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
        {metricLabels[metric]}
      </td>
      {days.map(d => {
        const entry = entries.find((e: Record<string, unknown>) => e.day_of_week === d);
        const val = entry?.[metric];
        return (
          <td key={d} style={{ padding: '0.4rem', borderBottom: '1px solid var(--line)', fontSize: '0.85rem' }}>
            {metric === 'therapy_homework_done'
              ? (val ? '✓' : val === false ? '✗' : '—')
              : val !== null && val !== undefined && val !== ''
                ? String(val)
                : '—'}
          </td>
        );
      })}
    </tr>
  ));
}

export default async function TherapistWeeklyDiaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: card } = await supabase
    .from('diary_cards')
    .select(`*, daily_entries:diary_card_daily_entries(*), new_paths:diary_card_new_paths(*), trauma_networks:diary_card_trauma_networks(*), problem_behaviors:diary_card_problem_behaviors(*)`)
    .eq('id', id)
    .single();

  if (!card) return <p style={{ color: 'var(--muted)' }}>找不到此日誌卡</p>;

  const { data: clientProfile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', card.client_id)
    .single();

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link
          href={`/admin/client/${card.client_id}`}
          style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem' }}
        >
          ← 返回案主
        </Link>
      </div>

      <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
        案主：{clientProfile?.display_name || '未命名案主'}
      </p>

      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
        每週日誌卡：{card.week_start} ~ {card.week_end}
      </h1>
      {card.medications && <p style={{ marginBottom: '0.5rem' }}><strong>藥物：</strong>{card.medications}</p>}

      <h2 style={{ fontSize: '1.2rem', margin: '1.5rem 0 0.75rem' }}>每日記錄</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr>
              <th style={thStyle}>項目</th>
              {['日', '一', '二', '三', '四', '五', '六'].map(d => <th key={d} style={thStyle}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {renderMetricRows(card.daily_entries || [])}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontSize: '1.2rem', margin: '1.5rem 0 0.75rem' }}>本週總結</h2>
      <p><strong>最令人振奮的事件：</strong>{card.weekly_most_positive || '—'}</p>
      <p><strong>最不愉快的事件：</strong>{card.weekly_most_negative || '—'}</p>

      {card.new_paths?.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.2rem', margin: '1.5rem 0 0.75rem' }}>新路徑</h2>
          {card.new_paths.map((p: Record<string, unknown>, i: number) => (
            <div key={p.id as string} className="card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
              <p><strong>新路徑 {i + 1}：</strong>{(p.description as string) || '—'}</p>
              <p>有想過：{p.thought_about ? '有' : '沒有'} | 有實行：{p.practiced !== null && p.practiced !== undefined ? String(p.practiced) : '—'}</p>
            </div>
          ))}
        </>
      )}

      {card.trauma_networks?.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.2rem', margin: '1.5rem 0 0.75rem' }}>創傷網路</h2>
          {card.trauma_networks.map((t: Record<string, unknown>) => (
            <div key={t.id as string} className="card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
              <p>{(t.description as string) || '—'}</p>
              <p>頻率：{t.frequency !== null && t.frequency !== undefined ? String(t.frequency) : '—'} | 強度：{t.intensity !== null && t.intensity !== undefined ? String(t.intensity) : '—'}</p>
            </div>
          ))}
        </>
      )}

      {card.problem_behaviors?.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.2rem', margin: '1.5rem 0 0.75rem' }}>問題行為</h2>
          {card.problem_behaviors.map((b: Record<string, unknown>) => (
            <div key={b.id as string} className="card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
              <p>{(b.description as string) || '—'}</p>
              <p>衝動程度：{b.impulsivity !== null && b.impulsivity !== undefined ? String(b.impulsivity) : '—'} | 行動：{b.acted ? '是' : '否'}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
