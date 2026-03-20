import { describe, expect, it, vi } from 'vitest';

import { GET } from '@/app/api/v1/admin/metrics/route';

vi.mock('@/lib/admin/runtime', () => ({
  createAdminRuntime: () => ({
    anonClient: { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-1', email: 'a@test.com' } }, error: null }) } },
    adminClient: { from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ data: [{ user_id: 'admin-1' }], error: null }) })) })) },
    repository: {
      listAdminQueue: vi.fn().mockResolvedValue([
        {
          id: 'post-1',
          status: 'MANUAL_REVIEW',
          moderationPath: 'nvidia->manual',
          moderationRuns: [
            { provider: 'nvidia', attemptOrder: 1, decision: 'ERROR', confidence: null, reasonCode: null, latencyMs: 100, errorCode: 'TIMEOUT', rawResponseRedacted: {} }
          ]
        }
      ])
    }
  })
}));

describe('GET /api/v1/admin/metrics', () => {
  it('returns moderation metrics for admins', async () => {
    const response = await GET(new Request('http://localhost/api/v1/admin/metrics', { headers: { cookie: 'litd_admin_session=token' } }));

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true, data: { providerCounts: { nvidia: 1 } } });
  });

  it('rejects requests without an admin session', async () => {
    const response = await GET(new Request('http://localhost/api/v1/admin/metrics'));

    expect(response.status).toBe(403);
  });
});
