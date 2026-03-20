import React from 'react';

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const error = params.error;

  return (
    <main className="shell" style={{ padding: '4rem 0 5rem' }}>
      <section className="card" style={{ padding: '2rem' }}>
        <p style={{ color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin</p>
        <h1 style={{ marginTop: '0.5rem' }}>管理員登入</h1>
        {error ? (
          <p style={{ marginTop: '1rem', color: '#9f2d2d', background: '#fff1f1', padding: '0.75rem 1rem', borderRadius: '0.75rem' }}>
            {error}
          </p>
        ) : null}
        <form className="write-form" method="post" action="/api/v1/admin/login">
          <label className="field-label" htmlFor="email">Email</label>
          <input id="email" name="email" className="text-area" style={{ minHeight: 'auto' }} />
          <label className="field-label" htmlFor="password">密碼</label>
          <input id="password" name="password" type="password" className="text-area" style={{ minHeight: 'auto' }} />
          <button className="primary-link submit-button" type="submit">登入後台</button>
        </form>
      </section>
    </main>
  );
}
