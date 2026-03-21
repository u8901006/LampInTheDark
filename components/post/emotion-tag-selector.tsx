'use client';

import React from 'react';

const EMOTION_TAGS = [
  '😢 悲傷',
  '😞 失落',
  '😔 孤單',
  '😐 麻木',
  '😰 焦慮',
  '😣 壓力',
  '😡 憤怒',
  '😕 困惑',
  '🥺 委屈',
  '🙂 希望',
  '🙏 感激',
  '😌 放鬆'
];

interface EmotionTagSelectorProps {
  selectedTags: string[];
  onToggle: (tag: string) => void;
  disabled?: boolean;
}

export function EmotionTagSelector({ selectedTags, onToggle, disabled = false }: EmotionTagSelectorProps) {
  return (
    <div className="tag-grid" aria-label="情緒標籤">
      {EMOTION_TAGS.map((tag) => {
        const selected = selectedTags.includes(tag);

        return (
          <button
            key={tag}
            className={selected ? 'tag-chip tag-chip-active' : 'tag-chip'}
            type="button"
            disabled={disabled}
            aria-pressed={selected}
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
