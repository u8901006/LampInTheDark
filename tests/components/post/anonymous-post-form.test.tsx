import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import {
  AnonymousPostForm,
  getSubmissionMessage,
  validateAnonymousPostInput
} from '@/components/post/anonymous-post-form';
import { SubmissionResult } from '@/components/post/submission-result';

describe('anonymous post form behavior', () => {
  it('returns Traditional Chinese validation errors', () => {
    const errors = validateAnonymousPostInput({
      content: '',
      emotionTags: []
    });

    expect(errors.content).toBe('請輸入留言內容。');
    expect(errors.emotionTags).toBe('請至少選擇一個情緒標籤。');
  });

  it('returns manual review and success messages in Traditional Chinese', () => {
    expect(getSubmissionMessage('MANUAL_REVIEW')).toBe('留言已收到，正在審核中。');
    expect(getSubmissionMessage('APPROVED')).toBe('留言已送出。');
  });

  it('renders Traditional Chinese form labels', () => {
    const markup = renderToStaticMarkup(<AnonymousPostForm />);

    expect(markup).toContain('送出匿名留言');
    expect(markup).toContain('留言內容');
    expect(markup).toContain('情緒標籤');
  });

  it('renders tracking code guidance after a successful submission', () => {
    const markup = renderToStaticMarkup(
      <SubmissionResult state="APPROVED" trackingCode="track_12345678" />
    );

    expect(markup).toContain('track_12345678');
    expect(markup).toContain('/my-post');
    expect(markup).toContain('查詢碼');
  });
});
