# Project Handoff Document

**Last Updated:** 2026-03-22

---

## 最近完成

### ✅ Moderation Provider Migration (2026-03-22)

OpenRouter → Zhipu GLM-5-Turbo (已 commit & push)

**Commit:** `5e4d244`

---

## 進行中

### leepsyclinic.com ↔ leepsyclinic.uk 整合

**Goal:** 建立雙向導流機制，讓 1000+ 篇文章帶來的流量轉化為匿名留言用户

**計畫文件:** `docs/plans/2026-03-22-com-uk-integration.md`

**戰略方向:** A+B 混合 - 內容為基礎 + 社群放大

#### Phase 1: Blogger CTA (P0 - 下一步)

- [ ] 在 Blogger 主題 `</body>` 前加入 CTA script
- [ ] 代碼位置: Blogger 後台 → 主題 → 編輯 HTML
- [ ] 測試任何一篇文章確認 CTA 出現

**Blogger CTA 代碼 (複製貼上):**
```html
<script>
(function() {
  var postBodies = document.querySelectorAll('.post-body, .entry-content, article');
  if (postBodies.length > 0) {
    postBodies.forEach(function(post) {
      var cta = document.createElement('div');
      cta.className = 'leepsyc-cta';
      cta.innerHTML = `
        <div style="margin:2rem 0;padding:1.5rem;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:12px;text-align:center;">
          <p style="color:white;margin:0 0 1rem;font-size:1.1rem;">有話想說，但不知道跟誰說？</p>
          <a href="https://www.leepsyclinic.uk/write?utm_source=leepsyclinic.com&utm_medium=article_cta" style="display:inline-block;padding:0.75rem 1.5rem;background:white;color:#764ba2;border-radius:8px;text-decoration:none;font-weight:600;">匿名留言 →</a>
        </div>`;
      post.appendChild(cta);
    });
  }
})();
</script>
```

#### Phase 2: uk 推薦 API (P1)

- [ ] `lib/recommendations/article-map.ts` - 關鍵字對照表
- [ ] `lib/recommendations/service.ts` - Blogger Feed API 整合
- [ ] `app/api/v1/recommendations/route.ts` - API 端點
- [ ] `components/post/post-success-view.tsx` - 留言成功頁面顯示推薦文章

#### Phase 3: Analytics (P2)

- [ ] GA 事件追蹤 com→uk 點擊
- [ ] 追蹤推薦文章點擊率
- [ ] 驗證轉化率

---

## 暫緩 (NOT in Scope)

| 項目 | 原因 |
|------|------|
| Forensic Psychology EPUB 轉換 | 優先完成 com-uk 整合 |
| 付費功能 | 需要先建立用户基礎 |
| 心理師回覆系統 | 資源有限，先做高槓桿項目 |
| 社群裂變功能 | 先驗證導流效果 |

---

## 架構圖

```
leepsyclinic.com (Blogger)       leepsyclinic.uk (Next.js)
       │                                │
       │  CTA: 文章底部「匿名留言」       │
       └───────────────────────────────▶│
                                        │
       ◀────────────────────────────────┤
       │  推薦: 留言後顯示相關文章        │
       │                                │
       │  Analytics: 追蹤轉化率          │
       └────────────────────────────────┘
```

---

## Quick Commands

```bash
npm test          # Run tests
npm run build     # Build
npm run dev       # Development
```

---

## Next Steps

1. **立即:** 將 CTA 代碼貼到 Blogger 主題
2. **然後:** 開發 uk 推薦 API 和頁面
3. **最後:** 驗證 Analytics 數據
