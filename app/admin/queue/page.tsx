import { getAdminQueueItems } from '@/lib/posts/store';

export default function AdminQueuePage() {
  const items = getAdminQueueItems();

  return (
    <main className="shell" style={{ padding: '3rem 0 5rem' }}>
      <section className="card" style={{ padding: '2rem' }}>
        <p style={{ color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Admin Queue
        </p>
        <h1 style={{ marginTop: '0.5rem' }}>Moderation Review</h1>
        <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
          Queue entries show the moderation path and final status before manual handling.
        </p>

        <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
          {items.length === 0 ? (
            <div className="card" style={{ padding: '1rem 1.25rem' }}>
              No queued items yet.
            </div>
          ) : (
            items.map((item) => (
              <article key={item.id} className="card" style={{ padding: '1rem 1.25rem' }}>
                <strong>{item.id}</strong>
                <p style={{ margin: '0.5rem 0 0', color: 'var(--muted)' }}>{item.moderationPath}</p>
                <p style={{ margin: '0.35rem 0 0' }}>Status: {item.status}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
