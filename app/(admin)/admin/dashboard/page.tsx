import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function TherapistDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: clients } = await supabase
    .from('profiles')
    .select('id, display_name, created_at')
    .eq('role', 'client')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>案主總覽</h1>
      {clients && clients.length > 0 ? (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {clients.map(client => (
            <Link
              key={client.id}
              href={`/admin/client/${client.id}`}
              className="card"
              style={{
                display: 'block',
                padding: '1rem 1.25rem',
                textDecoration: 'none',
                color: 'var(--text)',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                {client.display_name || '未命名案主'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                註冊日期：{new Date(client.created_at).toLocaleDateString('zh-TW')}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--muted)' }}>目前沒有註冊的案主</p>
      )}
    </div>
  );
}
