import { describe, expect, it } from 'vitest';

import { createAdminQueueGet, getAdminQueue } from '@/lib/api/admin-queue';

describe('getAdminQueue', () => {
  it('returns moderation path metadata for queue items', async () => {
    const body = await getAdminQueue([
      {
        id: 'post-1',
        status: 'MANUAL_REVIEW',
        moderationPath: 'nvidia->zhipu->manual',
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
        moderationPath: 'nvidia->zhipu->manual',
        moderationRuns: []
      }
    ])();

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      success: true,
      data: [{ id: 'post-3' }]
    });
  });

  it('filters queue items by status query parameter', async () => {
    const response = await createAdminQueueGet(async () => [
      { id: 'post-4', content: 'foo', status: 'MANUAL_REVIEW', moderationPath: 'nvidia->manual', moderationRuns: [] },
      { id: 'post-5', content: 'bar', status: 'APPROVED', moderationPath: 'nvidia', moderationRuns: [] }
    ])(new Request('http://localhost/api/v1/admin/queue?status=MANUAL_REVIEW'));

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true, data: [{ id: 'post-4' }] });
  });

  it('filters queue items by provider and decision query parameters', async () => {
    const response = await createAdminQueueGet(async () => [
      {
        id: 'post-6',
        content: 'match',
        status: 'MANUAL_REVIEW',
        moderationPath: 'nvidia->manual',
        moderationRuns: [{ provider: 'nvidia', attemptOrder: 1, decision: 'ERROR', confidence: null, reasonCode: null, latencyMs: 10, errorCode: 'TIMEOUT', rawResponseRedacted: {} }]
      },
      {
        id: 'post-7',
        content: 'no-match',
        status: 'MANUAL_REVIEW',
        moderationPath: 'zhipu->manual',
        moderationRuns: [{ provider: 'zhipu', attemptOrder: 1, decision: 'APPROVED', confidence: 0.9, reasonCode: 'safe', latencyMs: 10, errorCode: null, rawResponseRedacted: {} }]
      }
    ])(new Request('http://localhost/api/v1/admin/queue?provider=nvidia&decision=ERROR'));

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true, data: [{ id: 'post-6' }] });
  });

  it('matches query filters case-insensitively against content', async () => {
    const response = await createAdminQueueGet(async () => [
      { id: 'post-8', content: 'Hello World', status: 'MANUAL_REVIEW', moderationPath: 'nvidia->manual', moderationRuns: [] }
    ])(new Request('http://localhost/api/v1/admin/queue?query=hello'));

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true, data: [{ id: 'post-8' }] });
  });
});
