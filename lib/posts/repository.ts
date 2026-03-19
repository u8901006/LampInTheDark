import type { SupabaseClient } from '@supabase/supabase-js';

import type { ModerationRunRecord } from '@/lib/moderation/types';
import type { PersistedPost, AdminQueueItem } from '@/lib/posts/store';

type MinimalSupabaseClient = Pick<SupabaseClient, 'from'>;

type PostRow = {
  id: string;
  content: string;
  emotion_tags: string[];
  device_fingerprint_hash: string;
  status: AdminQueueItem['status'];
  moderation_path: string;
  created_at?: string;
};

type ModerationRunInsertRow = {
  post_id: string;
  provider: ModerationRunRecord['provider'];
  attempt_order: number;
  decision: ModerationRunRecord['decision'];
  confidence: number | null;
  reason_code: string | null;
  latency_ms: number;
  error_code: string | null;
  raw_response_redacted: Record<string, unknown>;
};

type ModerationRunSelectRow = Omit<ModerationRunInsertRow, 'post_id'>;

export function createPostRepository(supabase: MinimalSupabaseClient) {
  return {
    async savePost(post: PersistedPost): Promise<void> {
      const { error: postError } = await supabase.from('posts').insert(toPostRow(post));
      if (postError) {
        throw postError;
      }

      if (post.moderationRuns.length === 0) {
        return;
      }

      const { error: runsError } = await supabase.from('moderation_runs').insert(
        post.moderationRuns.map((run) => toModerationRunRow(post.id, run))
      );

      if (runsError) {
        throw runsError;
      }
    },

    async listAdminQueue(): Promise<AdminQueueItem[]> {
      const { data, error } = await supabase
        .from('posts')
        .select(
          'id,status,moderation_path,moderation_runs(provider,attempt_order,decision,confidence,reason_code,latency_ms,error_code,raw_response_redacted)'
        )
        .order('created_at', { ascending: false })
        .eq('status', 'MANUAL_REVIEW');

      if (error) {
        throw error;
      }

      return (data ?? []).map((row) => ({
        id: row.id,
        status: row.status,
        moderationPath: row.moderation_path,
        moderationRuns: ((row.moderation_runs ?? []) as ModerationRunSelectRow[]).map((run) => ({
          provider: run.provider,
          attemptOrder: run.attempt_order,
          decision: run.decision,
          confidence: run.confidence,
          reasonCode: run.reason_code,
          latencyMs: run.latency_ms,
          errorCode: run.error_code,
          rawResponseRedacted: run.raw_response_redacted
        }))
      }));
    }
  };
}

function toPostRow(post: PersistedPost): PostRow {
  return {
    id: post.id,
    content: post.content,
    emotion_tags: post.emotionTags,
    device_fingerprint_hash: post.deviceFingerprintHash,
    status: post.status,
    moderation_path: post.moderationPath
  };
}

function toModerationRunRow(postId: string, run: ModerationRunRecord): ModerationRunInsertRow {
  return {
    post_id: postId,
    provider: run.provider,
    attempt_order: run.attemptOrder,
    decision: run.decision,
    confidence: run.confidence,
    reason_code: run.reasonCode,
    latency_ms: run.latencyMs,
    error_code: run.errorCode,
    raw_response_redacted: run.rawResponseRedacted
  };
}
