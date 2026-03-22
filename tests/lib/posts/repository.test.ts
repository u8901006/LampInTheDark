import { describe, expect, it, vi } from 'vitest';

import { createPostRepository } from '@/lib/posts/repository';

describe('createPostRepository', () => {
  it('persists a post row and moderation run rows into Supabase tables', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn((table: string) => ({
      insert: (payload: unknown) => {
        insert(table, payload);
        return Promise.resolve({ error: null });
      }
    }));

    const repository = createPostRepository({ from } as never);

    await repository.savePost({
      id: 'post_123',
      trackingCode: 'track_123',
      content: 'This is a persisted test post.',
      emotionTags: ['hope'],
      deviceFingerprintHash: 'device_hash',
      status: 'MANUAL_REVIEW',
      moderationPath: 'nvidia->zhipu->manual',
      moderationRuns: [
        {
          provider: 'nvidia',
          attemptOrder: 1,
          decision: 'ERROR',
          confidence: null,
          reasonCode: null,
          latencyMs: 2500,
          errorCode: 'TIMEOUT',
          rawResponseRedacted: {}
        }
      ]
    });

    expect(insert).toHaveBeenNthCalledWith(
      1,
      'posts',
      expect.objectContaining({
        id: 'post_123',
        tracking_code: 'track_123',
        status: 'MANUAL_REVIEW',
        moderation_path: 'nvidia->zhipu->manual'
      })
    );
    expect(insert).toHaveBeenNthCalledWith(
      2,
      'moderation_runs',
      expect.arrayContaining([
        expect.objectContaining({
          post_id: 'post_123',
          provider: 'nvidia',
          error_code: 'TIMEOUT'
        })
      ])
    );
  });

  it('returns queue items from joined posts and moderation runs data', async () => {
    const order = vi.fn().mockResolvedValue({
      data: [
        {
          id: 'post_123',
          tracking_code: 'track_123',
          content: 'Queue content',
          status: 'MANUAL_REVIEW',
          moderation_path: 'nvidia->manual',
          moderation_runs: [
            {
              provider: 'nvidia',
              attempt_order: 1,
              decision: 'UNCERTAIN',
              confidence: 0.4,
              reason_code: 'ambiguous_content',
              latency_ms: 1200,
              error_code: null,
              raw_response_redacted: { label: 'uncertain' }
            }
          ]
        }
      ],
      error: null
    });
    const select = vi.fn(() => ({ order }));
    const from = vi.fn(() => ({ select }));

    const repository = createPostRepository({ from } as never);
    const queue = await repository.listAdminQueue();

    expect(queue).toEqual([
      expect.objectContaining({
        id: 'post_123',
        trackingCode: 'track_123',
        status: 'MANUAL_REVIEW',
        moderationPath: 'nvidia->manual',
        moderationRuns: [
          expect.objectContaining({
            provider: 'nvidia',
            decision: 'UNCERTAIN'
          })
        ]
      })
    ]);
  });

  it('finds a post by tracking code', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'post_lookup',
        tracking_code: 'lookup123',
        content: 'Lookup content',
        emotion_tags: ['hope'],
        status: 'MANUAL_REVIEW',
        moderation_path: 'nvidia->manual',
        created_at: '2026-03-20T10:00:00.000Z'
      },
      error: null
    });
    const eq = vi.fn(() => ({ maybeSingle }));
    const select = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ select }));

    const repository = createPostRepository({ from } as never);
    const post = await repository.findPostByTrackingCode('lookup123');

    expect(post).toEqual({
      id: 'post_lookup',
      trackingCode: 'lookup123',
      content: 'Lookup content',
      emotionTags: ['hope'],
      status: 'MANUAL_REVIEW',
      moderationPath: 'nvidia->manual',
      createdAt: '2026-03-20T10:00:00.000Z'
    });
  });

  it('lists only approved public posts ordered newest first', async () => {
    const order = vi.fn().mockResolvedValue({
      data: [
        {
          id: 'post_public_1',
          tracking_code: 'pub1',
          content: 'Approved post',
          emotion_tags: ['hope'],
          status: 'APPROVED',
          moderation_path: 'nvidia',
          created_at: '2026-03-20T10:00:00.000Z'
        },
        {
          id: 'post_public_2',
          tracking_code: 'pub2',
          content: 'Rejected post',
          emotion_tags: ['anger'],
          status: 'REJECTED',
          moderation_path: 'nvidia',
          created_at: '2026-03-20T09:00:00.000Z'
        }
      ],
      error: null
    });
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ select }));

    const repository = createPostRepository({ from } as never);
    const posts = await repository.listPublicPosts();

    expect(posts).toEqual([
      {
        id: 'post_public_1',
        content: 'Approved post',
        emotionTags: ['hope'],
        createdAt: '2026-03-20T10:00:00.000Z'
      }
    ]);
  });
});
