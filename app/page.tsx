import React from 'react';
import Link from 'next/link';

const moderationSteps = [
  '匿名送出內容，不需註冊或登入',
  '內容會先經過系統審核，再決定是否公開顯示',
  '當系統無法確定時，內容會進入人工審核'
];

export default function HomePage() {
  return (
    <main className="shell hero">
      <section className="card" style={{ padding: '2rem' }}>
        <p style={{ color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          LampInTheDark
        </p>
        <h1 style={{ fontSize: 'clamp(2.5rem, 7vw, 4.8rem)', margin: '0.5rem 0 1rem' }}>
          一個讓你安心留下匿名心聲的地方。
        </h1>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.7, maxWidth: '42rem', color: 'var(--muted)' }}>
          你可以在這裡用繁體中文留下匿名留言。系統會先進行審核，必要時轉交人工確認，
          盡量在保護安全的前提下，保留每一段需要被看見的內容。
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
          <Link className="primary-link" href="/write">
            匿名留言
          </Link>
          <span className="soft-note">不用註冊，送出後會顯示審核狀態。</span>
        </div>
        <ul style={{ margin: '2rem 0 0', paddingLeft: '1.25rem', lineHeight: 1.8 }}>
          {moderationSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
