import React from 'react';
import type { ModerationMetrics } from '@/lib/admin/metrics';

export function MetricsCards({ metrics }: { metrics: ModerationMetrics }) {
  const cards = [
    ['NVIDIA', String(metrics.providerCounts.nvidia)],
    ['Zhipu', String(metrics.providerCounts.zhipu)],
    ['成功率', `${Math.round(metrics.successRate * 100)}%`],
    ['平均延遲', `${metrics.averageLatencyMs}ms`],
    ['人工審核比例', `${Math.round(metrics.manualReviewRatio * 100)}%`],
    ['錯誤次數', String(metrics.errorCount)]
  ];

  return (
    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
      {cards.map(([label, value]) => (
        <article key={label} className="card" style={{ padding: '1rem 1.25rem' }}>
          <p style={{ margin: 0, color: 'var(--muted)' }}>{label}</p>
          <strong style={{ fontSize: '1.6rem' }}>{value}</strong>
        </article>
      ))}
    </div>
  );
}
