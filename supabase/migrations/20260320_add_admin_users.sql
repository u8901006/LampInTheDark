create table if not exists admin_users (
  user_id uuid primary key,
  created_at timestamptz not null default timezone('utc', now())
);

alter table posts add column if not exists reviewed_at timestamptz;
alter table posts add column if not exists reviewed_by uuid;
alter table posts add column if not exists review_note text;

create index if not exists admin_users_created_at_idx on admin_users (created_at desc);
create index if not exists posts_reviewed_at_idx on posts (reviewed_at desc);
