create extension if not exists "pgcrypto";

create type public.user_role as enum ('citizen', 'engineer', 'admin');
create type public.report_urgency as enum ('Normal', 'Urgent', 'Critical', 'Low', 'Medium', 'High Priority');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'citizen',
  phone text,
  ward_zone text,
  trust_rating numeric(3,2) default 4.80,
  created_at timestamptz not null default now()
);

create table public.damage_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  title text not null,
  category text,
  urgency text not null default 'Normal',
  description text,
  latitude numeric(10,7) not null,
  longitude numeric(10,7) not null,
  address text,
  status text not null default 'Pending',
  ai_classification text,
  ai_confidence numeric(5,2),
  assigned_department text,
  assigned_officer text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.report_photos (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.damage_reports(id) on delete cascade,
  photo_url text not null,
  latitude numeric(10,7) not null,
  longitude numeric(10,7) not null,
  captured_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.report_status_history (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.damage_reports(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

create table public.maintenance_assignments (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.damage_reports(id) on delete cascade,
  engineer_id uuid references public.profiles(id) on delete set null,
  crew_name text,
  status text not null default 'Dispatched',
  activity_log jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.damage_reports enable row level security;
alter table public.report_photos enable row level security;
alter table public.report_status_history enable row level security;
alter table public.maintenance_assignments enable row level security;

create policy "citizens read own profile" on public.profiles for select using (auth.uid() = id);
create policy "admins read all profiles" on public.profiles for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "citizens create reports" on public.damage_reports for insert with check (auth.uid() = reporter_id);
create policy "citizens read own reports" on public.damage_reports for select using (auth.uid() = reporter_id);
create policy "staff read reports" on public.damage_reports for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('engineer', 'admin')));
create policy "staff update reports" on public.damage_reports for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('engineer', 'admin')));

create policy "photo owner insert" on public.report_photos for insert with check (exists (select 1 from public.damage_reports r where r.id = report_id and r.reporter_id = auth.uid()));
create policy "photo report visibility" on public.report_photos for select using (exists (select 1 from public.damage_reports r where r.id = report_id and (r.reporter_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('engineer','admin')))));

create policy "history report visibility" on public.report_status_history for select using (exists (select 1 from public.damage_reports r where r.id = report_id and (r.reporter_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('engineer','admin')))));
create policy "staff create history" on public.report_status_history for insert with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('engineer','admin')));

create policy "engineers read assignments" on public.maintenance_assignments for select using (engineer_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "admins manage assignments" on public.maintenance_assignments for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
