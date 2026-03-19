export interface PostRow {
  id: string;
  content: string;
  emotion_tags: string[];
  device_fingerprint_hash: string;
  status: 'APPROVED' | 'REJECTED' | 'CRISIS' | 'MANUAL_REVIEW';
  moderation_path: string;
  created_at: string;
  updated_at: string;
  moderation_runs?: ModerationRunRow[];
}

export interface ModerationRunRow {
  id: string;
  post_id: string;
  provider: 'nvidia' | 'openrouter';
  model: string | null;
  attempt_order: number;
  decision: 'APPROVED' | 'REJECTED' | 'CRISIS' | 'UNCERTAIN' | 'ERROR';
  confidence: number | null;
  reason_code: string | null;
  latency_ms: number;
  error_code: string | null;
  raw_response_redacted: Record<string, unknown>;
  trace_id: string | null;
  created_at: string;
}
