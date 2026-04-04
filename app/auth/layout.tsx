import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <Link
        href="/"
        style={{
          color: 'var(--muted)',
          fontSize: '1.1rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          marginBottom: '0.5rem',
        }}
      >
        Lamp in the Dark
      </Link>
      {children}
    </main>
  );
}
