'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(error.message);
        return;
      }

      const accessToken = data.session?.access_token;
      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        setError(result?.error ?? '登入成功，但個人資料初始化失敗');
        await supabase.auth.signOut();
        return;
      }

      window.location.assign('/dashboard');
    } catch {
      setError('登入失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card" style={{ padding: '2.5rem', width: 'min(420px, 100%)' }}>
      <h1 style={{ marginTop: 0, marginBottom: '1.5rem' }}>登入</h1>

      {error && (
        <p
          style={{
            margin: '0 0 1rem',
            padding: '0.75rem 1rem',
            background: '#fff1f1',
            color: '#9f2d2d',
            borderRadius: '0.75rem',
          }}
        >
          {error}
        </p>
      )}

      <form className="write-form" onSubmit={handleSubmit}>
        <div>
          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            className="text-area"
            style={{ minHeight: 'auto' }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="password">
            密碼
          </label>
          <input
            id="password"
            type="password"
            required
            className="text-area"
            style={{ minHeight: 'auto' }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          className="primary-link submit-button"
          type="submit"
          disabled={loading}
        >
          {loading ? '登入中…' : '登入'}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Link
          href="/auth/register"
          style={{ color: 'var(--accent)', textDecoration: 'none' }}
        >
          還沒有帳號？註冊
        </Link>
        <Link
          href="/"
          style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem' }}
        >
          ← 返回首頁
        </Link>
      </div>
    </section>
  );
}
