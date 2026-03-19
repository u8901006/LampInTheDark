import { describe, expect, it, vi } from 'vitest';

import { createPostRouteHandler } from '@/lib/api/posts';

describe('createPostRouteHandler', () => {
  it('returns manual review when both providers fail technically', async () => {
    const handler = createPostRouteHandler({
      moderate: vi.fn().mockResolvedValue({
        finalDecision: 'MANUAL_REVIEW',
        path: 'nvidia->openrouter->manual',
        runs: []
      })
    });

    const response = await handler({
      content: 'test post!',
      emotionTags: ['sadness'],
      deviceFingerprintHash: 'device-1'
    });

    expect(response.success).toBe(true);
    if (!response.success) {
      throw new Error('Expected success response');
    }
    expect(response.data.status).toBe('MANUAL_REVIEW');
  });

  it('returns validation errors in unified format', async () => {
    const handler = createPostRouteHandler({
      moderate: vi.fn()
    });

    const response = await handler({
      content: 'short',
      emotionTags: ['sadness'],
      deviceFingerprintHash: 'device-1'
    });

    expect(response.success).toBe(false);
    if (response.success) {
      throw new Error('Expected error response');
    }
    expect(response.error.code).toBe('VALIDATION_ERROR');
  });

  it('passes content and moderation runs to persistence layer', async () => {
    const savePost = vi.fn().mockResolvedValue(undefined);
    const handler = createPostRouteHandler({
      moderate: vi.fn().mockResolvedValue({
        finalDecision: 'APPROVED',
        path: 'nvidia',
        runs: [
          {
            provider: 'nvidia',
            attemptOrder: 1,
            decision: 'APPROVED',
            confidence: 0.9,
            reasonCode: 'safe',
            latencyMs: 300,
            errorCode: null,
            rawResponseRedacted: { label: 'approved' }
          }
        ]
      }),
      savePost
    });

    await handler({
      content: 'This is a valid persisted post.',
      emotionTags: ['hope'],
      deviceFingerprintHash: 'device-1'
    });

    expect(savePost).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'This is a valid persisted post.',
        moderationRuns: [expect.objectContaining({ provider: 'nvidia' })]
      })
    );
  });
});
