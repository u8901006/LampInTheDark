import { describe, expect, it, vi } from 'vitest';

import { createAdminSessionCookie, readAdminSessionToken, verifyAdminSession } from '@/lib/admin/auth';

describe('admin auth helpers', () => {
  it('reads the admin session token from cookies', () => {
    const cookie = createAdminSessionCookie('token-123');
    expect(readAdminSessionToken(cookie)).toBe('token-123');
  });

  it('returns null when the user is not an admin', async () => {
    const identity = await verifyAdminSession('token', {
      anonClient: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1', email: 'a@test.com' } }, error: null })
        }
      },
      adminClient: {
        from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ data: [], error: null }) })) }))
      }
    } as never);

    expect(identity).toBeNull();
  });

  it('returns the admin identity when the user is authorized', async () => {
    const identity = await verifyAdminSession('token', {
      anonClient: {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-1', email: 'admin@test.com' } }, error: null })
        }
      },
      adminClient: {
        from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ data: [{ user_id: 'admin-1' }], error: null }) })) }))
      }
    } as never);

    expect(identity).toEqual({ userId: 'admin-1', email: 'admin@test.com' });
  });
});
