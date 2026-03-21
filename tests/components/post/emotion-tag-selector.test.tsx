import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { EMOTION_TAGS, EmotionTagSelector } from '@/components/post/emotion-tag-selector';

describe('emotion tag selector', () => {
  it('renders the expanded emoji-assisted emotion list', () => {
    const markup = renderToStaticMarkup(
      <EmotionTagSelector selectedTags={[]} onToggle={vi.fn()} />
    );

    for (const tag of EMOTION_TAGS) {
      expect(markup).toContain(tag);
    }
  });
});
