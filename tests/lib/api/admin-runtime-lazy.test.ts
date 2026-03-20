import { beforeEach, describe, expect, it, vi } from 'vitest';

const createAdminRuntime = vi.fn(() => ({
  anonClient: { auth: { getUser: vi.fn() } },
  adminClient: { from: vi.fn() },
  repository: {
    listAdminQueue: vi.fn(),
    updateModerationDecision: vi.fn()
  }
}));

vi.mock('@/lib/admin/runtime', () => ({
  createAdminRuntime
}));

describe('admin runtime factories', () => {
  beforeEach(() => {
    createAdminRuntime.mockClear();
  });

  it('does not create runtime while wiring admin handlers', async () => {
    const { createAdminLoginPost } = await import('@/lib/api/admin-login');
    const { createAdminMetricsGet } = await import('@/lib/api/admin-metrics');
    const { createRuntimeAdminQueueGet } = await import('@/lib/api/admin-queue');

    createAdminLoginPost();
    createAdminMetricsGet();
    createRuntimeAdminQueueGet();

    expect(createAdminRuntime).not.toHaveBeenCalled();
  });
});
