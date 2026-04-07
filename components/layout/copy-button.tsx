'use client';

import { useState } from 'react';

export function CopyButton({ text, label = '複製' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        padding: '0.35rem 0.7rem',
        border: '1px solid var(--line)',
        borderRadius: '999px',
        background: copied ? 'var(--accent-soft)' : 'transparent',
        color: copied ? 'var(--accent)' : 'var(--muted)',
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontWeight: 600,
      }}
    >
      {copied ? '已複製' : label}
    </button>
  );
}
