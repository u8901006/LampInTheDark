export type UserRole = 'client' | 'therapist';

export interface ProfileRow {
  id: string;
  role: UserRole;
  display_name: string;
  created_at: string;
}

export interface DiaryCardRow {
  id: string;
  client_id: string;
  week_start: string;
  week_end: string;
  medications: string;
  weekly_most_positive: string;
  weekly_most_negative: string;
  created_at: string;
  updated_at: string;
  daily_entries?: DiaryCardDailyEntryRow[];
  new_paths?: DiaryCardNewPathRow[];
  trauma_networks?: DiaryCardTraumaNetworkRow[];
  problem_behaviors?: DiaryCardProblemBehaviorRow[];
}

export interface DiaryCardDailyEntryRow {
  id: string;
  diary_card_id: string;
  day_of_week: number;
  positive_events: string;
  unpleasant_events: string;
  treatment_commitment: number | null;
  self_compassion: number | null;
  pain: number | null;
  sleep: number | null;
  dissociation: number | null;
  trauma_intrusion_frequency: number | null;
  trauma_intrusion_max_intensity: number | null;
  suicidal_ideation: number | null;
  skills_used: number | null;
  physical_exercise: number | null;
  pleasant_activities: number | null;
  therapy_homework_done: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface DiaryCardNewPathRow {
  id: string;
  diary_card_id: string;
  path_number: number;
  description: string;
  thought_about: boolean | null;
  practiced: number | null;
}

export interface DiaryCardTraumaNetworkRow {
  id: string;
  diary_card_id: string;
  description: string;
  frequency: number | null;
  intensity: number | null;
}

export interface DiaryCardProblemBehaviorRow {
  id: string;
  diary_card_id: string;
  description: string;
  impulsivity: number | null;
  acted: boolean | null;
}

export interface NewPathInput {
  description: string;
  thought_about: boolean | null;
  practiced: number | null;
}

export interface TraumaNetworkInput {
  description: string;
  frequency: number | null;
  intensity: number | null;
}

export interface ProblemBehaviorInput {
  description: string;
  impulsivity: number | null;
  acted: boolean | null;
}

export interface DailyDiaryEntryRow {
  id: string;
  client_id: string;
  entry_date: string;
  positive_events: string;
  unpleasant_events: string;
  treatment_commitment: number | null;
  self_compassion: number | null;
  pain: number | null;
  sleep: number | null;
  dissociation: number | null;
  trauma_intrusion_frequency: number | null;
  trauma_intrusion_max_intensity: number | null;
  suicidal_ideation: number | null;
  skills_used: number | null;
  physical_exercise: number | null;
  pleasant_activities: number | null;
  therapy_homework_done: boolean | null;
  new_paths: NewPathInput[];
  trauma_networks: TraumaNetworkInput[];
  problem_behaviors: ProblemBehaviorInput[];
  created_at: string;
  updated_at: string;
}

export type SleepQuality = 'awake' | 'dozing' | 'asleep' | 'nightmare';

export interface EmergencyPlanRow {
  id: string;
  client_id: string;
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
  created_at: string;
  updated_at: string;
}

export interface LifeTimelineRow {
  id: string;
  client_id: string;
  created_at: string;
  updated_at: string;
  events?: LifeTimelineEventRow[];
}

export interface LifeTimelineEventRow {
  id: string;
  timeline_id: string;
  age: number;
  score: number;
  description: string;
  created_at: string;
}

export interface SleepDiaryRow {
  id: string;
  client_id: string;
  entry_date: string;
  bedtime: string | null;
  wakeup_time: string | null;
  sleep_quality: SleepQuality | null;
  major_night_events: string;
  created_at: string;
  updated_at: string;
}
