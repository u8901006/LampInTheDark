'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScaleInput } from '@/components/diary/scale-input';
import { load, save, KEYS } from '@/lib/storage';

interface DayEntry {
  day_of_week: number;
  positive_events: string;
  unpleasant_events: string;
  treatment_commitment: number | null;
  self_compassion: number | null;
  pain: number | null;
  sleep: number | null;
  dissociation: number | null;
  trauma_intrusion_frequency: number | null;
  trauma_intrusion_max_intensity: number | null;
  suicidal_ideation: number | null;
  skills_used: number | null;
  physical_exercise: number | null;
  pleasant_activities: number | null;
  therapy_homework_done: boolean;
}

interface NewPath {
  description: string;
  thought_about: boolean;
  practiced: number | null;
}

interface TraumaNetwork {
  description: string;
  frequency: number | null;
  intensity: number | null;
}

interface ProblemBehavior {
  description: string;
  impulsivity: number | null;
  acted: boolean;
}

const dayLabels = ['日', '一', '二', '三', '四', '五', '六'];

function makeEmptyEntry(day_of_week: number): DayEntry {
  return {
    day_of_week,
    positive_events: '',
    unpleasant_events: '',
    treatment_commitment: null,
    self_compassion: null,
    pain: null,
    sleep: null,
    dissociation: null,
    trauma_intrusion_frequency: null,
    trauma_intrusion_max_intensity: null,
    suicidal_ideation: null,
    skills_used: null,
    physical_exercise: null,
    pleasant_activities: null,
    therapy_homework_done: false,
  };
}

