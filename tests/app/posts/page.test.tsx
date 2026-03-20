import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api/posts', () => ({
  getPublicPosts: vi.fn().mockResolvedValue([
    {
      id: 'post_public_1',
      content: 'Approved post',
      emotionTags: ['hope'],
      createdAt: '2026-03-20T10:00:00.000Z'
    }
  ])
}));

import PostsPage from '@/app/posts/page';

describe('public posts page', () => {
  it('renders the approved public feed', async () => {
    const page = await PostsPage();
    const markup = renderToStaticMarkup(page as React.ReactElement);

    expect(markup).toContain('公開留言');
    expect(markup).toContain('Approved post');
  });
});
