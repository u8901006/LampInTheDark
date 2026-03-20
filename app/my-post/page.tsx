import React from 'react';

import { PostLookupForm } from '@/components/post/post-lookup-form';

export default function MyPostPage() {
  return (
    <main className="shell" style={{ padding: '4rem 0 5rem' }}>
      <section className="card" style={{ padding: '2rem' }}>
        <p style={{ color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          LampInTheDark
        </p>
        <h1 style={{ margin: '0.5rem 0 1rem', fontSize: 'clamp(2rem, 6vw, 3.6rem)' }}>查詢我的留言</h1>
        <p style={{ color: 'var(--muted)', lineHeight: 1.7, maxWidth: '40rem' }}>
          輸入投稿後拿到的 tracking code，即可查看自己的留言狀態與內容。
        </p>
        <div style={{ marginTop: '2rem' }}>
          <PostLookupForm />
        </div>
      </section>
    </main>
  );
}
