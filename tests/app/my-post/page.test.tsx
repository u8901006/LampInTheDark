import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import MyPostPage from '@/app/my-post/page';

describe('my post lookup page', () => {
  it('renders the tracking code query UI', () => {
    const markup = renderToStaticMarkup(<MyPostPage />);

    expect(markup).toContain('查詢我的留言');
    expect(markup).toContain('tracking code');
    expect(markup).toContain('查詢留言');
  });
});
