import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import HomePage from '@/app/page';
import WritePage from '@/app/write/page';

describe('public anonymous write UI', () => {
  it('shows a Traditional Chinese CTA on the homepage and a write page title', () => {
    const home = renderToStaticMarkup(<HomePage />);
    const write = renderToStaticMarkup(<WritePage />);

    expect(home).toContain('匿名留言');
    expect(home).toContain('/write');
    expect(write).toContain('匿名留言');
    expect(write).toContain('你的內容會先進行審核');
  });
});
