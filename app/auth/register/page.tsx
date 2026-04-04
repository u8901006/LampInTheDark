'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('密碼至少需要 8 個字元');
      return;
    }

    if (password !== confirmPassword) {
      setError('兩次輸入的密碼不一致');
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  }

  return (
    <section className="card" style={{ padding: '2.5rem', width: 'min(420px, 100%)' }}>
      <h1 style={{ marginTop: 0, marginBottom: '1.5rem' }}>註冊</h1>

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
          <label className="field-label" htmlFor="display_name">
            顯示名稱
          </label>
          <input
            id="display_name"
            type="text"
            required
            className="text-area"
            style={{ minHeight: 'auto' }}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

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
            minLength={8}
            className="text-area"
            style={{ minHeight: 'auto' }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="confirm_password">
            確認密碼
          </label>
          <input
            id="confirm_password"
            type="password"
            required
            minLength={8}
            className="text-area"
            style={{ minHeight: 'auto' }}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          className="primary-link submit-button"
          type="submit"
          disabled={loading}
        >
          {loading ? '註冊中…' : '註冊'}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Link
          href="/auth/login"
          style={{ color: 'var(--accent)', textDecoration: 'none' }}
        >
          已有帳號？登入
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
