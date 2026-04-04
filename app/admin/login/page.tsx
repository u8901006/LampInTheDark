'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setError('登入失敗，請重試');
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .single();

    if (profile?.role !== 'therapist') {
      await supabase.auth.signOut();
      setError('此帳號不是治療師帳號');
      setLoading(false);
      return;
    }

    router.push('/admin/dashboard');
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <Link
        href="/"
        style={{ color: 'var(--muted)', fontSize: '1.1rem', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none', marginBottom: '0.5rem' }}
      >
        Lamp in the Dark
      </Link>
      <section className="card" style={{ padding: '2.5rem', width: 'min(420px, 100%)' }}>
        <p style={{ color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Therapist</p>
        <h1 style={{ marginTop: 0, marginBottom: '1.5rem' }}>治療師登入</h1>

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
            {loading ? '登入中…' : '治療師登入'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem' }}>
          <Link
            href="/"
            style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '0.9rem' }}
          >
            ← 返回首頁
          </Link>
        </div>
      </section>
    </main>
  );
}
