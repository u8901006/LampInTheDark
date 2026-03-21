import React from 'react';
import Link from 'next/link';
import type { ModerationState } from '@/components/post/anonymous-post-form';

interface SubmissionResultProps {
  state: ModerationState;
  trackingCode?: string | null;
  onReset?: () => void;
}

export function SubmissionResult({ state, trackingCode, onReset }: SubmissionResultProps) {
  if (state === 'idle') {
    return null;
  }

  const title =
    state === 'APPROVED'
      ? '留言已送出。'
      : state === 'MANUAL_REVIEW'
        ? '留言已收到，正在審核中。'
        : state === 'CRISIS'
          ? '我們已收到你的留言，若你正處於急迫危險中，請立即尋求當地緊急支援。'
          : '送出失敗，請稍後再試。';

  const description =
    state === 'APPROVED'
      ? '你的留言已成功送出，若之後想再查看進度，請保留查詢碼。'
      : state === 'MANUAL_REVIEW'
        ? '系統目前需要更多判斷，因此你的留言已進入人工審核。'
        : state === 'CRISIS'
          ? '如果你正處於急迫危險中，請優先尋求當地即時支援與協助。'
          : '目前無法完成送出，你可以稍後重試或重新整理頁面。';

  return (
    <section className="card" style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{title}</h2>
        <p className="soft-note" style={{ margin: 0, lineHeight: 1.7 }}>{description}</p>
      </div>

      {trackingCode ? (
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '1rem', padding: '1rem' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted)' }}>查詢碼</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.1rem', fontWeight: 700 }}>{trackingCode}</p>
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link className="primary-link" href="/">回首頁</Link>
        <Link className="primary-link" href="/posts">查看公開留言</Link>
        <Link className="primary-link" href="/my-post">查詢我的留言</Link>
        {onReset ? (
          <button className="primary-link" type="button" onClick={onReset}>再寫一則</button>
        ) : null}
      </div>
    </section>
  );
}
