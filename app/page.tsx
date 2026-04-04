import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="shell hero">
      <section className="card" style={{ padding: '2rem' }}>
        <p style={{ color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          LampInTheDark
        </p>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', margin: '0.5rem 0 1rem' }}>
          DBT-PTSD 電子日誌卡
        </h1>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.7, maxWidth: '42rem', color: 'var(--muted)' }}>
          這是一個供案主填寫 DBT-PTSD 治療日誌的數位平台。
          你可以記錄每週與每日的情緒、行為和治療進展，
          也可以管理緊急聯絡計劃、生命歷程圖和睡眠日記。
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
          <Link className="primary-link" href="/auth/login">
            案主登入
          </Link>
          <Link className="primary-link" href="/admin/login" style={{ background: 'var(--muted)' }}>
            治療師登入
          </Link>
        </div>
        <p className="soft-note" style={{ marginTop: '1.5rem' }}>
          還沒有帳號？<Link href="/auth/register" style={{ color: 'var(--accent)', fontWeight: 700 }}>註冊新帳號</Link>
        </p>
      </section>
    </main>
  );
}
