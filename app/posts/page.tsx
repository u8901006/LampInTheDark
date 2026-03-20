import React from 'react';

import { PublicPostList } from '@/components/post/public-post-list';
import { getPublicPosts } from '@/lib/api/posts';

export const dynamic = 'force-dynamic';

export default async function PostsPage() {
  const posts = await getPublicPosts();

  return (
    <main className="shell" style={{ padding: '4rem 0 5rem' }}>
      <section style={{ display: 'grid', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <p style={{ color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            LampInTheDark
          </p>
          <h1 style={{ margin: '0.5rem 0 1rem', fontSize: 'clamp(2rem, 6vw, 3.6rem)' }}>公開留言</h1>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7, maxWidth: '40rem' }}>
            這裡只會顯示已通過審核、可以安全公開的匿名留言。
          </p>
        </div>

        <PublicPostList posts={posts} />
      </section>
    </main>
  );
}
