'use client';

import React, { useState } from 'react';

type LookupResponse = {
  success: boolean;
  data?: {
    trackingCode: string;
    content: string;
    status: string;
    createdAt: string | null;
  };
  error?: {
    message: string;
  };
};

export function PostLookupForm() {
  const [trackingCode, setTrackingCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResponse['data'] | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!trackingCode.trim()) {
      setError('請輸入 tracking code。');
      setResult(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/posts/${encodeURIComponent(trackingCode.trim())}`);
      const payload = (await response.json()) as LookupResponse;

      if (!response.ok || !payload.success || !payload.data) {
        setResult(null);
        setError(payload.error?.message ?? '查詢失敗，請稍後再試。');
        return;
      }

      setResult(payload.data);
    } catch {
      setResult(null);
      setError('查詢失敗，請稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <form className="write-form" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="trackingCode">tracking code</label>
        <input
          id="trackingCode"
          name="trackingCode"
          className="text-area"
          style={{ minHeight: 'auto' }}
          value={trackingCode}
          onChange={(event) => setTrackingCode(event.target.value)}
          placeholder="例如：track_abcd1234"
        />
        <button className="primary-link submit-button" disabled={isLoading} type="submit">
          {isLoading ? '查詢中...' : '查詢留言'}
        </button>
      </form>

      {error ? <p className="field-error">{error}</p> : null}

      {result ? (
        <section className="card" style={{ padding: '1.5rem' }}>
          <p>查詢碼：{result.trackingCode}</p>
          <p>狀態：{result.status}</p>
          <p>{result.content}</p>
        </section>
      ) : null}
    </div>
  );
}
