import type { SupabaseClient } from '@supabase/supabase-js';

import type { ModerationRunRecord } from '@/lib/moderation/types';
import type { PersistedPost, AdminQueueItem } from '@/lib/posts/store';

type MinimalSupabaseClient = Pick<SupabaseClient, 'from'>;

type PostRow = {
  id: string;
  tracking_code?: string;
  content: string;
  emotion_tags: string[];
  device_fingerprint_hash: string;
  status: AdminQueueItem['status'];
  moderation_path: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  review_note?: string | null;
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
type ModerationRunSelectWithTimestampRow = ModerationRunSelectRow & { created_at?: string | null };

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

    async listAdminQueue(filters?: {
      query?: string;
      status?: string;
      provider?: string;
      decision?: string;
    }): Promise<AdminQueueItem[]> {
      const { data, error } = await supabase
        .from('posts')
        .select(
          'id,tracking_code,content,status,moderation_path,reviewed_at,reviewed_by,review_note,moderation_runs(provider,attempt_order,decision,confidence,reason_code,latency_ms,error_code,raw_response_redacted,created_at)'
        )
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const items = (data ?? []).map((row) => ({
        id: row.id,
        trackingCode: row.tracking_code,
        content: row.content,
        status: row.status,
        moderationPath: row.moderation_path,
        reviewedAt: row.reviewed_at ?? null,
        reviewedBy: row.reviewed_by ?? null,
        reviewNote: row.review_note ?? null,
        moderationRuns: ((row.moderation_runs ?? []) as ModerationRunSelectWithTimestampRow[]).map((run) => ({
          provider: run.provider,
          attemptOrder: run.attempt_order,
          decision: run.decision,
          confidence: run.confidence,
          reasonCode: run.reason_code,
          latencyMs: run.latency_ms,
          errorCode: run.error_code,
          rawResponseRedacted: run.raw_response_redacted,
          createdAt: run.created_at ?? null
        }))
      }));

      return items.filter((item) => {
        if (filters?.status && item.status !== filters.status) {
          return false;
        }
        if (filters?.provider && !item.moderationRuns.some((run) => run.provider === filters.provider)) {
          return false;
        }
        if (filters?.decision && !item.moderationRuns.some((run) => run.decision === filters.decision)) {
          return false;
        }
        if (
          filters?.query &&
          !item.id.includes(filters.query) &&
          !item.content?.toLowerCase().includes(filters.query.toLowerCase())
        ) {
          return false;
        }
        return true;
      });
    },

    async findPostByTrackingCode(trackingCode: string): Promise<{
      id: string;
      trackingCode: string;
      content: string;
      emotionTags: string[];
      status: AdminQueueItem['status'];
      moderationPath: string;
      createdAt: string | null;
    } | null> {
      const { data, error } = await supabase
        .from('posts')
        .select('id,tracking_code,content,emotion_tags,status,moderation_path,created_at')
        .eq('tracking_code', trackingCode)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        trackingCode: data.tracking_code,
        content: data.content,
        emotionTags: data.emotion_tags,
        status: data.status,
        moderationPath: data.moderation_path,
        createdAt: data.created_at ?? null
      };
    },

    async listPublicPosts(): Promise<Array<{
      id: string;
      content: string;
      emotionTags: string[];
      createdAt: string | null;
    }>> {
      const { data, error } = await supabase
        .from('posts')
        .select('id,tracking_code,content,emotion_tags,status,moderation_path,created_at')
        .eq('status', 'APPROVED')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? [])
        .filter((row) => row.status === 'APPROVED')
        .map((row) => ({
          id: row.id,
          content: row.content,
          emotionTags: row.emotion_tags,
          createdAt: row.created_at ?? null
        }));
    },

    async updateModerationDecision(input: {
      postId: string;
      status: AdminQueueItem['status'];
      reviewedBy: string;
      reviewNote?: string | null;
    }): Promise<void> {
      const { error } = await supabase.from('posts').update({
        status: input.status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: input.reviewedBy,
        review_note: input.reviewNote ?? null
      }).eq('id', input.postId);

      if (error) {
        throw error;
      }
    }
  };
}

function toPostRow(post: PersistedPost): PostRow {
  return {
    id: post.id,
    tracking_code: post.trackingCode,
    content: post.content,
    emotion_tags: post.emotionTags,
    device_fingerprint_hash: post.deviceFingerprintHash,
    status: post.status,
    moderation_path: post.moderationPath,
    reviewed_at: post.reviewedAt ?? null,
    reviewed_by: post.reviewedBy ?? null,
    review_note: post.reviewNote ?? null
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
