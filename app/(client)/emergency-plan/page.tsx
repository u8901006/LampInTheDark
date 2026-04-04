'use client';

import { useState, useEffect } from 'react';

interface EmergencyPlan {
  id?: string;
  friend_name: string;
  friend_phone: string;
  friend_available_hours: string;
  friend_email: string;
  therapist_name: string;
  therapist_phone: string;
  therapist_available_hours: string;
  therapist_email: string;
  substitute_therapist_name: string;
  substitute_therapist_phone: string;
  substitute_therapist_available_hours: string;
  substitute_therapist_email: string;
  emergency_service_name: string;
  emergency_service_phone: string;
}

const emptyPlan: EmergencyPlan = {
  friend_name: '',
  friend_phone: '',
  friend_available_hours: '',
  friend_email: '',
  therapist_name: '',
  therapist_phone: '',
  therapist_available_hours: '',
  therapist_email: '',
  substitute_therapist_name: '',
  substitute_therapist_phone: '',
  substitute_therapist_available_hours: '',
  substitute_therapist_email: '',
  emergency_service_name: '',
  emergency_service_phone: '',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.65rem 0.9rem',
  border: '1px solid var(--line)',
  borderRadius: '12px',
  background: '#fffdf9',
  color: 'var(--text)',
  fontSize: '0.95rem',
};

const sections = [
  {
    title: '一般民眾（親友）',
    prefix: 'friend' as const,
    fields: [
      { key: 'friend_name', label: '姓名' },
      { key: 'friend_phone', label: '電話' },
      { key: 'friend_available_hours', label: '可聯絡時段' },
      { key: 'friend_email', label: 'Email' },
    ],
  },
  {
    title: '治療師',
    prefix: 'therapist' as const,
    fields: [
      { key: 'therapist_name', label: '姓名' },
      { key: 'therapist_phone', label: '電話' },
      { key: 'therapist_available_hours', label: '可聯絡時段' },
      { key: 'therapist_email', label: 'Email' },
    ],
  },
  {
    title: '代理治療師',
    prefix: 'substitute_therapist' as const,
    fields: [
      { key: 'substitute_therapist_name', label: '姓名' },
      { key: 'substitute_therapist_phone', label: '電話' },
      { key: 'substitute_therapist_available_hours', label: '可聯絡時段' },
      { key: 'substitute_therapist_email', label: 'Email' },
    ],
  },
  {
    title: '精神科急診服務',
    prefix: 'emergency_service' as const,
    fields: [
      { key: 'emergency_service_name', label: '名稱' },
      { key: 'emergency_service_phone', label: '電話' },
    ],
  },
];

export default function EmergencyPlanPage() {
  const [plan, setPlan] = useState<EmergencyPlan>(emptyPlan);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/emergency-plan')
      .then(r => r.json())
      .then(res => {
        if (res.data) setPlan({ ...emptyPlan, ...res.data });
      });
  }, []);

  function updateField(key: string, value: string) {
    setPlan(prev => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');
    const res = await fetch('/api/emergency-plan', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan),
    });
    setSaving(false);
    if (res.ok) {
      setMessage('已儲存');
      const { data } = await res.json();
      if (data) setPlan({ ...emptyPlan, ...data });
    } else {
      setMessage('儲存失敗，請稍後再試');
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>緊急計劃</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
        填寫你的緊急聯絡資訊，在需要時能快速找到幫助
      </p>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {sections.map(section => (
          <div key={section.title} className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', margin: '0 0 1rem', color: 'var(--accent)' }}>
              {section.title}
            </h2>
            <div style={{ display: 'grid', gap: '0.9rem' }}>
              {section.fields.map(field => (
                <div key={field.key}>
                  <p className="field-label">{field.label}</p>
                  <input
                    type="text"
                    style={inputStyle}
                    value={plan[field.key as keyof EmergencyPlan] || ''}
                    onChange={e => updateField(field.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          className="primary-link submit-button"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? '儲存中…' : '儲存緊急計劃'}
        </button>
        {message && (
          <span style={{ color: message === '已儲存' ? 'var(--accent)' : '#9f3d1c', fontWeight: 600 }}>
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
