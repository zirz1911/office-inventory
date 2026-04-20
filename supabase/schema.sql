-- Office Computer Inventory Schema
-- Run this in your Supabase project's SQL Editor

create table if not exists computers (
  id uuid primary key default gen_random_uuid(),
  computer_name text not null,
  brand text not null,
  model text not null,
  cpu text not null,
  gpu text,
  ram_gb integer not null,
  storage text not null,
  os text not null,
  department text not null,
  assigned_to text not null,
  status text not null default 'Active' check (status in ('Active', 'Maintenance', 'Retired')),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_computers_department on computers(department);
create index if not exists idx_computers_status on computers(status);

alter table computers enable row level security;

create policy "Allow public read" on computers for select using (true);
create policy "Allow public insert" on computers for insert with check (true);
create policy "Allow public update" on computers for update using (true);
create policy "Allow public delete" on computers for delete using (true);
