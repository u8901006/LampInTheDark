export function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function remove(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

export const KEYS = {
  weeklyDiaries: 'litd-weekly-diaries',
  dailyDiaries: 'litd-daily-diaries',
  emergencyPlan: 'litd-emergency-plan',
  timelineEvents: 'litd-timeline-events',
  sleepDiaries: 'litd-sleep-diaries',
} as const;

export interface ExportSnapshot {
  weeklyDiaries: unknown[];
  dailyDiaries: unknown[];
  emergencyPlan: unknown | null;
  timelineEvents: unknown[];
  sleepDiaries: unknown[];
}

export function loadExportSnapshot(): ExportSnapshot {
  return {
    weeklyDiaries: load(KEYS.weeklyDiaries, []),
    dailyDiaries: load(KEYS.dailyDiaries, []),
    emergencyPlan: load(KEYS.emergencyPlan, null),
    timelineEvents: load(KEYS.timelineEvents, []),
    sleepDiaries: load(KEYS.sleepDiaries, []),
  };
}
