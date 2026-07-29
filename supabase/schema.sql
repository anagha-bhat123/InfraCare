create extension if not exists "pgcrypto";

create type public.user_role as enum ('citizen', 'engineer', 'admin');
create type public.report_urgency as enum ('Normal', 'Urgent', 'Critical', 'Low', 'Medium', 'High Priority');

create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  role public.user_role not null default 'citizen',
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references public.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'citizen',
  phone text,
  ward_zone text,
  zone text,
  trust_rating numeric(3,2) default 4.80,
  emp_id text unique,
  must_change_password boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz default now()
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

-- Admin Modules Extension Tables

create table public.maintenance_crews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  department text not null,
  efficiency_rating numeric(5,2) default 100.0,
  active_members integer default 0,
  is_active boolean default true,
  created_at timestamptz not null default now()
);

create table public.system_activity_logs (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  description text not null,
  severity text default 'info',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.system_health_metrics (
  id uuid primary key default gen_random_uuid(),
  uptime_percentage numeric(5,2) not null,
  latency_ms integer not null,
  recorded_at timestamptz not null default now()
);

-- Engineer Modules Extension Tables

create table public.maintenance_schedules (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.maintenance_assignments(id) on delete cascade,
  crew_id uuid references public.maintenance_crews(id) on delete set null,
  scheduled_start timestamptz not null,
  scheduled_end timestamptz not null,
  actual_start timestamptz,
  actual_end timestamptz,
  created_at timestamptz not null default now()
);

create table public.equipment_inventory (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  status text not null default 'Available',
  assigned_crew_id uuid references public.maintenance_crews(id) on delete set null,
  last_maintenance_date date,
  created_at timestamptz not null default now()
);

create table public.ai_verification_logs (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.damage_reports(id) on delete cascade,
  reviewer_id uuid references public.profiles(id) on delete set null,
  original_classification text,
  verified_classification text not null,
  confidence_adjusted numeric(5,2),
  notes text,
  created_at timestamptz not null default now()
);

-- RLS Policies for new tables

alter table public.maintenance_crews enable row level security;
alter table public.system_activity_logs enable row level security;
alter table public.system_health_metrics enable row level security;
alter table public.maintenance_schedules enable row level security;
alter table public.equipment_inventory enable row level security;
alter table public.ai_verification_logs enable row level security;

create policy "admins read crews" on public.maintenance_crews for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'engineer')));
create policy "admins manage crews" on public.maintenance_crews for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "admins read activity" on public.system_activity_logs for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "system create activity" on public.system_activity_logs for insert with check (true);

create policy "public read health" on public.system_health_metrics for select using (true);

create policy "staff read schedules" on public.maintenance_schedules for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'engineer')));
create policy "staff manage schedules" on public.maintenance_schedules for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'engineer')));

create policy "staff read equipment" on public.equipment_inventory for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'engineer')));
create policy "admins manage equipment" on public.equipment_inventory for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "staff read verification logs" on public.ai_verification_logs for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'engineer')));
create policy "staff create verification logs" on public.ai_verification_logs for insert with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'engineer')));


-- Previous Policies
alter table public.profiles enable row level security;
alter table public.damage_reports enable row level security;
alter table public.report_photos enable row level security;
alter table public.report_status_history enable row level security;
alter table public.maintenance_assignments enable row level security;

create policy "citizens read own profile" on public.profiles for select using (auth.uid() = id);
create policy "citizens update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "citizens insert own profile" on public.profiles for insert with check (auth.uid() = id);
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

-- User notification preferences (profile page toggles)

create table public.user_preferences (
  user_id text primary key,
  email_alerts boolean not null default true,
  sms_notifs boolean not null default false,
  hazard_alerts boolean not null default true,
  repair_completion boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy "users read own preferences" on public.user_preferences for select using (user_id = auth.uid()::text);
create policy "users upsert own preferences" on public.user_preferences for all using (user_id = auth.uid()::text);
-- Service role bypass (used by backend with service key) is implicit

-- ── Trigger: auto-sync Supabase Auth signups → public.users + public.profiles ──
-- Ensures citizens who register via supabase.auth.signUp() get the required
-- public.users and public.profiles rows so their profile page can save to DB.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role := 'citizen';
  v_full_name text;
  v_phone text;
  v_ward_zone text;
begin
  begin
    if NEW.raw_user_meta_data->>'role' in ('citizen', 'engineer', 'admin') then
      v_role := (NEW.raw_user_meta_data->>'role')::public.user_role;
    end if;
  exception when others then
    v_role := 'citizen';
  end;

  v_full_name  := nullif(trim(coalesce(NEW.raw_user_meta_data->>'full_name', '')), '');
  v_phone      := nullif(trim(coalesce(NEW.raw_user_meta_data->>'phone', '')), '');
  v_ward_zone  := nullif(trim(coalesce(NEW.raw_user_meta_data->>'ward_zone', '')), '');

  insert into public.users (id, email, password_hash, role)
  values (NEW.id, NEW.email, 'supabase_auth', v_role)
  on conflict (id) do nothing;

  insert into public.profiles (id, full_name, role, phone, ward_zone)
  values (
    NEW.id,
    coalesce(v_full_name, split_part(NEW.email, '@', 1)),
    v_role,
    v_phone,
    v_ward_zone
  )
  on conflict (id) do nothing;

  return NEW;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();
