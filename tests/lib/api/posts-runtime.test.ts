import { beforeEach, describe, expect, it, vi } from 'vitest';

const createRuntimePostDependencies = vi.fn(() => ({
  moderate: vi.fn(),
  savePost: vi.fn(),
  findPostByTrackingCode: vi.fn(),
  listPublicPosts: vi.fn()
}));

const createPublicRuntimePostDependencies = vi.fn(() => ({
  findPostByTrackingCode: vi.fn().mockResolvedValue(null),
  listPublicPosts: vi.fn().mockResolvedValue([])
}));

vi.mock('@/lib/posts/runtime', () => ({
  createRuntimePostDependencies,
  createPublicRuntimePostDependencies
}));

describe('public post runtime factories', () => {
  beforeEach(() => {
    createRuntimePostDependencies.mockClear();
    createPublicRuntimePostDependencies.mockClear();
  });

  it('uses the public runtime for lookup and public feed handlers', async () => {
    const { createTrackingCodeLookupMethod, createPublicPostsMethod } = await import('@/lib/api/posts');

    await createTrackingCodeLookupMethod()(new Request('http://localhost/api/v1/posts/track_1234567890abcdef'), {
      params: Promise.resolve({ trackingCode: 'track_1234567890abcdef' })
    });
    await createPublicPostsMethod()(new Request('http://localhost/api/v1/posts'));

    expect(createPublicRuntimePostDependencies).toHaveBeenCalledTimes(2);
    expect(createRuntimePostDependencies).not.toHaveBeenCalled();
  });
});
