import React from 'react';
import type { ModerationState } from '@/components/post/anonymous-post-form';

interface SubmissionResultProps {
  state: ModerationState;
  trackingCode?: string | null;
}

export function SubmissionResult({ state, trackingCode }: SubmissionResultProps) {
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

  return (
    <div className="submission-note">
      <p>{message}</p>
      {trackingCode ? (
        <div>
          <p>查詢碼：{trackingCode}</p>
          <a href="/my-post">前往查詢我的留言</a>
        </div>
      ) : null}
    </div>
  );
}
