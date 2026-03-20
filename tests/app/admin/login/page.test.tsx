import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import AdminLoginPage from '@/app/admin/login/page';

describe('admin login page', () => {
  it('renders a login form for administrators', async () => {
    const page = await AdminLoginPage({ searchParams: Promise.resolve({}) });
    const markup = renderToStaticMarkup(page as React.ReactElement);

    expect(markup).toContain('管理員登入');
    expect(markup).toContain('Email');
    expect(markup).toContain('登入後台');
  });

  it('renders an inline error message from search params', async () => {
    const page = await AdminLoginPage({ searchParams: Promise.resolve({ error: '登入失敗' }) });
    const markup = renderToStaticMarkup(page as React.ReactElement);

    expect(markup).toContain('登入失敗');
  });
});
