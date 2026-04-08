import { loadExportSnapshot, type ExportSnapshot } from '@/lib/storage';

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? '是' : '否';
  return String(value);
}

function formatList(title: string, lines: string[]): string {
  return [title, ...lines, ''].join('\n');
}

function formatEmergencyPlan(plan: Record<string, unknown> | null): string {
  if (!plan) return formatList('【緊急計劃】', ['目前無資料']);

  return formatList('【緊急計劃】', [
    `親友姓名：${formatValue(plan.friend_name)}`,
    `親友電話：${formatValue(plan.friend_phone)}`,
    `親友可聯絡時段：${formatValue(plan.friend_available_hours)}`,
    `親友 Email：${formatValue(plan.friend_email)}`,
    `治療師姓名：${formatValue(plan.therapist_name)}`,
    `治療師電話：${formatValue(plan.therapist_phone)}`,
    `治療師可聯絡時段：${formatValue(plan.therapist_available_hours)}`,
    `治療師 Email：${formatValue(plan.therapist_email)}`,
    `代理治療師姓名：${formatValue(plan.substitute_therapist_name)}`,
    `代理治療師電話：${formatValue(plan.substitute_therapist_phone)}`,
    `代理治療師可聯絡時段：${formatValue(plan.substitute_therapist_available_hours)}`,
    `代理治療師 Email：${formatValue(plan.substitute_therapist_email)}`,
    `急診服務名稱：${formatValue(plan.emergency_service_name)}`,
    `急診服務電話：${formatValue(plan.emergency_service_phone)}`,
  ]);
}

function formatTimeline(events: Record<string, unknown>[]): string {
  if (events.length === 0) return formatList('【生命歷程圖】', ['目前無資料']);

  const lines = events.map((event, index) => (
    `${index + 1}. ${formatValue(event.age)}歲 | 分數：${formatValue(event.score)} | 描述：${formatValue(event.description)}`
  ));

  return formatList('【生命歷程圖】', lines);
}

function formatSleepDiaries(entries: Record<string, unknown>[]): string {
  if (entries.length === 0) return formatList('【睡眠日記】', ['目前無資料']);

  const lines = entries.map((entry, index) => (
    `${index + 1}. ${formatValue(entry.entry_date)} | ${formatValue(entry.bedtime)} -> ${formatValue(entry.wakeup_time)} | 品質：${formatValue(entry.sleep_quality)} | 事件：${formatValue(entry.major_events)}`
  ));

  return formatList('【睡眠日記】', lines);
}

function formatDailyDiaries(entries: Record<string, unknown>[]): string {
  if (entries.length === 0) return formatList('【每日日誌】', ['目前無資料']);

  const lines = entries.flatMap((entry, index) => [
    `${index + 1}. 日期：${formatValue(entry.entry_date)}`,
    `   正向事件：${formatValue(entry.positive_events)}`,
    `   不快事件：${formatValue(entry.unpleasant_events)}`,
    `   治療投入：${formatValue(entry.treatment_commitment)}`,
    `   自我慈悲：${formatValue(entry.self_compassion)}`,
    `   痛苦程度：${formatValue(entry.pain)}`,
    `   睡眠品質：${formatValue(entry.sleep)}`,
    `   解離：${formatValue(entry.dissociation)}`,
    `   侵入記憶頻率：${formatValue(entry.trauma_intrusion_frequency)}`,
    `   侵入記憶最高強度：${formatValue(entry.trauma_intrusion_max_intensity)}`,
    `   自殺意念：${formatValue(entry.suicidal_ideation)}`,
    `   技巧使用：${formatValue(entry.skills_used)}`,
    `   體能運動：${formatValue(entry.physical_exercise)}`,
    `   愉快活動：${formatValue(entry.pleasant_activities)}`,
    `   治療練習：${formatValue(entry.therapy_homework_done)}`,
  ]);

  return formatList('【每日日誌】', lines);
}

function formatWeeklyDiaries(entries: Record<string, unknown>[]): string {
  if (entries.length === 0) return formatList('【每週日誌】', ['目前無資料']);

  const lines = entries.flatMap((entry, index) => [
    `${index + 1}. 週期：${formatValue(entry.week_start)} ~ ${formatValue(entry.week_end)}`,
    `   藥物：${formatValue(entry.medications)}`,
    `   本週最令人振奮：${formatValue(entry.weekly_most_positive)}`,
    `   本週最不愉快：${formatValue(entry.weekly_most_negative)}`,
    `   每日記錄筆數：${Array.isArray(entry.daily_entries) ? entry.daily_entries.length : 0}`,
    `   新路徑筆數：${Array.isArray(entry.new_paths) ? entry.new_paths.length : 0}`,
    `   創傷網路筆數：${Array.isArray(entry.trauma_networks) ? entry.trauma_networks.length : 0}`,
    `   問題行為筆數：${Array.isArray(entry.problem_behaviors) ? entry.problem_behaviors.length : 0}`,
  ]);

  return formatList('【每週日誌】', lines);
}

export function buildExportText(snapshot: ExportSnapshot): string {
  return [
    'Lamp in the Dark 全部資料匯出',
    `匯出時間：${new Date().toISOString()}`,
    '',
    formatEmergencyPlan(snapshot.emergencyPlan as Record<string, unknown> | null),
    formatTimeline(snapshot.timelineEvents as Record<string, unknown>[]),
    formatSleepDiaries(snapshot.sleepDiaries as Record<string, unknown>[]),
    formatDailyDiaries(snapshot.dailyDiaries as Record<string, unknown>[]),
    formatWeeklyDiaries(snapshot.weeklyDiaries as Record<string, unknown>[]),
  ].join('\n');
}

export function buildExportJson(snapshot: ExportSnapshot): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      data: snapshot,
    },
    null,
    2,
  );
}

export function downloadTextFile(fileName: string, content: string, mimeType: string): void {
  if (typeof window === 'undefined') return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function exportAllDataAsText(): void {
  const snapshot = loadExportSnapshot();
  downloadTextFile('lampinthedark-export.txt', buildExportText(snapshot), 'text/plain;charset=utf-8');
}

export function exportAllDataAsJson(): void {
  const snapshot = loadExportSnapshot();
  downloadTextFile('lampinthedark-export.json', buildExportJson(snapshot), 'application/json;charset=utf-8');
}
