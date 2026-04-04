-- Enable Row Level Security on all tables
alter table posts enable row level security;
alter table moderation_runs enable row level security;
alter table admin_users enable row level security;

-- Posts: Allow anonymous insert (for user submissions)
create policy "Allow anonymous post creation"
  on posts for insert
  to anon, authenticated
  with check (true);

-- Posts: Allow reading own posts via tracking_code
create policy "Users can view their own posts"
  on posts for select
  to anon, authenticated
  using (tracking_code = current_setting('request.jwt.claims', true)::json->>'tracking_code');

-- Posts: Admin full access
create policy "Admins have full access to posts"
  on posts for all
  to authenticated
  using (
    exists (
      select 1 from admin_users
      where user_id = auth.uid()
    )
  );

-- Moderation runs: Admin only
create policy "Admins only for moderation_runs"
  on moderation_runs for all
  to authenticated
  using (
    exists (
      select 1 from admin_users
      where user_id = auth.uid()
    )
  );

-- Admin users: Admin only
create policy "Admins only for admin_users"
  on admin_users for all
  to authenticated
  using (
    exists (
      select 1 from admin_users
      where user_id = auth.uid()
    )
  );

-- Block anonymous access to moderation_runs and admin_users
create policy "Block anonymous access to moderation_runs"
  on moderation_runs for all
  to anon
  using (false);

create policy "Block anonymous access to admin_users"
  on admin_users for all
  to anon
  using (false);
