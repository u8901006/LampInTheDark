# Manual Production Smoke Test Checklist

## Write Flow UX

- Open `https://www.leepsyclinic.uk/write`
- Confirm the page shows the updated guidance text
- Confirm the emotion selector shows emoji + Chinese labels
- Confirm the selector includes common states like:
  - `😢 悲傷`
  - `😰 焦慮`
  - `🙂 希望`
  - `🙏 感激`

## Submission Validation

- Try submitting fewer than 10 characters
- Confirm the UI shows `留言內容至少需要 10 個字。`
- Try selecting more than 5 emotion tags
- Confirm the UI blocks the submission with a clear validation message

## Successful Submission

- Submit a valid non-sensitive post
- Confirm the page stays on `/write`
- Confirm the form area is replaced by a completion card
- Confirm the card shows:
  - a status heading
  - a tracking code
  - `回首頁`
  - `查看公開留言`
  - `查詢我的留言`
  - `再寫一則`

## Completion Actions

- Click `回首頁` and confirm `/` loads
- Click `查看公開留言` and confirm `/posts` loads
- Click `查詢我的留言` and confirm `/my-post` loads
- Click `再寫一則` and confirm the write form returns in an empty state

## Public Post APIs

- Confirm `GET /api/v1/posts` returns `200`
- Confirm `GET /api/v1/posts/[trackingCode]` returns `404` for an unknown code
- Confirm `POST /api/v1/posts` returns `201` for a valid request

## Regression Checks

- Confirm `/admin/login` still loads
- Confirm `/admin/queue` remains accessible for admin users
- Confirm homepage links still work on mobile and desktop
