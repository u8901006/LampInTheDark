import { describe, expect, it, vi } from 'vitest';

import { POST } from '@/app/api/v1/admin/login/route';

vi.mock('@/lib/admin/runtime', () => ({
  createAdminRuntime: () => ({
    anonClient: {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: { session: { access_token: 'token-123' }, user: { id: 'admin-1', email: 'admin@test.com' } },
          error: null
        }),
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-1', email: 'admin@test.com' } }, error: null })
      }
    },
    adminClient: {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ data: [{ user_id: 'admin-1' }], error: null })
        }))
      }))
    },
    repository: { listAdminQueue: vi.fn(), updateModerationDecision: vi.fn() }
  })
}));

describe('POST /api/v1/admin/login', () => {
  it('accepts form posts and redirects admins to the queue', async () => {
    const formData = new FormData();
    formData.set('email', 'admin@test.com');
    formData.set('password', 'secret');

    const response = await POST(
      new Request('http://localhost/api/v1/admin/login', {
        method: 'POST',
        body: formData
      })
    );

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('/admin/queue');
    expect(response.headers.get('set-cookie')).toContain('litd_admin_session=token-123');
  });

  it('redirects failed form submissions back to the login page with an error', async () => {
    const formData = new FormData();
    formData.set('email', 'admin@test.com');
    formData.set('password', '');

    const response = await POST(
      new Request('http://localhost/api/v1/admin/login', {
        method: 'POST',
        body: formData
      })
    );

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toContain('/admin/login?error=');
  });
});
