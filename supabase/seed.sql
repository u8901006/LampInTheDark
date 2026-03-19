insert into posts (
  id,
  content,
  emotion_tags,
  device_fingerprint_hash,
  status,
  moderation_path
) values
  (
    'post_seed_manual_001',
    'I felt overwhelmed this week, but writing this down helped me slow my thoughts.',
    array['anxiety', 'hope'],
    'seed_device_hash_manual',
    'MANUAL_REVIEW',
    'nvidia->openrouter->manual'
  ),
  (
    'post_seed_approved_001',
    'Today I found a small moment of calm while walking home after therapy.',
    array['relief'],
    'seed_device_hash_approved',
    'APPROVED',
    'nvidia'
  )
on conflict (id) do nothing;

insert into moderation_runs (
  post_id,
  provider,
  model,
  attempt_order,
  decision,
  confidence,
  reason_code,
  latency_ms,
  error_code,
  raw_response_redacted
) values
  (
    'post_seed_manual_001',
    'nvidia',
    'seed-nvidia-model',
    1,
    'ERROR',
    null,
    null,
    2500,
    'TIMEOUT',
    '{}'::jsonb
  ),
  (
    'post_seed_manual_001',
    'openrouter',
    'seed-openrouter-model',
    2,
    'UNCERTAIN',
    0.41,
    'ambiguous_content',
    1330,
    null,
    '{"label":"uncertain"}'::jsonb
  ),
  (
    'post_seed_approved_001',
    'nvidia',
    'seed-nvidia-model',
    1,
    'APPROVED',
    0.96,
    'safe',
    320,
    null,
    '{"label":"approved"}'::jsonb
  )
on conflict do nothing;
