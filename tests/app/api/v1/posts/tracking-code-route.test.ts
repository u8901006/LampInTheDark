import { describe, expect, it, vi } from 'vitest';

import { createTrackingCodeLookupMethod } from '@/lib/api/posts';

describe('GET /api/v1/posts/[trackingCode]', () => {
  it('returns a post for a valid tracking code', async () => {
    const response = await createTrackingCodeLookupMethod({
      findPostByTrackingCode: vi.fn().mockResolvedValue({
        id: 'post_1',
        trackingCode: 'track_1234567890abcdef',
        content: 'Lookup content',
        emotionTags: ['hope'],
        status: 'MANUAL_REVIEW',
        moderationPath: 'nvidia->manual',
        createdAt: '2026-03-20T10:00:00.000Z'
      })
    })(new Request('http://localhost/api/v1/posts/track_1234567890abcdef'), { params: Promise.resolve({ trackingCode: 'track_1234567890abcdef' }) });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toMatchObject({
      success: true,
      data: {
        trackingCode: 'track_1234567890abcdef',
        status: 'MANUAL_REVIEW'
      }
    });
    expect(payload).not.toHaveProperty('data.moderationPath');
  });

  it('returns 404 when the tracking code does not exist', async () => {
    const response = await createTrackingCodeLookupMethod({
      findPostByTrackingCode: vi.fn().mockResolvedValue(null)
    })(new Request('http://localhost/api/v1/posts/track_abcdef0123456789'), { params: Promise.resolve({ trackingCode: 'track_abcdef0123456789' }) });

    expect(response.status).toBe(404);
  });

  it('returns 422 when the tracking code format is invalid', async () => {
    const response = await createTrackingCodeLookupMethod({
      findPostByTrackingCode: vi.fn()
    })(new Request('http://localhost/api/v1/posts/bad!'), { params: Promise.resolve({ trackingCode: 'bad!' }) });

    expect(response.status).toBe(422);
  });
});
