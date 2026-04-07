'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: '首頁' },
  { href: '/diary/weekly', label: '每週日誌卡' },
  { href: '/diary/daily', label: '每日日誌卡' },
  { href: '/emergency-plan', label: '緊急計劃' },
  { href: '/timeline', label: '生命歷程圖' },
  { href: '/sleep-diary', label: '睡眠日記' },
];

export function ClientNav() {
  const pathname = usePathname();

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
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
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
    </nav>
  );
}
