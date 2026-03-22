# leepsyclinic.com ↔ leepsyclinic.uk 整合計畫

**Goal:** 建立雙向導流機制，將 com 的 1000+ 篇文章流量轉化為 uk 的匿名留言用户

**Approach:** A+B 混合 - 先用 Blogger Feed API 快速上線，逐步建立關鍵字對照表

---

## Phase 1: Blogger CTA (com → uk)

### Task 1.1: Blogger 主題修改

**檔案:** Blogger 後台 → 主題 → 編輯 HTML

**位置:** 在 `</body>` 之前加入

```html
<script>
(function() {
  // 在每篇文章底部插入 CTA
  var postBodies = document.querySelectorAll('.post-body, .entry-content, article');
  if (postBodies.length > 0) {
    postBodies.forEach(function(post) {
      var cta = document.createElement('div');
      cta.className = 'leepsyc-cta';
      cta.innerHTML = `
        <div style="
          margin: 2rem 0;
          padding: 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          text-align: center;
        ">
          <p style="color: white; margin: 0 0 1rem; font-size: 1.1rem;">
            有話想說，但不知道跟誰說？
          </p>
          <a href="https://www.leepsyclinic.uk/write" 
             style="
               display: inline-block;
               padding: 0.75rem 1.5rem;
               background: white;
               color: #764ba2;
               border-radius: 8px;
               text-decoration: none;
               font-weight: 600;
             ">
            匿名留言 →
          </a>
        </div>
      `;
      post.appendChild(cta);
    });
  }
})();
</script>
```

### Task 1.2: 追蹤碼

在 CTA 連結加入 UTM 參數：

```html
<a href="https://www.leepsyclinic.uk/write?utm_source=leepsyclinic.com&utm_medium=article_cta&utm_content=post_title">
  匿名留言 →
</a>
```

---

## Phase 2: 文章推薦 (uk → com)

### Task 2.1: Blogger Feed API 整合

**檔案:** `lib/recommendations/blogger-feed.ts`

```typescript
interface BloggerPost {
  id: { $t: string };
  title: { $t: string };
  link: Array<{ rel: string; href: string }>;
  content: { $t: string };
}

interface BloggerFeedResponse {
  feed: {
    entry: BloggerPost[];
  };
}

const BLOGGER_FEED_URL = 'https://www.leepsyclinic.com/feeds/posts/default';

export async function searchRelatedArticles(
  keywords: string[],
  options?: { maxResults?: number }
): Promise<{ title: string; url: string }[]> {
  const maxResults = options?.maxResults ?? 5;
  const query = keywords.slice(0, 3).join(' ');
  
  const url = `${BLOGGER_FEED_URL}?alt=json&q=${encodeURIComponent(query)}&max-results=${maxResults}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Blogger feed error:', response.status);
      return [];
    }
    
    const data: BloggerFeedResponse = await response.json();
    
    return (data.feed.entry ?? []).map((entry) => ({
      title: entry.title.$t,
      url: entry.link.find((l) => l.rel === 'alternate')?.href ?? '',
    })).filter((item) => item.url);
  } catch (error) {
    console.error('Failed to fetch Blogger feed:', error);
    return [];
  }
}
```

### Task 2.2: 關鍵字對照表 (Phase B)

**檔案:** `lib/recommendations/article-map.ts`

```typescript
// 逐步建立的關鍵字對照表
// 優先於 Blogger Feed API 使用

export const articleMap: Record<string, string> = {
  // 情緒相關
  '憂鬱': 'https://www.leepsyclinic.com/search/label/憂鬱症',
  '焦慮': 'https://www.leepsyclinic.com/search/label/焦慮症',
  '恐慌': 'https://www.leepsyclinic.com/search/label/恐慌症',
  
  // 人際關係
  '感情': 'https://www.leepsyclinic.com/search/label/感情',
  '家庭': 'https://www.leepsyclinic.com/search/label/家庭',
  '職場': 'https://www.leepsyclinic.com/search/label/職場',
  
  // 危機相關
  '自殺': 'https://www.leepsyclinic.com/search/label/自殺防治',
  '自傷': 'https://www.leepsyclinic.com/search/label/自傷',
  
  // 生活議題
  '失眠': 'https://www.leepsyclinic.com/search/label/失眠',
  '壓力': 'https://www.leepsyclinic.com/search/label/壓力',
};

