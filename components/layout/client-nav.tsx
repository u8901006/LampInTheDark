'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: '儀表板' },
  { href: '/diary/weekly', label: '每週日誌卡' },
  { href: '/diary/daily', label: '每日日誌卡' },
  { href: '/emergency-plan', label: '緊急計劃' },
  { href: '/timeline', label: '生命歷程圖' },
  { href: '/sleep-diary', label: '睡眠日記' },
];

export function ClientNav() {
  const pathname = usePathname();

  async function handleLogout() {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  }

  return (
    <nav style={{
      width: '220px',
      minHeight: '100vh',
      padding: '1.5rem 1rem',
      borderRight: '1px solid var(--line)',
      background: 'var(--surface)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
    }}>
      <p style={{ fontWeight: 700, fontSize: '1.1rem', padding: '0 0.75rem', marginBottom: '1rem', color: 'var(--accent)' }}>
        Lamp in the Dark
      </p>
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'block',
              padding: '0.65rem 0.75rem',
              borderRadius: '12px',
              textDecoration: 'none',
              color: isActive ? 'var(--accent)' : 'var(--text)',
              background: isActive ? 'var(--accent-soft)' : 'transparent',
              fontWeight: isActive ? 700 : 400,
            }}
          >
            {item.label}
          </Link>
        );
      })}
      <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '0.65rem 0.75rem',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            background: 'transparent',
            color: 'var(--muted)',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          登出
        </button>
      </div>
    </nav>
  );
}
