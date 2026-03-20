import React from 'react';

export function QueueFilters() {
  return (
    <form className="write-form" method="get" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
      <input className="text-area" style={{ minHeight: 'auto' }} name="query" placeholder="搜尋留言或 ID" />
      <select className="text-area" style={{ minHeight: 'auto' }} name="status" defaultValue="">
        <option value="">全部狀態</option>
        <option value="MANUAL_REVIEW">待審核</option>
        <option value="APPROVED">已核准</option>
        <option value="REJECTED">已拒絕</option>
      </select>
      <select className="text-area" style={{ minHeight: 'auto' }} name="provider" defaultValue="">
        <option value="">全部 provider</option>
        <option value="nvidia">NVIDIA</option>
        <option value="openrouter">OpenRouter</option>
      </select>
      <select className="text-area" style={{ minHeight: 'auto' }} name="decision" defaultValue="">
        <option value="">全部決策</option>
        <option value="APPROVED">核准</option>
        <option value="REJECTED">拒絕</option>
        <option value="ERROR">錯誤</option>
        <option value="UNCERTAIN">不確定</option>
      </select>
      <button className="primary-link submit-button" type="submit">搜尋 / 篩選</button>
    </form>
  );
}
