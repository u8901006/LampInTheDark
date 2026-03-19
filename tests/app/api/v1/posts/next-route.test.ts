import { describe, expect, it, vi } from 'vitest';

import { createPostMethod } from '@/lib/api/posts';

describe('POST /api/v1/posts Next route', () => {
  it('returns a 201 response for an approved post', async () => {
    const request = new Request('http://localhost/api/v1/posts', {
      method: 'POST',
      body: JSON.stringify({
        content: 'This is a valid test post.',
        emotionTags: ['hope'],
        deviceFingerprintHash: 'device-1'
      }),
      headers: {
        'content-type': 'application/json'
      }
    });

    const response = await createPostMethod({
      moderate: vi.fn().mockResolvedValue({
        finalDecision: 'APPROVED',
        path: 'nvidia',
        runs: []
      }),
      savePost: vi.fn().mockResolvedValue(undefined)
    })(request);

    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({
      success: true,
      data: {
        status: 'APPROVED',
        publiclyVisible: true
      }
    });
  });
});
