alter table posts add column if not exists tracking_code text;

update posts
set tracking_code = concat('track_', substring(gen_random_uuid()::text, 1, 16))
where tracking_code is null;

alter table posts alter column tracking_code set not null;

create unique index if not exists posts_tracking_code_idx on posts (tracking_code);
