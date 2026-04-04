'use client';

interface ScaleInputProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
}

export function ScaleInput({ label, value, onChange, min = 0, max = 5, minLabel, maxLabel }: ScaleInputProps) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <p className="field-label" style={{ fontSize: '0.9rem', marginBottom: '0.35rem' }}>{label}</p>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {minLabel && <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{minLabel}</span>}
        {Array.from({ length: max - min + 1 }, (_, i) => i + min).map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n === value ? null : n)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: `2px solid ${n === value ? 'var(--accent)' : 'var(--line)'}`,
              background: n === value ? 'var(--accent)' : 'transparent',
              color: n === value ? '#fff' : 'var(--text)',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            {n}
          </button>
        ))}
        {maxLabel && <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{maxLabel}</span>}
      </div>
    </div>
  );
}
