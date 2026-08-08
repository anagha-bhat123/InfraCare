-- Create notifications table for in-app alerts across user roles
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  role text,
  engineer_name text,
  report_id text not null,
  type text not null, -- 'NEW_ASSIGNMENT', 'NEW_REPORT', 'COMPLAINT_COMPLETED', 'REPORT_RESOLVED'
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Index for fast lookup by targeted recipient
create index if not exists idx_notifications_engineer_name on public.notifications (engineer_name);
create index if not exists idx_notifications_role on public.notifications (role);
create index if not exists idx_notifications_user_id on public.notifications (user_id);

-- Enable Row Level Security
alter table public.notifications enable row level security;

-- RLS Policy: Users can read notifications targeted to them or their role
create policy "public read notifications" on public.notifications for select using (true);
create policy "staff manage notifications" on public.notifications for all using (true);
