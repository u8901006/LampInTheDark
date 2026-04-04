'use client';

import { useState, useEffect } from 'react';

interface SleepEntry {
  id: string;
  entry_date: string;
  bedtime: string;
  wakeup_time: string;
  sleep_quality: number;
  major_events: string;
}

const qualityLabels = [
  { value: 1, label: '清醒躺著' },
  { value: 2, label: '打盹' },
  { value: 3, label: '睡著' },
  { value: 4, label: '睡著並做惡夢' },
];

const inputStyle: React.CSSProperties = {
  padding: '0.6rem 0.9rem',
  border: '1px solid var(--line)',
  borderRadius: '12px',
  background: '#fffdf9',
  color: 'var(--text)',
  fontSize: '0.95rem',
};

export default function SleepDiaryPage() {
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bedtime, setBedtime] = useState('');
  const [wakeup, setWakeup] = useState('');
  const [quality, setQuality] = useState<number>(3);
  const [events, setEvents] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/sleep-diary')
      .then(r => r.json())
      .then(res => {
        if (res.data) setEntries(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit() {
    if (!date || !bedtime || !wakeup) return;
    setSubmitting(true);
    setMessage('');

    const res = await fetch('/api/sleep-diary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entry_date: date,
        bedtime,
        wakeup_time: wakeup,
        sleep_quality: quality,
        major_events: events,
      }),
    });

    setSubmitting(false);
    if (res.ok) {
      const { data } = await res.json();
      setEntries(prev => [data, ...prev]);
      setBedtime('');
      setWakeup('');
      setEvents('');
      setQuality(3);
      setMessage('已記錄');
    } else {
      setMessage('記錄失敗');
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/sleep-diary/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  }

  function getQualityLabel(value: number) {
    return qualityLabels.find(q => q.value === value)?.label || '';
  }

  function getQualityColor(value: number) {
    switch (value) {
      case 1: return '#e8c4b8';
      case 2: return '#f5ddd5';
      case 3: return 'var(--accent-soft)';
      case 4: return '#d4a59a';
      default: return 'var(--line)';
    }
  }

  if (loading) {
    return <p style={{ color: 'var(--muted)' }}>載入中…</p>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>睡眠日記</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
        記錄每日睡眠品質與狀況
      </p>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', margin: '0 0 1rem', color: 'var(--accent)' }}>新增睡眠記錄</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <p className="field-label">日期</p>
            <input
              type="date"
              style={{ ...inputStyle, width: '100%' }}
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
          <div>
            <p className="field-label">上床時間</p>
            <input
              type="time"
              style={{ ...inputStyle, width: '100%' }}
              value={bedtime}
              onChange={e => setBedtime(e.target.value)}
            />
          </div>
          <div>
            <p className="field-label">起床時間</p>
            <input
              type="time"
              style={{ ...inputStyle, width: '100%' }}
              value={wakeup}
              onChange={e => setWakeup(e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <p className="field-label">睡眠品質</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {qualityLabels.map(q => (
              <button
                key={q.value}
                onClick={() => setQuality(q.value)}
                style={{
                  padding: '0.55rem 1rem',
                  borderRadius: '999px',
                  border: `1px solid ${quality === q.value ? 'var(--accent)' : 'var(--line)'}`,
                  background: quality === q.value ? 'var(--accent-soft)' : '#fffdf9',
                  color: quality === q.value ? 'var(--accent)' : 'var(--text)',
                  cursor: 'pointer',
                  fontWeight: quality === q.value ? 700 : 400,
                  fontSize: '0.9rem',
                }}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <p className="field-label">夜間重要事件</p>
          <input
            type="text"
            style={{ ...inputStyle, width: '100%' }}
            value={events}
            onChange={e => setEvents(e.target.value)}
            placeholder="例如：半夜醒來三次、做了惡夢…"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            className="primary-link submit-button"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? '記錄中…' : '記錄睡眠'}
          </button>
          {message && (
            <span style={{ color: message === '已記錄' ? 'var(--accent)' : '#9f3d1c', fontWeight: 600 }}>
              {message}
            </span>
          )}
        </div>
      </div>

      {entries.length > 0 && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', margin: '0 0 1rem', color: 'var(--accent)' }}>睡眠記錄</h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {entries.map(entry => (
              <div
                key={entry.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.9rem 1rem',
                  border: '1px solid var(--line)',
                  borderRadius: '14px',
                  background: '#fffdf9',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontWeight: 700, minWidth: '90px' }}>
                  {entry.entry_date}
                </span>
                <span style={{ color: 'var(--muted)', fontSize: '0.9rem', minWidth: '130px' }}>
                  {entry.bedtime} → {entry.wakeup_time}
                </span>
                <span style={{
                  fontSize: '0.85rem',
                  padding: '0.25rem 0.7rem',
                  borderRadius: '999px',
                  background: getQualityColor(entry.sleep_quality),
                  fontWeight: 600,
                }}>
                  {getQualityLabel(entry.sleep_quality)}
                </span>
                {entry.major_events && (
                  <span style={{ flex: 1, color: 'var(--muted)', fontSize: '0.9rem' }}>
                    {entry.major_events}
                  </span>
                )}
                <button
                  onClick={() => handleDelete(entry.id)}
                  style={{
                    padding: '0.35rem 0.7rem',
                    border: '1px solid #e8c4b8',
                    borderRadius: '999px',
                    background: 'transparent',
                    color: '#9f3d1c',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  刪除
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
