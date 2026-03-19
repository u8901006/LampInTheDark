import { describe, expect, it } from 'vitest';

import { createAdminQueueGet, getAdminQueue } from '@/lib/api/admin-queue';

describe('getAdminQueue', () => {
  it('returns moderation path metadata for queue items', async () => {
    const body = await getAdminQueue([
      {
        id: 'post-1',
        status: 'MANUAL_REVIEW',
        moderationPath: 'nvidia->openrouter->manual',
        moderationRuns: []
      }
    ]);

    expect(body.success).toBe(true);
    if (!body.success) {
      throw new Error('Expected success response');
    }
    expect(body.data[0]).toHaveProperty('moderationPath');
  });

  it('returns a Next-compatible JSON response', async () => {
    const response = await createAdminQueueGet(() => [
      {
        id: 'post-2',
        status: 'MANUAL_REVIEW',
        moderationPath: 'nvidia->manual',
        moderationRuns: []
      }
    ])();

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      success: true,
      data: [
        {
          id: 'post-2',
          moderationPath: 'nvidia->manual'
        }
      ]
    });
  });

  it('supports async queue providers such as Supabase repositories', async () => {
    const response = await createAdminQueueGet(async () => [
      {
        id: 'post-3',
        status: 'MANUAL_REVIEW',
        moderationPath: 'nvidia->openrouter->manual',
        moderationRuns: []
      }
    ])();

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      success: true,
      data: [{ id: 'post-3' }]
    });
  });
});
