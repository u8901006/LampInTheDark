# Project Handoff Document

**Last Updated:** 2026-03-22

---

## 最近完成

### ✅ Moderation Provider Migration (2026-03-22)

OpenRouter → Zhipu GLM-5-Turbo

**Commit:** `5e4d244`

### ✅ com-uk 整合 Phase 2 (2026-03-22)

文章推薦系統已完成

**Commit:** `ca18092`

---

## 已完成功能

### uk 端 (已部署)

| 檔案 | 功能 |
|------|------|
| `lib/recommendations/article-map.ts` | 35 個關鍵字 → Blogger 搜尋 URL 對照表 |
| `lib/recommendations/blogger-feed.ts` | Blogger Feed API 搜尋相關文章 |
| `lib/recommendations/service.ts` | 推薦服務 (對照表優先 → API 搜尋 → Fallback) |
| `app/api/v1/recommendations/route.ts` | POST /api/v1/recommendations API |
| `components/post/submission-result.tsx` | 留言成功頁面顯示推薦文章卡片 |

### 推薦邏輯

```
1. 檢查 article-map (35 個關鍵字)
   ↓ 沒匹配
2. 用 Blogger Feed API 搜尋
   ↓ 沒結果
3. Fallback 到首頁
```

---

## 待完成

### Blogger CTA (手動)

**位置:** Blogger 後台 → 主題 → 編輯 HTML → `</body>` 前

```html
<script>
(function() {
  var postBodies = document.querySelectorAll('.post-body, .entry-content, article');
  if (postBodies.length > 0) {
    postBodies.forEach(function(post) {
      if (post.querySelector('.leepsyc-cta')) return;
      var cta = document.createElement('div');
      cta.className = 'leepsyc-cta';
      cta.innerHTML = `
        <div style="margin:2rem 0;padding:1.5rem;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:12px;text-align:center;">
          <p style="color:white;margin:0 0 1rem;font-size:1.1rem;">有話想說，但不知道跟誰說？</p>
          <a href="https://www.leepsyclinic.uk/write?utm_source=leepsyclinic.com&utm_medium=article_cta" 
             style="display:inline-block;padding:0.75rem 1.5rem;background:white;color:#764ba2;border-radius:8px;text-decoration:none;font-weight:600;">
            匿名留言 →
          </a>
        </div>`;
      post.appendChild(cta);
    });
  }
})();
</script>
```

---

## 暫緩 (NOT in Scope)

| 項目 | 原因 |
|------|------|
| Forensic Psychology EPUB 轉換 | 優先完成 com-uk 整合 |
| 付費功能 | 需要先建立用户基礎 |
| 心理師回覆系統 | 資源有限 |
| Analytics 追蹤 | Phase 3 |

---

## 架構圖

```
leepsyclinic.com (Blogger)       leepsyclinic.uk (Next.js)
       │                                │
       │  CTA: 文章底部「匿名留言」  ←───┤ 待手動加入
       └───────────────────────────────▶│
                                        │
       ◀────────────────────────────────┤
       │  推薦: 留言後顯示相關文章        │ ✅ 已完成
       │                                │
```

---

## Quick Commands

```bash
npm test          # Run tests (83 tests)
npm run build     # Build
npm run dev       # Development
```

---

## Git Commits

| Commit | 描述 |
|--------|------|
| `5e4d244` | feat(moderation): replace openrouter fallback with zhipu |
| `7192c89` | docs: add com-uk integration plan and update handoff |
| `ca18092` | feat(recommendations): add com-uk article recommendations |

---

## Next Steps

1. **立即:** 將 CTA 代碼貼到 Blogger 主題
2. **部署:** 在 Vercel 加入 `ZHIPU_API_KEY`
3. **驗證:** 測試完整流程 (com 文章 → uk 留言 → 推薦文章)
