import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { MetricsCards } from '@/components/admin/metrics-cards';
import { ModerationActions } from '@/components/admin/moderation-actions';
import { QueueFilters } from '@/components/admin/queue-filters';
import { computeModerationMetrics } from '@/lib/admin/metrics';
import { createAdminRuntime } from '@/lib/admin/runtime';
import { readAdminSessionToken, verifyAdminSession } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

export default async function AdminQueuePage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const runtime = createAdminRuntime();
  const cookieStore = await cookies();
  const token = readAdminSessionToken(cookieStore.toString());
  const identity = await verifyAdminSession(token, {
    anonClient: runtime.anonClient,
    adminClient: runtime.adminClient
  });

  if (!identity) {
    redirect('/admin/login');
  }

  const params = (await searchParams) ?? {};
  const items = await runtime.repository.listAdminQueue({
    query: params.query,
    status: params.status,
    provider: params.provider,
    decision: params.decision
  });
  const metrics = computeModerationMetrics(items);

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

        <div style={{ marginTop: '2rem' }}>
          <MetricsCards metrics={metrics} />
        </div>

        <div style={{ marginTop: '2rem' }}>
          <QueueFilters />
        </div>

        <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
          {items.length === 0 ? (
            <div className="card" style={{ padding: '1rem 1.25rem' }}>
              No queued items yet.
            </div>
          ) : (
            items.map((item) => (
              <article key={item.id} className="card" style={{ padding: '1rem 1.25rem' }}>
                <strong>{item.id}</strong>
                <p style={{ margin: '0.5rem 0 0' }}>{item.content?.slice(0, 140) ?? '無摘要'}</p>
                <p style={{ margin: '0.5rem 0 0', color: 'var(--muted)' }}>{item.moderationPath}</p>
                <p style={{ margin: '0.35rem 0 0' }}>Status: {item.status}</p>
                <p style={{ margin: '0.35rem 0 0', color: 'var(--muted)' }}>
                  Attempts: {item.moderationRuns.map((run) => `${run.provider}:${run.decision}`).join(' / ')}
                </p>
                <ModerationActions postId={item.id} />
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
