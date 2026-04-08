'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { exportAllDataAsJson, exportAllDataAsText } from '@/lib/export';
import { load, KEYS } from '@/lib/storage';

export default function HomePage() {
  const [counts, setCounts] = useState({
    weekly: 0,
    daily: 0,
    emergency: false,
    timeline: 0,
    sleep: 0,
  });

  useEffect(() => {
    const weekly = load(KEYS.weeklyDiaries, []);
    const daily = load(KEYS.dailyDiaries, []);
    const plan = load(KEYS.emergencyPlan, null);
    const timeline = load(KEYS.timelineEvents, []);
    const sleep = load(KEYS.sleepDiaries, []);
    setCounts({
      weekly: weekly.length,
      daily: daily.length,
      emergency: !!plan,
      timeline: timeline.length,
      sleep: sleep.length,
    });
  }, []);

  const cards = [
    { title: '每週日誌卡', count: counts.weekly, href: '/diary/weekly', label: '新增每週日誌' },
    { title: '每日日誌卡', count: counts.daily, href: '/diary/daily', label: '新增每日日誌' },
    { title: '緊急計劃', count: counts.emergency ? 1 : 0, href: '/emergency-plan', label: counts.emergency ? '編輯緊急計劃' : '填寫緊急計劃' },
    { title: '生命歷程圖', count: counts.timeline, href: '/timeline', label: '開啟生命歷程圖' },
    { title: '睡眠日記', count: counts.sleep, href: '/sleep-diary', label: '記錄睡眠' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
        DBT-PTSD 電子日誌卡
      </h1>
      <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
        選擇要填寫的項目
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <button
          className="primary-link"
          onClick={exportAllDataAsText}
          style={{ fontSize: '0.9rem', padding: '0.6rem 1rem' }}
        >
          匯出 TXT
        </button>
        <button
          onClick={exportAllDataAsJson}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.6rem 1rem',
            borderRadius: '999px',
            border: '1px solid var(--line)',
            background: 'transparent',
            color: 'var(--text)',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          匯出 JSON
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {cards.map(card => (
          <div key={card.href} className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>
              {card.title}
              {card.count > 0 && (
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)', marginLeft: '0.5rem' }}>
                  ({card.count} 筆)
                </span>
              )}
            </h3>
            <Link className="primary-link" href={card.href} style={{ fontSize: '0.9rem', padding: '0.6rem 1rem' }}>
              {card.label}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
