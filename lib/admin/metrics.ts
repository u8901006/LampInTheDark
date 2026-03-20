import type { AdminQueueItem } from '@/lib/posts/store';

export interface ModerationMetrics {
  providerCounts: Record<'nvidia' | 'openrouter', number>;
  successRate: number;
  averageLatencyMs: number;
  manualReviewRatio: number;
  errorCount: number;
}

export function computeModerationMetrics(
  items: AdminQueueItem[],
  options?: { now?: Date; windowDays?: number }
): ModerationMetrics {
  const now = options?.now ?? new Date();
  const windowDays = options?.windowDays ?? 7;
  const cutoff = now.getTime() - windowDays * 24 * 60 * 60 * 1000;
  const runs = items
    .flatMap((item) => item.moderationRuns)
    .filter((run) => !run.createdAt || new Date(run.createdAt).getTime() >= cutoff);
  const providerCounts = {
    nvidia: runs.filter((run) => run.provider === 'nvidia').length,
    openrouter: runs.filter((run) => run.provider === 'openrouter').length
  };
  const windowedItems = items.filter((item) =>
    item.moderationRuns.some((run) => !run.createdAt || new Date(run.createdAt).getTime() >= cutoff)
  );
  const successCount = runs.filter((run) => run.decision === 'APPROVED' || run.decision === 'REJECTED').length;
  const totalRuns = runs.length || 1;
  const averageLatencyMs = runs.length
    ? Math.round(runs.reduce((sum, run) => sum + run.latencyMs, 0) / runs.length)
    : 0;
  const manualReviewCount = windowedItems.filter((item) => item.status === 'MANUAL_REVIEW').length;

  return {
    providerCounts,
    successRate: successCount / totalRuns,
    averageLatencyMs,
    manualReviewRatio: windowedItems.length ? manualReviewCount / windowedItems.length : 0,
    errorCount: runs.filter((run) => run.decision === 'ERROR').length
  };
}
