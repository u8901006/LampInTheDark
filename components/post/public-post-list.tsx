import React from 'react';

export interface PublicPostListItem {
  id: string;
  content: string;
  emotionTags: string[];
  createdAt: string | null;
}

export function PublicPostList({ posts }: { posts: PublicPostListItem[] }) {
  if (posts.length === 0) {
    return <p className="soft-note">目前還沒有公開留言。</p>;
  }

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {posts.map((post) => (
        <article className="card" key={post.id} style={{ padding: '1.5rem' }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>{post.content}</p>
          <p className="soft-note" style={{ marginTop: '0.75rem' }}>
            {post.emotionTags.join(' / ')}
          </p>
        </article>
      ))}
    </div>
  );
}
