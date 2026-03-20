import { describe, expect, it, vi } from 'vitest';

import { PATCH } from '@/app/api/v1/admin/posts/[id]/route';

vi.mock('@/lib/admin/runtime', () => ({
  createAdminRuntime: () => ({
    anonClient: { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-1', email: 'a@test.com' } }, error: null }) } },
    adminClient: { from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ data: [{ user_id: 'admin-1' }], error: null }) })) })) },
    repository: { updateModerationDecision: vi.fn().mockResolvedValue(undefined) }
  })
}));

describe('PATCH /api/v1/admin/posts/[id]', () => {
  it('approves a post for an admin session', async () => {
    const response = await PATCH(
      new Request('http://localhost/api/v1/admin/posts/post-1', {
        method: 'PATCH',
        headers: { cookie: 'litd_admin_session=token', 'content-type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' })
      }),
      { params: Promise.resolve({ id: 'post-1' }) }
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true, data: { id: 'post-1', status: 'APPROVED' } });
  });

  it('rejects invalid moderation statuses', async () => {
    const response = await PATCH(
      new Request('http://localhost/api/v1/admin/posts/post-1', {
        method: 'PATCH',
        headers: { cookie: 'litd_admin_session=token', 'content-type': 'application/json' },
        body: JSON.stringify({ status: 'CRISIS' })
      }),
      { params: Promise.resolve({ id: 'post-1' }) }
    );

    expect(response.status).toBe(422);
  });
});
