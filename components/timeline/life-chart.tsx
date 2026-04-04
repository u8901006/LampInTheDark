'use client';

import { useState, useEffect } from 'react';

interface TimelineEvent {
  id: string;
  age: number;
  score: number;
  description: string;
}

interface LifeChartProps {
  events: TimelineEvent[];
}

const CHART_PADDING = { top: 30, right: 30, bottom: 50, left: 60 };
const MIN_AGE = 0;
const MAX_AGE = 100;
const MIN_SCORE = -100;
const MAX_SCORE = 100;

export function LifeChart({ events }: LifeChartProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

  useEffect(() => {
    function updateSize() {
      const container = document.getElementById('chart-container');
      if (container) {
        setDimensions({ width: container.clientWidth, height: 400 });
      }
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const { width, height } = dimensions;
  const chartW = width - CHART_PADDING.left - CHART_PADDING.right;
  const chartH = height - CHART_PADDING.top - CHART_PADDING.bottom;

  const scaleX = (age: number) => CHART_PADDING.left + ((age - MIN_AGE) / (MAX_AGE - MIN_AGE)) * chartW;
  const scaleY = (score: number) => CHART_PADDING.top + ((MAX_SCORE - score) / (MAX_SCORE - MIN_SCORE)) * chartH;

  const ageTicks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const scoreTicks = [-100, -50, 0, 50, 100];

  const sortedEvents = [...events].sort((a, b) => a.age - b.age);

  let pathD = '';
  if (sortedEvents.length > 1) {
    pathD = sortedEvents.map((e, i) => `${i === 0 ? 'M' : 'L'}${scaleX(e.age)},${scaleY(e.score)}`).join(' ');
  }

  return (
    <div id="chart-container" style={{ width: '100%' }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: 'block', background: 'var(--surface)', borderRadius: '18px', border: '1px solid var(--line)' }}
      >
        {ageTicks.map(age => (
          <g key={`age-${age}`}>
            <line
              x1={scaleX(age)} y1={CHART_PADDING.top}
              x2={scaleX(age)} y2={CHART_PADDING.top + chartH}
              stroke="var(--line)" strokeOpacity={0.4} strokeDasharray="4,4"
            />
            <text
              x={scaleX(age)} y={height - 10}
              textAnchor="middle" fill="var(--muted)" fontSize={11}
            >
              {age}
            </text>
          </g>
        ))}

        {scoreTicks.map(score => (
          <g key={`score-${score}`}>
            <line
              x1={CHART_PADDING.left} y1={scaleY(score)}
              x2={CHART_PADDING.left + chartW} y2={scaleY(score)}
              stroke={score === 0 ? 'var(--text)' : 'var(--line)'}
              strokeOpacity={score === 0 ? 0.6 : 0.4}
              strokeWidth={score === 0 ? 1.5 : 1}
              strokeDasharray={score === 0 ? undefined : '4,4'}
            />
            <text
              x={CHART_PADDING.left - 10} y={scaleY(score) + 4}
              textAnchor="end" fill="var(--muted)" fontSize={11}
            >
              {score}
            </text>
          </g>
        ))}

        <text
          x={CHART_PADDING.left + chartW / 2} y={height - 2}
          textAnchor="middle" fill="var(--text)" fontSize={12} fontWeight={600}
        >
          年齡
        </text>
        <text
          x={14} y={CHART_PADDING.top + chartH / 2}
          textAnchor="middle" fill="var(--text)" fontSize={12} fontWeight={600}
          transform={`rotate(-90, 14, ${CHART_PADDING.top + chartH / 2})`}
        >
          分數
        </text>

        {sortedEvents.length > 1 && (
          <path
            d={pathD}
            fill="none" stroke="var(--accent)" strokeWidth={2} strokeOpacity={0.5}
          />
        )}

        {sortedEvents.map(event => (
          <g
            key={event.id}
            onMouseEnter={() => setHoveredId(event.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{ cursor: 'pointer' }}
          >
            <circle
              cx={scaleX(event.age)}
              cy={scaleY(event.score)}
              r={hoveredId === event.id ? 8 : 6}
              fill={event.score >= 0 ? 'var(--accent)' : '#9f3d1c'}
              stroke="var(--surface)" strokeWidth={2}
            />
            {hoveredId === event.id && (
              <g>
                <rect
                  x={scaleX(event.age) - 80}
                  y={scaleY(event.score) - 50}
                  width={160}
                  height={42}
                  rx={8}
                  fill="var(--surface)"
                  stroke="var(--line)"
                />
                <text
                  x={scaleX(event.age)}
                  y={scaleY(event.score) - 35}
                  textAnchor="middle"
                  fill="var(--text)"
                  fontSize={11}
                  fontWeight={600}
                >
                  年齡 {event.age} · 分數 {event.score}
                </text>
                <text
                  x={scaleX(event.age)}
                  y={scaleY(event.score) - 18}
                  textAnchor="middle"
                  fill="var(--muted)"
                  fontSize={10}
                >
                  {event.description.length > 18
                    ? event.description.slice(0, 18) + '…'
                    : event.description}
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
