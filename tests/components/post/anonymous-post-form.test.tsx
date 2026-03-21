import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import {
  AnonymousPostForm,
  getNextEmotionTags,
  getResetFormState,
  getSubmissionMessage,
  shouldShowCompletionState,
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

  it('rejects content shorter than ten characters before submit', () => {
    const errors = validateAnonymousPostInput({
      content: 'short',
      emotionTags: ['sadness']
    });

    expect(errors.content).toBe('留言內容至少需要 10 個字。');
  });

  it('rejects choosing more than five emotion tags', () => {
    const errors = validateAnonymousPostInput({
      content: '這是一則超過十個字的留言內容。',
      emotionTags: ['😢 悲傷', '😞 失落', '😔 孤單', '😐 麻木', '😰 焦慮', '😣 壓力']
    });

    expect(errors.emotionTags).toBe('最多只能選擇 5 個情緒標籤。');
  });

  it('returns manual review and success messages in Traditional Chinese', () => {
    expect(getSubmissionMessage('MANUAL_REVIEW')).toBe('留言已收到，正在審核中。');
    expect(getSubmissionMessage('APPROVED')).toBe('留言已送出。');
  });

  it('switches to the completion experience only for successful end states', () => {
    expect(shouldShowCompletionState('idle')).toBe(false);
    expect(shouldShowCompletionState('ERROR')).toBe(false);
    expect(shouldShowCompletionState('APPROVED')).toBe(true);
    expect(shouldShowCompletionState('MANUAL_REVIEW')).toBe(true);
    expect(shouldShowCompletionState('CRISIS')).toBe(true);
  });

  it('resets the completed flow back to an empty writing state', () => {
    expect(getResetFormState()).toEqual({
      content: '',
      emotionTags: [],
      errors: {},
      state: 'idle',
      trackingCode: null
    });
  });

  it('caps selected emotion tags at five items', () => {
    const next = getNextEmotionTags(['1', '2', '3', '4', '5'], '6');

    expect(next).toEqual(['1', '2', '3', '4', '5']);
  });

  it('renders Traditional Chinese form labels', () => {
    const markup = renderToStaticMarkup(<AnonymousPostForm />);

    expect(markup).toContain('送出匿名留言');
    expect(markup).toContain('留言內容');
    expect(markup).toContain('情緒標籤');
  });

  it('renders tracking code guidance after a successful submission', () => {
    const markup = renderToStaticMarkup(
      <SubmissionResult state="APPROVED" trackingCode="track_12345678" onReset={() => undefined} />
    );

    expect(markup).toContain('track_12345678');
    expect(markup).toContain('/my-post');
    expect(markup).toContain('查詢碼');
    expect(markup).not.toContain('留言內容');
  });
});