export default function WeeklyDiaryFormPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [weekStart, setWeekStart] = useState('');
  const [weekEnd, setWeekEnd] = useState('');
  const [medications, setMedications] = useState('');
  const [weeklyMostPositive, setWeeklyMostPositive] = useState('');
  const [weeklyMostNegative, setWeeklyMostNegative] = useState('');

  const [activeDay, setActiveDay] = useState(0);
  const [entries, setEntries] = useState<DayEntry[]>(dayLabels.map((_, i) => makeEmptyEntry(i)));

  const [newPaths, setNewPaths] = useState<NewPath[]>([
    { description: '', thought_about: false, practiced: null },
  ]);
  const [traumaNetworks, setTraumaNetworks] = useState<TraumaNetwork[]>([]);
  const [problemBehaviors, setProblemBehaviors] = useState<ProblemBehavior[]>([]);

  const currentEntry = entries[activeDay];

  function updateEntry(field: keyof DayEntry, value: string | number | boolean | null) {
    setEntries(prev => prev.map((e, i) => i === activeDay ? { ...e, [field]: value } : e));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!weekStart || !weekEnd) {
      setError('請填寫週起始與結束日期');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const id = crypto.randomUUID();
      const record = {
        id,
        week_start: weekStart,
        week_end: weekEnd,
        medications,
        weekly_most_positive: weeklyMostPositive,
        weekly_most_negative: weeklyMostNegative,
        daily_entries: entries.filter(e =>
          e.positive_events || e.unpleasant_events ||
          e.treatment_commitment !== null || e.self_compassion !== null ||
          e.pain !== null || e.sleep !== null || e.dissociation !== null ||
          e.trauma_intrusion_frequency !== null || e.trauma_intrusion_max_intensity !== null ||
          e.suicidal_ideation !== null || e.skills_used !== null ||
          e.physical_exercise !== null || e.pleasant_activities !== null ||
          e.therapy_homework_done
        ),
        new_paths: newPaths.filter(p => p.description),
        trauma_networks: traumaNetworks.filter(t => t.description),
        problem_behaviors: problemBehaviors.filter(b => b.description),
        created_at: new Date().toISOString(),
      };

      const existing = load(KEYS.weeklyDiaries, []);
      save(KEYS.weeklyDiaries, [...existing, record]);
      router.push('/');
    } catch {
      setError('儲存失敗');
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.6rem 0.8rem',
    border: '1px solid var(--line)',
    borderRadius: '12px',
    background: '#fffdf9',
    color: 'var(--text)',
    fontSize: '0.9rem',
  };

  const sectionTitle: React.CSSProperties = {
    fontSize: '1.15rem',
    fontWeight: 700,
    margin: '1.5rem 0 0.75rem',
    paddingBottom: '0.35rem',
    borderBottom: '1px solid var(--line)',
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>新增每週日誌卡</h1>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <p className="field-label">週起始日</p>
              <input type="date" value={weekStart} onChange={e => setWeekStart(e.target.value)} style={inputStyle} required />
            </div>
            <div>
              <p className="field-label">週結束日</p>
              <input type="date" value={weekEnd} onChange={e => setWeekEnd(e.target.value)} style={inputStyle} required />
            </div>
          </div>
          <div>
            <p className="field-label">藥物</p>
            <input type="text" value={medications} onChange={e => setMedications(e.target.value)} placeholder="目前服用的藥物" style={inputStyle} />
          </div>
        </div>

        <h2 style={sectionTitle}>每日記錄</h2>
        <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1rem' }}>
          {dayLabels.map((d, i) => (
            <button
              key={d}
              type="button"
              onClick={() => setActiveDay(i)}
              style={{
                flex: 1,
                padding: '0.55rem 0',
                borderRadius: '10px',
                border: `2px solid ${i === activeDay ? 'var(--accent)' : 'var(--line)'}`,
                background: i === activeDay ? 'var(--accent)' : 'transparent',
                color: i === activeDay ? '#fff' : 'var(--text)',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem' }}>
            星期{dayLabels[activeDay]}的記錄
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p className="field-label" style={{ fontSize: '0.9rem' }}>正向事件</p>
            <input type="text" value={currentEntry.positive_events} onChange={e => updateEntry('positive_events', e.target.value)} style={inputStyle} placeholder="今天發生的正向事件" />
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <p className="field-label" style={{ fontSize: '0.9rem' }}>不快事件</p>
            <input type="text" value={currentEntry.unpleasant_events} onChange={e => updateEntry('unpleasant_events', e.target.value)} style={inputStyle} placeholder="今天的不愉快事件" />
          </div>

          <ScaleInput label="治療投入" value={currentEntry.treatment_commitment} onChange={v => updateEntry('treatment_commitment', v)} minLabel="沒有" maxLabel="非常高" />
          <ScaleInput label="自我慈悲" value={currentEntry.self_compassion} onChange={v => updateEntry('self_compassion', v)} />
          <ScaleInput label="痛苦程度" value={currentEntry.pain} onChange={v => updateEntry('pain', v)} />
          <ScaleInput label="睡眠品質" value={currentEntry.sleep} onChange={v => updateEntry('sleep', v)} minLabel="無" maxLabel="極佳" />
          <ScaleInput label="解離" value={currentEntry.dissociation} onChange={v => updateEntry('dissociation', v)} />

          <div style={{ marginBottom: '0.75rem' }}>
            <p className="field-label" style={{ fontSize: '0.9rem' }}>侵入記憶頻率</p>
            <input type="number" min={0} value={currentEntry.trauma_intrusion_frequency ?? ''} onChange={e => updateEntry('trauma_intrusion_frequency', e.target.value ? Number(e.target.value) : null)} style={{ ...inputStyle, width: '120px' }} />
          </div>

          <ScaleInput label="侵入記憶最高強度" value={currentEntry.trauma_intrusion_max_intensity} onChange={v => updateEntry('trauma_intrusion_max_intensity', v)} />
          <ScaleInput label="自殺意念" value={currentEntry.suicidal_ideation} onChange={v => updateEntry('suicidal_ideation', v)} />
          <ScaleInput label="技巧使用" value={currentEntry.skills_used} onChange={v => updateEntry('skills_used', v)} minLabel="從不" maxLabel="常常" />
          <ScaleInput label="體能運動" value={currentEntry.physical_exercise} onChange={v => updateEntry('physical_exercise', v)} min={0} max={6} minLabel="無" maxLabel="過於激烈" />
          <ScaleInput label="愉快活動" value={currentEntry.pleasant_activities} onChange={v => updateEntry('pleasant_activities', v)} />

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={currentEntry.therapy_homework_done} onChange={e => updateEntry('therapy_homework_done', e.target.checked)} style={{ width: '18px', height: '18px' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>有做治療練習</span>
            </label>
          </div>
        </div>

        <h2 style={sectionTitle}>本週總結</h2>
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <p className="field-label">最令人振奮的事件</p>
            <textarea value={weeklyMostPositive} onChange={e => setWeeklyMostPositive(e.target.value)} style={{ ...inputStyle, minHeight: '5rem', resize: 'vertical' }} />
          </div>
          <div>
            <p className="field-label">最不愉快的事件</p>
            <textarea value={weeklyMostNegative} onChange={e => setWeeklyMostNegative(e.target.value)} style={{ ...inputStyle, minHeight: '5rem', resize: 'vertical' }} />
          </div>
        </div>

        <h2 style={sectionTitle}>新路徑</h2>
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
          {newPaths.map((p, i) => (
            <div key={i} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: i < newPaths.length - 1 ? '1px solid var(--line)' : undefined }}>
              <p className="field-label" style={{ fontSize: '0.9rem' }}>新路徑 {i + 1}</p>
              <input type="text" value={p.description} onChange={e => {
                const updated = [...newPaths];
                updated[i] = { ...updated[i], description: e.target.value };
                setNewPaths(updated);
              }} style={{ ...inputStyle, marginBottom: '0.5rem' }} placeholder="描述此新路徑" />
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
                <input type="checkbox" checked={p.thought_about} onChange={e => {
                  const updated = [...newPaths];
                  updated[i] = { ...updated[i], thought_about: e.target.checked };
                  setNewPaths(updated);
                }} style={{ width: '18px', height: '18px' }} />
                <span style={{ fontSize: '0.9rem' }}>有想過</span>
              </label>
              <ScaleInput label="實行程度" value={p.practiced} onChange={v => {
                const updated = [...newPaths];
                updated[i] = { ...updated[i], practiced: v };
                setNewPaths(updated);
              }} />
            </div>
          ))}
          {newPaths.length < 2 && (
            <button type="button" onClick={() => setNewPaths(prev => [...prev, { description: '', thought_about: false, practiced: null }])} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>
              + 新增路徑
            </button>
          )}
        </div>

        <h2 style={sectionTitle}>創傷網路</h2>
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
          {traumaNetworks.map((t, i) => (
            <div key={i} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: i < traumaNetworks.length - 1 ? '1px solid var(--line)' : undefined }}>
              <input type="text" value={t.description} onChange={e => {
                const updated = [...traumaNetworks];
                updated[i] = { ...updated[i], description: e.target.value };
                setTraumaNetworks(updated);
              }} style={{ ...inputStyle, marginBottom: '0.5rem' }} placeholder="創傷網路描述" />
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <ScaleInput label="頻率" value={t.frequency} onChange={v => {
                  const updated = [...traumaNetworks];
                  updated[i] = { ...updated[i], frequency: v };
                  setTraumaNetworks(updated);
                }} />
                <ScaleInput label="強度" value={t.intensity} onChange={v => {
                  const updated = [...traumaNetworks];
                  updated[i] = { ...updated[i], intensity: v };
                  setTraumaNetworks(updated);
                }} />
              </div>
              <button type="button" onClick={() => setTraumaNetworks(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#9f3d1c', cursor: 'pointer', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                移除此項
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setTraumaNetworks(prev => [...prev, { description: '', frequency: null, intensity: null }])} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>
            + 新增創傷網路
          </button>
        </div>

        <h2 style={sectionTitle}>問題行為</h2>
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
          {problemBehaviors.map((b, i) => (
            <div key={i} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: i < problemBehaviors.length - 1 ? '1px solid var(--line)' : undefined }}>
              <input type="text" value={b.description} onChange={e => {
                const updated = [...problemBehaviors];
                updated[i] = { ...updated[i], description: e.target.value };
                setProblemBehaviors(updated);
              }} style={{ ...inputStyle, marginBottom: '0.5rem' }} placeholder="問題行為描述" />
              <ScaleInput label="衝動程度" value={b.impulsivity} onChange={v => {
                const updated = [...problemBehaviors];
                updated[i] = { ...updated[i], impulsivity: v };
                setProblemBehaviors(updated);
              }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.25rem' }}>
                <input type="checkbox" checked={b.acted} onChange={e => {
                  const updated = [...problemBehaviors];
                  updated[i] = { ...updated[i], acted: e.target.checked };
                  setProblemBehaviors(updated);
                }} style={{ width: '18px', height: '18px' }} />
                <span style={{ fontSize: '0.9rem' }}>有付諸行動</span>
              </label>
              <button type="button" onClick={() => setProblemBehaviors(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#9f3d1c', cursor: 'pointer', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                移除此項
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setProblemBehaviors(prev => [...prev, { description: '', impulsivity: null, acted: false }])} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>
            + 新增問題行為
          </button>
        </div>

        {error && <p className="field-error" style={{ marginBottom: '0.75rem' }}>{error}</p>}

        <button type="submit" className="primary-link submit-button" disabled={submitting} style={{ marginBottom: '2rem' }}>
          {submitting ? '儲存中…' : '儲存每週日誌'}
        </button>
      </form>
    </div>
  );
}
