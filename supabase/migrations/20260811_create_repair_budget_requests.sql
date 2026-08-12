-- Migration: Create repair_budget_requests table for Approval Authority module

create table if not exists public.repair_budget_requests (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.damage_reports(id) on delete set null,
  work_order_id text not null,
  title text not null,
  department text not null default 'Roads & Bridges',
  urgency text not null default 'Normal',
  requested_by_id uuid references public.profiles(id) on delete set null,
  requested_by_name text not null,
  material_cost numeric(12,2) not null default 0.00,
  labor_cost numeric(12,2) not null default 0.00,
  equipment_cost numeric(12,2) not null default 0.00,
  contingency_cost numeric(12,2) not null default 0.00,
  total_estimated_cost numeric(12,2) not null default 0.00,
  status text not null default 'Pending',
  approval_level text not null default 'Level 1',
  approved_by text,
  decision_notes text,
  cost_breakdown jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.repair_budget_requests enable row level security;

drop policy if exists "staff read budget requests" on public.repair_budget_requests;
create policy "staff read budget requests" on public.repair_budget_requests for select using (true);

drop policy if exists "staff manage budget requests" on public.repair_budget_requests;
create policy "staff manage budget requests" on public.repair_budget_requests for all using (true);
