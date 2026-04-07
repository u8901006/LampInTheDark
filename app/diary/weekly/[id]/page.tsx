'use client';

import { use, useEffect, useState } from 'react';
import { load, KEYS } from '@/lib/storage';
import { CopyButton } from '@/components/layout/copy-button';

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

function formatWeeklyForCopy(card: Record<string, unknown>): string {
  const lines: string[] = [];
  lines.push(`【每週日誌卡】${card.week_start} ~ ${card.week_end}`);
  if (card.medications) lines.push(`藥物：${card.medications}`);
  lines.push('');

  const entries = (card.daily_entries as Record<string, unknown>[]) || [];
  const dayLabels = ['日', '一', '二', '三', '四', '五', '六'];
  lines.push('每日記錄：');
  for (const [metric, label] of Object.entries(metricLabels)) {
    const row = dayLabels.map(d => {
      const e = entries.find((x: Record<string, unknown>) => x.day_of_week === dayLabels.indexOf(d));
      const v = e?.[metric];
      if (metric === 'therapy_homework_done') return v ? '✓' : v === false ? '✗' : '—';
      return v !== null && v !== undefined && v !== '' ? String(v) : '—';
    });
    lines.push(`  ${label}：${row.join(' / ')}`);
  }
  lines.push('');
  lines.push(`最令人振奮：${card.weekly_most_positive || '—'}`);
  lines.push(`最不愉快：${card.weekly_most_negative || '—'}`);

  const np = (card.new_paths as Record<string, unknown>[]) || [];
  np.forEach((p, i) => {
    lines.push(`新路徑 ${i + 1}：${p.description} | 有想過：${p.thought_about ? '有' : '沒有'} | 實行：${p.practiced ?? '—'}`);
  });

  const tn = (card.trauma_networks as Record<string, unknown>[]) || [];
  tn.forEach(t => {
    lines.push(`創傷網路：${t.description} | 頻率：${t.frequency ?? '—'} | 強度：${t.intensity ?? '—'}`);
  });

  const pb = (card.problem_behaviors as Record<string, unknown>[]) || [];
  pb.forEach(b => {
    lines.push(`問題行為：${b.description} | 衝動：${b.impulsivity ?? '—'} | 行動：${b.acted ? '是' : '否'}`);
  });

  return lines.join('\n');
}

export default function WeeklyDiaryViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [card, setCard] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const all = load(KEYS.weeklyDiaries, []);
    const found = all.find((c: Record<string, unknown>) => c.id === id);
    setCard(found || null);
  }, [id]);

  if (!card) return <p style={{ color: 'var(--muted)' }}>找不到此日誌卡</p>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>
          每週日誌卡：{card.week_start as string} ~ {card.week_end as string}
        </h1>
        <CopyButton text={formatWeeklyForCopy(card)} />
      </div>
      {card.medications ? <p style={{ marginBottom: '0.5rem' }}><strong>藥物：</strong>{String(card.medications)}</p> : null}

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
            {renderMetricRows((card.daily_entries as Record<string, unknown>[]) || [])}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontSize: '1.2rem', margin: '1.5rem 0 0.75rem' }}>本週總結</h2>
      <p><strong>最令人振奮的事件：</strong>{(card.weekly_most_positive as string) || '—'}</p>
      <p><strong>最不愉快的事件：</strong>{(card.weekly_most_negative as string) || '—'}</p>

      {((card.new_paths as Record<string, unknown>[]) || []).length > 0 && (
        <>
          <h2 style={{ fontSize: '1.2rem', margin: '1.5rem 0 0.75rem' }}>新路徑</h2>
          {((card.new_paths as Record<string, unknown>[])).map((p, i) => (
            <div key={i} className="card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
              <p><strong>新路徑 {i + 1}：</strong>{(p.description as string) || '—'}</p>
              <p>有想過：{p.thought_about ? '有' : '沒有'} | 有實行：{p.practiced !== null && p.practiced !== undefined ? String(p.practiced) : '—'}</p>
            </div>
          ))}
        </>
      )}

      {((card.trauma_networks as Record<string, unknown>[]) || []).length > 0 && (
        <>
          <h2 style={{ fontSize: '1.2rem', margin: '1.5rem 0 0.75rem' }}>創傷網路</h2>
          {((card.trauma_networks as Record<string, unknown>[])).map((t, i) => (
            <div key={i} className="card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
              <p>{(t.description as string) || '—'}</p>
              <p>頻率：{t.frequency !== null && t.frequency !== undefined ? String(t.frequency) : '—'} | 強度：{t.intensity !== null && t.intensity !== undefined ? String(t.intensity) : '—'}</p>
            </div>
          ))}
        </>
      )}

      {((card.problem_behaviors as Record<string, unknown>[]) || []).length > 0 && (
        <>
          <h2 style={{ fontSize: '1.2rem', margin: '1.5rem 0 0.75rem' }}>問題行為</h2>
          {((card.problem_behaviors as Record<string, unknown>[])).map((b, i) => (
            <div key={i} className="card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
              <p>{(b.description as string) || '—'}</p>
              <p>衝動程度：{b.impulsivity !== null && b.impulsivity !== undefined ? String(b.impulsivity) : '—'} | 行動：{b.acted ? '是' : '否'}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
