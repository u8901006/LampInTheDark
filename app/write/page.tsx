import React from 'react';
import Link from 'next/link';
import { AnonymousPostForm } from '@/components/post/anonymous-post-form';

export default function WritePage() {
  return (
    <main className="shell" style={{ padding: '4rem 0 5rem' }}>
      <section className="card" style={{ padding: '2rem' }}>
        <p style={{ color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          LampInTheDark
        </p>
        <h1 style={{ margin: '0.5rem 0 1rem', fontSize: 'clamp(2rem, 6vw, 3.6rem)' }}>匿名留言</h1>
        <p style={{ color: 'var(--muted)', lineHeight: 1.7, maxWidth: '40rem' }}>
          你的內容會先進行審核，再決定是否公開顯示。若系統無法確認，會交由人工審核。
        </p>
        <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginTop: '1rem' }}>
          送出後請保留查詢碼，之後可到 <Link href="/my-post">/my-post</Link> 查詢自己的留言。
        </p>
        <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginTop: '1rem' }}>
          送出後會顯示完成卡片，你也可以回首頁或查看公開留言。
        </p>
        <div style={{ marginTop: '2rem' }}>
          <AnonymousPostForm />
        </div>
      </section>
    </main>
  );
}
