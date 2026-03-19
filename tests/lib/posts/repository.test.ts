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
      content: 'This is a persisted test post.',
      emotionTags: ['hope'],
      deviceFingerprintHash: 'device_hash',
      status: 'MANUAL_REVIEW',
      moderationPath: 'nvidia->openrouter->manual',
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
        status: 'MANUAL_REVIEW',
        moderation_path: 'nvidia->openrouter->manual'
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
    const eq = vi.fn().mockResolvedValue({
      data: [
        {
          id: 'post_123',
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
    const order = vi.fn(() => ({ eq }));
    const select = vi.fn(() => ({ order }));
    const from = vi.fn(() => ({ select }));

    const repository = createPostRepository({ from } as never);
    const queue = await repository.listAdminQueue();

    expect(queue).toEqual([
      {
        id: 'post_123',
        status: 'MANUAL_REVIEW',
        moderationPath: 'nvidia->manual',
        moderationRuns: [
          expect.objectContaining({
            provider: 'nvidia',
            decision: 'UNCERTAIN'
          })
        ]
      }
    ]);
  });
});
