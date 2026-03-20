import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/headers', () => ({
  cookies: async () => ({ toString: () => 'litd_admin_session=token' })
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn()
}));

vi.mock('@/lib/admin/runtime', () => ({
  createAdminRuntime: () => ({
    anonClient: { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-1', email: 'a@test.com' } }, error: null }) } },
    adminClient: { from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ data: [{ user_id: 'admin-1' }], error: null }) })) })) },
    repository: {
      listAdminQueue: vi.fn().mockResolvedValue([
        {
          id: 'post-1',
          content: '需要人工審核的留言摘要',
          status: 'MANUAL_REVIEW',
          moderationPath: 'nvidia->manual',
          moderationRuns: [
            { provider: 'nvidia', attemptOrder: 1, decision: 'ERROR', confidence: null, reasonCode: null, latencyMs: 80, errorCode: 'TIMEOUT', rawResponseRedacted: {} }
          ]
        }
      ])
    }
  })
}));

import AdminQueuePage from '@/app/admin/queue/page';

describe('admin queue page', () => {
  it('renders metrics cards, filters, and moderation actions', async () => {
    const page = await AdminQueuePage({ searchParams: Promise.resolve({}) });
    const markup = renderToStaticMarkup(page as React.ReactElement);

    expect(markup).toContain('NVIDIA');
    expect(markup).toContain('搜尋 / 篩選');
    expect(markup).toContain('全部決策');
    expect(markup).toContain('核准');
    expect(markup).toContain('拒絕');
  });
});
