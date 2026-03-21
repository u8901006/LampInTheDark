import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { SubmissionResult } from '@/components/post/submission-result';

describe('submission result', () => {
  it('renders a full completion card with all next-step actions', () => {
    const markup = renderToStaticMarkup(
      <SubmissionResult
        state="APPROVED"
        trackingCode="track_12345678"
        onReset={vi.fn()}
      />
    );

    expect(markup).toContain('留言已送出。');
    expect(markup).toContain('track_12345678');
    expect(markup).toContain('回首頁');
    expect(markup).toContain('查看公開留言');
    expect(markup).toContain('查詢我的留言');
    expect(markup).toContain('再寫一則');
  });

  it('renders state-specific copy for manual review', () => {
    const markup = renderToStaticMarkup(
      <SubmissionResult state="MANUAL_REVIEW" trackingCode="track_12345678" onReset={vi.fn()} />
    );

    expect(markup).toContain('留言已收到，正在審核中。');
    expect(markup).toContain('人工審核');
  });

  it('renders state-specific copy for crisis', () => {
    const markup = renderToStaticMarkup(
      <SubmissionResult state="CRISIS" trackingCode="track_12345678" onReset={vi.fn()} />
    );

    expect(markup).toContain('我們已收到你的留言');
    expect(markup).toContain('急迫危險');
  });

  it('renders retry-oriented copy for error state', () => {
    const markup = renderToStaticMarkup(
      <SubmissionResult state="ERROR" trackingCode={null} onReset={vi.fn()} />
    );

    expect(markup).toContain('送出失敗，請稍後再試。');
    expect(markup).toContain('再寫一則');
  });
});
