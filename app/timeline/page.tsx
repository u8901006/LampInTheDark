'use client';

import { useState, useEffect } from 'react';
import { LifeChart } from '@/components/timeline/life-chart';
import { load, save, KEYS } from '@/lib/storage';
import { CopyButton } from '@/components/layout/copy-button';

interface TimelineEvent {
  id: string;
  age: number;
  score: number;
  description: string;
}

const inputStyle: React.CSSProperties = {
  padding: '0.6rem 0.9rem',
  border: '1px solid var(--line)',
  borderRadius: '12px',
  background: '#fffdf9',
  color: 'var(--text)',
  fontSize: '0.95rem',
};

function formatTimelineForCopy(events: TimelineEvent[]): string {
  if (events.length === 0) return '（尚無事件）';
  const lines: string[] = [];
  lines.push('【生命歷程圖】');
  events.forEach(e => {
    lines.push(`${e.age}歲 (分數 ${e.score})：${e.description}`);
  });
  return lines.join('\n');
}

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [newAge, setNewAge] = useState('');
  const [newScore, setNewScore] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAge, setEditAge] = useState('');
  const [editScore, setEditScore] = useState('');
  const [editDesc, setEditDesc] = useState('');

  useEffect(() => {
    setEvents(load(KEYS.timelineEvents, []));
  }, []);

  function persist(updated: TimelineEvent[]) {
    setEvents(updated);
    save(KEYS.timelineEvents, updated);
  }

  function handleAdd() {
    const age = parseInt(newAge);
    const score = parseInt(newScore);
    if (isNaN(age) || isNaN(score)) return;
    if (score < -100 || score > 100) return;
    if (age < 0 || age > 100) return;

    const record: TimelineEvent = {
      id: crypto.randomUUID(),
      age,
      score,
      description: newDesc,
    };
    const updated = [...events, record].sort((a, b) => a.age - b.age);
    persist(updated);
    setNewAge('');
    setNewScore('');
    setNewDesc('');
  }

  function handleDelete(id: string) {
    persist(events.filter(e => e.id !== id));
  }

  function startEdit(event: TimelineEvent) {
    setEditingId(event.id);
    setEditAge(String(event.age));
    setEditScore(String(event.score));
    setEditDesc(event.description);
  }

  function handleSaveEdit(id: string) {
    const age = parseInt(editAge);
    const score = parseInt(editScore);
    if (isNaN(age) || isNaN(score)) return;

    const updated = events.map(e =>
      e.id === id ? { ...e, age, score, description: editDesc } : e
    ).sort((a, b) => a.age - b.age);
    persist(updated);
    setEditingId(null);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>生命歷程圖</h1>
        <CopyButton text={formatTimelineForCopy(events)} />
      </div>
      <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
        記錄你生命中重要的事件與感受
      </p>

      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <LifeChart events={events} />
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', margin: '0 0 1rem', color: 'var(--accent)' }}>新增事件</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '0 0 80px' }}>
            <p className="field-label">年齡</p>
            <input
              type="number"
              min={0} max={100}
              style={{ ...inputStyle, width: '100%' }}
              value={newAge}
              onChange={e => setNewAge(e.target.value)}
              placeholder="0-100"
            />
          </div>
          <div style={{ flex: '0 0 100px' }}>
            <p className="field-label">分數</p>
            <input
              type="number"
              min={-100} max={100}
              style={{ ...inputStyle, width: '100%' }}
              value={newScore}
              onChange={e => setNewScore(e.target.value)}
              placeholder="-100~100"
            />
          </div>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <p className="field-label">描述</p>
            <input
              type="text"
              style={{ ...inputStyle, width: '100%' }}
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="事件描述"
            />
          </div>
          <button
            className="primary-link submit-button"
            onClick={handleAdd}
            style={{ flexShrink: 0 }}
          >
            新增
          </button>
        </div>
      </div>

      {events.length > 0 && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', margin: '0 0 1rem', color: 'var(--accent)' }}>事件列表</h2>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {events.map(event => (
              <div
                key={event.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--line)',
                  borderRadius: '14px',
                  background: '#fffdf9',
                  flexWrap: 'wrap',
                }}
              >
                {editingId === event.id ? (
                  <>
                    <input
                      type="number"
                      min={0} max={100}
                      style={{ ...inputStyle, width: '70px' }}
                      value={editAge}
                      onChange={e => setEditAge(e.target.value)}
                    />
                    <input
                      type="number"
                      min={-100} max={100}
                      style={{ ...inputStyle, width: '80px' }}
                      value={editScore}
                      onChange={e => setEditScore(e.target.value)}
                    />
                    <input
                      type="text"
                      style={{ ...inputStyle, flex: 1, minWidth: '150px' }}
                      value={editDesc}
                      onChange={e => setEditDesc(e.target.value)}
                    />
                    <button
                      className="primary-link"
                      onClick={() => handleSaveEdit(event.id)}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    >
                      儲存
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid var(--line)',
                        borderRadius: '999px',
                        background: 'transparent',
                        color: 'var(--muted)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      取消
                    </button>
                  </>
                ) : (
                  <>
                    <span style={{
                      fontWeight: 700,
                      minWidth: '40px',
                      color: event.score >= 0 ? 'var(--accent)' : '#9f3d1c',
                    }}>
                      {event.age}歲
                    </span>
                    <span style={{
                      fontSize: '0.85rem',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      background: event.score >= 0 ? 'var(--accent-soft)' : '#f5ddd5',
                      fontWeight: 600,
                    }}>
                      {event.score}
                    </span>
                    <span style={{ flex: 1, color: 'var(--text)' }}>{event.description}</span>
                    <button
                      onClick={() => startEdit(event)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        border: '1px solid var(--line)',
                        borderRadius: '999px',
                        background: 'transparent',
                        color: 'var(--muted)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      編輯
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        border: '1px solid #e8c4b8',
                        borderRadius: '999px',
                        background: 'transparent',
                        color: '#9f3d1c',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      刪除
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
