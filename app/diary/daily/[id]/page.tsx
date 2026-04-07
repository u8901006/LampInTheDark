'use client';

import { use, useEffect, useState } from 'react';
import { load, KEYS } from '@/lib/storage';
import { CopyButton } from '@/components/layout/copy-button';

const sectionTitle: React.CSSProperties = {
  fontSize: '1.2rem',
  margin: '1.5rem 0 0.75rem',
};

const fieldRow: React.CSSProperties = {
  marginBottom: '0.5rem',
  fontSize: '0.95rem',
};

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'boolean') return val ? '是' : '否';
  return String(val);
}

function formatDailyForCopy(entry: Record<string, unknown>): string {
  const lines: string[] = [];
  lines.push(`【每日日誌】${entry.entry_date}`);
  lines.push(`正向事件：${entry.positive_events || '—'}`);
  lines.push(`不快事件：${entry.unpleasant_events || '—'}`);
  lines.push(`治療投入：${formatValue(entry.treatment_commitment)}`);
  lines.push(`自我慈悲：${formatValue(entry.self_compassion)}`);
  lines.push(`痛苦程度：${formatValue(entry.pain)}`);
  lines.push(`睡眠品質：${formatValue(entry.sleep)}`);
  lines.push(`解離：${formatValue(entry.dissociation)}`);
  lines.push(`侵入記憶頻率：${formatValue(entry.trauma_intrusion_frequency)}`);
  lines.push(`侵入記憶最高強度：${formatValue(entry.trauma_intrusion_max_intensity)}`);
  lines.push(`自殺意念：${formatValue(entry.suicidal_ideation)}`);
  lines.push(`技巧使用：${formatValue(entry.skills_used)}`);
  lines.push(`體能運動：${formatValue(entry.physical_exercise)}`);
  lines.push(`愉快活動：${formatValue(entry.pleasant_activities)}`);
  lines.push(`治療練習：${entry.therapy_homework_done ? '有' : '沒有'}`);

  const np = (entry.new_paths as Record<string, unknown>[]) || [];
  np.forEach((p, i) => {
    lines.push(`新路徑 ${i + 1}：${formatValue(p.description)} | 有想過：${p.thought_about ? '有' : '沒有'} | 實行：${formatValue(p.practiced)}`);
  });

  const tn = (entry.trauma_networks as Record<string, unknown>[]) || [];
  tn.forEach(t => {
    lines.push(`創傷網路：${formatValue(t.description)} | 頻率：${formatValue(t.frequency)} | 強度：${formatValue(t.intensity)}`);
  });

  const pb = (entry.problem_behaviors as Record<string, unknown>[]) || [];
  pb.forEach(b => {
    lines.push(`問題行為：${formatValue(b.description)} | 衝動：${formatValue(b.impulsivity)} | 行動：${b.acted ? '是' : '否'}`);
  });

  return lines.join('\n');
}

export default function DailyDiaryViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [entry, setEntry] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const all = load(KEYS.dailyDiaries, []);
    const found = all.find((e: Record<string, unknown>) => e.id === id);
    setEntry(found || null);
  }, [id]);

  if (!entry) return <p style={{ color: 'var(--muted)' }}>找不到此日誌</p>;

  const newPaths: Record<string, unknown>[] = Array.isArray(entry.new_paths) ? entry.new_paths : [];
  const traumaNetworks: Record<string, unknown>[] = Array.isArray(entry.trauma_networks) ? entry.trauma_networks : [];
  const problemBehaviors: Record<string, unknown>[] = Array.isArray(entry.problem_behaviors) ? entry.problem_behaviors : [];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>
          每日日誌：{String(entry.entry_date)}
        </h1>
        <CopyButton text={formatDailyForCopy(entry)} />
      </div>

      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <p style={fieldRow}><strong>正向事件：</strong>{String(entry.positive_events || '—')}</p>
        <p style={fieldRow}><strong>不快事件：</strong>{String(entry.unpleasant_events || '—')}</p>
        <p style={fieldRow}><strong>治療投入：</strong>{formatValue(entry.treatment_commitment)}</p>
        <p style={fieldRow}><strong>自我慈悲：</strong>{formatValue(entry.self_compassion)}</p>
        <p style={fieldRow}><strong>痛苦程度：</strong>{formatValue(entry.pain)}</p>
        <p style={fieldRow}><strong>睡眠品質：</strong>{formatValue(entry.sleep)}</p>
        <p style={fieldRow}><strong>解離：</strong>{formatValue(entry.dissociation)}</p>
        <p style={fieldRow}><strong>侵入記憶頻率：</strong>{formatValue(entry.trauma_intrusion_frequency)}</p>
        <p style={fieldRow}><strong>侵入記憶最高強度：</strong>{formatValue(entry.trauma_intrusion_max_intensity)}</p>
        <p style={fieldRow}><strong>自殺意念：</strong>{formatValue(entry.suicidal_ideation)}</p>
        <p style={fieldRow}><strong>技巧使用：</strong>{formatValue(entry.skills_used)}</p>
        <p style={fieldRow}><strong>體能運動：</strong>{formatValue(entry.physical_exercise)}</p>
        <p style={fieldRow}><strong>愉快活動：</strong>{formatValue(entry.pleasant_activities)}</p>
        <p style={fieldRow}><strong>治療練習：</strong>{entry.therapy_homework_done ? '有' : '沒有'}</p>
      </div>

      {newPaths.length > 0 && (
        <>
          <h2 style={sectionTitle}>新路徑</h2>
          {newPaths.map((p, i) => (
            <div key={i} className="card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
              <p><strong>新路徑 {i + 1}：</strong>{formatValue(p.description)}</p>
              <p>有想過：{p.thought_about ? '有' : '沒有'} | 有實行：{formatValue(p.practiced)}</p>
            </div>
          ))}
        </>
      )}

      {traumaNetworks.length > 0 && (
        <>
          <h2 style={sectionTitle}>創傷網路</h2>
          {traumaNetworks.map((t, i) => (
            <div key={i} className="card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
              <p>{formatValue(t.description)}</p>
              <p>頻率：{formatValue(t.frequency)} | 強度：{formatValue(t.intensity)}</p>
            </div>
          ))}
        </>
      )}

      {problemBehaviors.length > 0 && (
        <>
          <h2 style={sectionTitle}>問題行為</h2>
          {problemBehaviors.map((b, i) => (
            <div key={i} className="card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
              <p>{formatValue(b.description)}</p>
              <p>衝動程度：{formatValue(b.impulsivity)} | 行動：{b.acted ? '是' : '否'}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