export const fallbackArticle = 'https://www.leepsyclinic.com/';
```

### Task 2.3: 推薦服務

**檔案:** `lib/recommendations/service.ts`

```typescript
import { searchRelatedArticles } from './blogger-feed';
import { articleMap, fallbackArticle } from './article-map';

export async function getRecommendedArticle(content: string): Promise<{
  title: string;
  url: string;
  source: 'map' | 'search' | 'fallback';
}> {
  // Step 1: 檢查對照表
  for (const [keyword, url] of Object.entries(articleMap)) {
    if (content.includes(keyword)) {
      return {
        title: `更多關於「${keyword}」的文章`,
        url,
        source: 'map',
      };
    }
  }
  
  // Step 2: 用 Blogger Feed API 搜尋
  const keywords = extractKeywords(content);
  if (keywords.length > 0) {
    const results = await searchRelatedArticles(keywords, { maxResults: 1 });
    if (results.length > 0) {
      return {
        title: results[0].title,
        url: results[0].url,
        source: 'search',
      };
    }
  }
  
  // Step 3: Fallback
  return {
    title: '探索更多心理健康資訊',
    url: fallbackArticle,
    source: 'fallback',
  };
}

function extractKeywords(content: string): string[] {
  // 簡單的關鍵字提取
  // TODO: 可以改用 AI 或更複雜的 NLP
  const stopWords = ['的', '是', '我', '有', '在', '了', '不', '都', '很', '也'];
  const words = content
    .replace(/[^\u4e00-\u9fa5a-zA-Z]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !stopWords.includes(w));
  
  // 取最常出現的詞
  const counts = new Map<string, number>();
  words.forEach((w) => counts.set(w, (counts.get(w) ?? 0) + 1));
  
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}
```

### Task 2.4: 成功頁面整合

**檔案:** `components/post/post-success-view.tsx` (新增)

```tsx
'use client';

import React, { useEffect, useState } from 'react';

interface RecommendedArticle {
  title: string;
  url: string;
}

interface PostSuccessViewProps {
  trackingCode: string;
  content: string;
}

export function PostSuccessView({ trackingCode, content }: PostSuccessViewProps) {
  const [article, setArticle] = useState<RecommendedArticle | null>(null);
  
  useEffect(() => {
    fetch('/api/v1/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
      .then((res) => res.json())
      .then((data) => setArticle(data))
      .catch(() => setArticle(null));
  }, [content]);
  
  return (
    <div className="post-success">
      <h2>感謝你的留言</h2>
      <p>追蹤碼：<code>{trackingCode}</code></p>
      
      {article && (
        <div className="recommendation-card">
          <p>這篇文章可能對你有幫助：</p>
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            {article.title}
          </a>
        </div>
      )}
    </div>
  );
}
```

### Task 2.5: API 端點

**檔案:** `app/api/v1/recommendations/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getRecommendedArticle } from '@/lib/recommendations/service';

export async function POST(request: NextRequest) {
  const { content } = await request.json();
  
  if (!content || typeof content !== 'string') {
    return NextResponse.json({ error: 'Invalid content' }, { status: 400 });
  }
  
  const article = await getRecommendedArticle(content);
  
  return NextResponse.json(article);
}
```

---

## Phase 3: Analytics

### Task 3.1: 事件追蹤

**com 端 (Google Analytics):**
```javascript
gtag('event', 'click', {
  event_category: 'CTA',
  event_label: 'leepsyclinic.uk/write',
  transport_type: 'beacon',
});
```

**uk 端 (追蹤推薦點擊):**
```typescript
// 在推薦連結加入 onClick
onClick={() => {
  fetch('/api/v1/analytics', {
    method: 'POST',
    body: JSON.stringify({
      event: 'recommendation_click',
      source: article.source,
    }),
  });
}}
```

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| Blogger Feed API timeout | 顯示 fallback 文章連結 |
| CORS blocked | 使用 Server-side API proxy |
| No matching articles | 顯示首頁連結 |
| Content too short for keywords | 跳過推薦 |

---

## Rollout Plan

| Week | Milestone |
|------|-----------|
| 1 | Blogger CTA 上線 |
| 2 | uk 推薦 API 上線 |
| 3 | Analytics 驗證 |
| 4 | 建立第一批關鍵字對照表 (20 個) |

---

## Success Metrics

| Metric | Target (1 month) |
|--------|------------------|
| com → uk CTR | 3%+ |
| uk 推薦點擊率 | 10%+ |
| 新增投稿來源 (utm) | 20%+ |
