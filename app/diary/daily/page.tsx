'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScaleInput } from '@/components/diary/scale-input';
import { load, save, KEYS } from '@/lib/storage';

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

export default function DailyDiaryFormPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [positiveEvents, setPositiveEvents] = useState('');
  const [unpleasantEvents, setUnpleasantEvents] = useState('');
  const [treatmentCommitment, setTreatmentCommitment] = useState<number | null>(null);
  const [selfCompassion, setSelfCompassion] = useState<number | null>(null);
  const [pain, setPain] = useState<number | null>(null);
  const [sleep, setSleep] = useState<number | null>(null);
  const [dissociation, setDissociation] = useState<number | null>(null);
  const [traumaIntrusionFrequency, setTraumaIntrusionFrequency] = useState<number | null>(null);
  const [traumaIntrusionMaxIntensity, setTraumaIntrusionMaxIntensity] = useState<number | null>(null);
  const [suicidalIdeation, setSuicidalIdeation] = useState<number | null>(null);
  const [skillsUsed, setSkillsUsed] = useState<number | null>(null);
  const [physicalExercise, setPhysicalExercise] = useState<number | null>(null);
  const [pleasantActivities, setPleasantActivities] = useState<number | null>(null);
  const [therapyHomeworkDone, setTherapyHomeworkDone] = useState(false);

  const [newPaths, setNewPaths] = useState<NewPath[]>([]);
  const [traumaNetworks, setTraumaNetworks] = useState<TraumaNetwork[]>([]);
  const [problemBehaviors, setProblemBehaviors] = useState<ProblemBehavior[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!entryDate) {
      setError('請選擇日期');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const id = crypto.randomUUID();
      const record = {
        id,
        entry_date: entryDate,
        positive_events: positiveEvents,
        unpleasant_events: unpleasantEvents,
        treatment_commitment: treatmentCommitment,
        self_compassion: selfCompassion,
        pain,
        sleep,
        dissociation,
        trauma_intrusion_frequency: traumaIntrusionFrequency,
        trauma_intrusion_max_intensity: traumaIntrusionMaxIntensity,
        suicidal_ideation: suicidalIdeation,
        skills_used: skillsUsed,
        physical_exercise: physicalExercise,
        pleasant_activities: pleasantActivities,
        therapy_homework_done: therapyHomeworkDone,
        new_paths: newPaths.filter(p => p.description),
        trauma_networks: traumaNetworks.filter(t => t.description),
        problem_behaviors: problemBehaviors.filter(b => b.description),
        created_at: new Date().toISOString(),
      };

      const existing = load(KEYS.dailyDiaries, []);
      save(KEYS.dailyDiaries, [...existing, record]);
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
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>新增每日日誌</h1>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <p className="field-label">日期</p>
            <input type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} style={inputStyle} required />
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <p className="field-label" style={{ fontSize: '0.9rem' }}>正向事件</p>
            <input type="text" value={positiveEvents} onChange={e => setPositiveEvents(e.target.value)} style={inputStyle} placeholder="今天發生的正向事件" />
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <p className="field-label" style={{ fontSize: '0.9rem' }}>不快事件</p>
            <input type="text" value={unpleasantEvents} onChange={e => setUnpleasantEvents(e.target.value)} style={inputStyle} placeholder="今天的不愉快事件" />
          </div>

          <ScaleInput label="治療投入" value={treatmentCommitment} onChange={setTreatmentCommitment} minLabel="沒有" maxLabel="非常高" />
          <ScaleInput label="自我慈悲" value={selfCompassion} onChange={setSelfCompassion} />
          <ScaleInput label="痛苦程度" value={pain} onChange={setPain} />
          <ScaleInput label="睡眠品質" value={sleep} onChange={setSleep} minLabel="無" maxLabel="極佳" />
          <ScaleInput label="解離" value={dissociation} onChange={setDissociation} />

          <div style={{ marginBottom: '0.75rem' }}>
            <p className="field-label" style={{ fontSize: '0.9rem' }}>侵入記憶頻率</p>
            <input type="number" min={0} value={traumaIntrusionFrequency ?? ''} onChange={e => setTraumaIntrusionFrequency(e.target.value ? Number(e.target.value) : null)} style={{ ...inputStyle, width: '120px' }} />
          </div>

          <ScaleInput label="侵入記憶最高強度" value={traumaIntrusionMaxIntensity} onChange={setTraumaIntrusionMaxIntensity} />
          <ScaleInput label="自殺意念" value={suicidalIdeation} onChange={setSuicidalIdeation} />
          <ScaleInput label="技巧使用" value={skillsUsed} onChange={setSkillsUsed} minLabel="從不" maxLabel="常常" />
          <ScaleInput label="體能運動" value={physicalExercise} onChange={setPhysicalExercise} min={0} max={6} minLabel="無" maxLabel="過於激烈" />
          <ScaleInput label="愉快活動" value={pleasantActivities} onChange={setPleasantActivities} />

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={therapyHomeworkDone} onChange={e => setTherapyHomeworkDone(e.target.checked)} style={{ width: '18px', height: '18px' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>有做治療練習</span>
          </label>
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
          {submitting ? '儲存中…' : '儲存每日日誌'}
        </button>
      </form>
    </div>
  );
}
