import type { ModerationDecision, ModerationRunRecord } from '@/lib/moderation/types';

export type PostStatus = Extract<ModerationDecision, 'APPROVED' | 'REJECTED' | 'CRISIS' | 'MANUAL_REVIEW'>;

export interface PersistedPost {
  id: string;
  trackingCode: string;
  content: string;
  emotionTags: string[];
  deviceFingerprintHash: string;
  status: PostStatus;
  moderationPath: string;
  moderationRuns: ModerationRunRecord[];
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  reviewNote?: string | null;
}

export interface AdminQueueItem {
  id: string;
  trackingCode?: string;
  content?: string;
  status: PostStatus;
  moderationPath: string;
  moderationRuns: ModerationRunRecord[];
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  reviewNote?: string | null;
}

const adminQueue: AdminQueueItem[] = [];

export async function saveAdminQueueItem(item: PersistedPost): Promise<void> {
  adminQueue.push({
    id: item.id,
    trackingCode: item.trackingCode,
    content: item.content,
    status: item.status,
    moderationPath: item.moderationPath,
    moderationRuns: item.moderationRuns,
    reviewedAt: item.reviewedAt ?? null,
    reviewedBy: item.reviewedBy ?? null,
    reviewNote: item.reviewNote ?? null
  });
}

export function getAdminQueueItems(): AdminQueueItem[] {
  return [...adminQueue];
}
