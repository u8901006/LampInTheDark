'use client';

import React from 'react';

const EMOTION_TAGS = ['悲傷', '焦慮', '憤怒', '壓力', '希望'];

interface EmotionTagSelectorProps {
  selectedTags: string[];
  onToggle: (tag: string) => void;
}

export function EmotionTagSelector({ selectedTags, onToggle }: EmotionTagSelectorProps) {
  return (
    <div className="tag-grid" aria-label="情緒標籤">
      {EMOTION_TAGS.map((tag) => {
        const selected = selectedTags.includes(tag);

        return (
          <button
            key={tag}
            className={selected ? 'tag-chip tag-chip-active' : 'tag-chip'}
            type="button"
            onClick={() => onToggle(tag)}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}

export { EMOTION_TAGS };
