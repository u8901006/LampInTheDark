import type { ModerationDecision, ModerationRunRecord } from '@/lib/moderation/types';

export type PostStatus = Extract<ModerationDecision, 'APPROVED' | 'REJECTED' | 'CRISIS' | 'MANUAL_REVIEW'>;

export interface PersistedPost {
  id: string;
  content: string;
  emotionTags: string[];
  deviceFingerprintHash: string;
  status: PostStatus;
  moderationPath: string;
  moderationRuns: ModerationRunRecord[];
}

export interface AdminQueueItem {
  id: string;
  status: PostStatus;
  moderationPath: string;
  moderationRuns: ModerationRunRecord[];
}

const adminQueue: AdminQueueItem[] = [];

export async function saveAdminQueueItem(item: PersistedPost): Promise<void> {
  adminQueue.push({
    id: item.id,
    status: item.status,
    moderationPath: item.moderationPath,
    moderationRuns: item.moderationRuns
  });
}

export function getAdminQueueItems(): AdminQueueItem[] {
  return [...adminQueue];
}
