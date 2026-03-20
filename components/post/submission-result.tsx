import React from 'react';
import type { ModerationState } from '@/components/post/anonymous-post-form';

interface SubmissionResultProps {
  state: ModerationState;
}

export function SubmissionResult({ state }: SubmissionResultProps) {
  if (state === 'idle') {
    return null;
  }

  const message =
    state === 'APPROVED'
      ? '留言已送出。'
      : state === 'MANUAL_REVIEW'
        ? '留言已收到，正在審核中。'
        : state === 'CRISIS'
          ? '我們已收到你的留言，若你正處於急迫危險中，請立即尋求當地緊急支援。'
          : '送出失敗，請稍後再試。';

  return <p className="submission-note">{message}</p>;
}
