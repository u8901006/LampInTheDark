'use client';

import { useState, useEffect } from 'react';
import { load, save, KEYS } from '@/lib/storage';
import { CopyButton } from '@/components/layout/copy-button';

interface EmergencyPlan {
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
    fields: [
      { key: 'friend_name', label: '姓名' },
      { key: 'friend_phone', label: '電話' },
      { key: 'friend_available_hours', label: '可聯絡時段' },
      { key: 'friend_email', label: 'Email' },
    ],
  },
  {
    title: '治療師',
    fields: [
      { key: 'therapist_name', label: '姓名' },
      { key: 'therapist_phone', label: '電話' },
      { key: 'therapist_available_hours', label: '可聯絡時段' },
      { key: 'therapist_email', label: 'Email' },
    ],
  },
  {
    title: '代理治療師',
    fields: [
      { key: 'substitute_therapist_name', label: '姓名' },
      { key: 'substitute_therapist_phone', label: '電話' },
      { key: 'substitute_therapist_available_hours', label: '可聯絡時段' },
      { key: 'substitute_therapist_email', label: 'Email' },
    ],
  },
  {
    title: '精神科急診服務',
    fields: [
      { key: 'emergency_service_name', label: '名稱' },
      { key: 'emergency_service_phone', label: '電話' },
    ],
  },
];

function formatPlanForCopy(plan: EmergencyPlan): string {
  const lines: string[] = [];
  lines.push('【緊急計劃】');
  lines.push('');
  lines.push('一般民眾（親友）');
  lines.push(`  姓名：${plan.friend_name || '—'}`);
  lines.push(`  電話：${plan.friend_phone || '—'}`);
  lines.push(`  可聯絡時段：${plan.friend_available_hours || '—'}`);
  lines.push(`  Email：${plan.friend_email || '—'}`);
  lines.push('');
  lines.push('治療師');
  lines.push(`  姓名：${plan.therapist_name || '—'}`);
  lines.push(`  電話：${plan.therapist_phone || '—'}`);
  lines.push(`  可聯絡時段：${plan.therapist_available_hours || '—'}`);
  lines.push(`  Email：${plan.therapist_email || '—'}`);
  lines.push('');
  lines.push('代理治療師');
  lines.push(`  姓名：${plan.substitute_therapist_name || '—'}`);
  lines.push(`  電話：${plan.substitute_therapist_phone || '—'}`);
  lines.push(`  可聯絡時段：${plan.substitute_therapist_available_hours || '—'}`);
  lines.push(`  Email：${plan.substitute_therapist_email || '—'}`);
  lines.push('');
  lines.push('精神科急診服務');
  lines.push(`  名稱：${plan.emergency_service_name || '—'}`);
  lines.push(`  電話：${plan.emergency_service_phone || '—'}`);
  return lines.join('\n');
}

export default function EmergencyPlanPage() {
  const [plan, setPlan] = useState<EmergencyPlan>(emptyPlan);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = load<EmergencyPlan | null>(KEYS.emergencyPlan, null);
    if (stored) setPlan(stored);
  }, []);

  function updateField(key: string, value: string) {
    setPlan(prev => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    setMessage('');
    save(KEYS.emergencyPlan, plan);
    setMessage('已儲存');
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>緊急計劃</h1>
        <CopyButton text={formatPlanForCopy(plan)} />
      </div>
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
        >
          儲存緊急計劃
        </button>
        {message && (
          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
