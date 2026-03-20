'use client';

import React from 'react';

export function ModerationActions({ postId }: { postId: string }) {
  async function send(status: 'APPROVED' | 'REJECTED') {
    await fetch(`/api/v1/admin/posts/${postId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status })
    });
    window.location.reload();
  }

  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
      <button className="primary-link" type="button" onClick={() => void send('APPROVED')}>核准</button>
      <button className="tag-chip" type="button" onClick={() => void send('REJECTED')}>拒絕</button>
    </div>
  );
}
