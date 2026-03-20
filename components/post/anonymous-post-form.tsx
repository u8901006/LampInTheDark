'use client';

import React, { useMemo, useState } from 'react';

import { EmotionTagSelector } from '@/components/post/emotion-tag-selector';
import { SubmissionResult } from '@/components/post/submission-result';

export type ModerationState = 'idle' | 'APPROVED' | 'MANUAL_REVIEW' | 'CRISIS' | 'ERROR';

interface ValidationErrors {
  content?: string;
  emotionTags?: string;
}

interface AnonymousPostInput {
  content: string;
  emotionTags: string[];
}

export function validateAnonymousPostInput(input: AnonymousPostInput): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!input.content.trim()) {
    errors.content = '請輸入留言內容。';
  } else if (input.content.trim().length < 10) {
    errors.content = '留言內容至少需要 10 個字。';
  }

  if (input.emotionTags.length === 0) {
    errors.emotionTags = '請至少選擇一個情緒標籤。';
  }

  return errors;
}

export function getSubmissionMessage(state: Exclude<ModerationState, 'idle'>): string {
  switch (state) {
    case 'APPROVED':
      return '留言已送出。';
    case 'MANUAL_REVIEW':
      return '留言已收到，正在審核中。';
    case 'CRISIS':
      return '我們已收到你的留言，若你正處於急迫危險中，請立即尋求當地緊急支援。';
    default:
      return '送出失敗，請稍後再試。';
  }
}

function buildDeviceFingerprint(): string {
  if (typeof navigator === 'undefined') {
    return 'server-fingerprint';
  }

  return `${navigator.userAgent}-${navigator.language}`.replace(/\s+/g, '_');
}

export function AnonymousPostForm() {
  const [content, setContent] = useState('');
  const [emotionTags, setEmotionTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, setState] = useState<ModerationState>('idle');
  const [trackingCode, setTrackingCode] = useState<string | null>(null);

  const deviceFingerprintHash = useMemo(() => buildDeviceFingerprint(), []);

  const toggleTag = (tag: string) => {
    setEmotionTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateAnonymousPostInput({ content, emotionTags });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setState('idle');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/v1/posts', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          content,
          emotionTags,
          deviceFingerprintHash
        })
      });

      const result = (await response.json()) as {
        success: boolean;
        data?: { status: ModerationState; trackingCode?: string };
      };

      if (!response.ok || !result.success || !result.data) {
        setState('ERROR');
        setTrackingCode(null);
        return;
      }

      setState(result.data.status);
      setTrackingCode(result.data.trackingCode ?? null);
      setContent('');
      setEmotionTags([]);
      setErrors({});
    } catch {
      setState('ERROR');
      setTrackingCode(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="write-form" onSubmit={handleSubmit}>
      <label className="field-label" htmlFor="content">
        留言內容
      </label>
      <textarea
        id="content"
        className="text-area"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="把你想說的話留在這裡。"
        rows={8}
      />
      {errors.content ? <p className="field-error">{errors.content}</p> : null}

      <div>
        <p className="field-label">情緒標籤</p>
        <EmotionTagSelector selectedTags={emotionTags} onToggle={toggleTag} />
        {errors.emotionTags ? <p className="field-error">{errors.emotionTags}</p> : null}
      </div>

      <button className="primary-link submit-button" disabled={isSubmitting} type="submit">
        {isSubmitting ? '送出中...' : '送出匿名留言'}
      </button>

      <SubmissionResult state={state} trackingCode={trackingCode} />
    </form>
  );
}
