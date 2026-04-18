-- Office Computer Inventory Schema
-- Run this in your Supabase project's SQL Editor

create table if not exists computers (
  id uuid primary key default gen_random_uuid(),
  asset_tag text unique not null,
  computer_name text not null,
  brand text not null,
  model text not null,
  cpu text not null,
  ram_gb integer not null,
  storage text not null,
  os text not null,
  department text not null,
  assigned_to text not null,
  status text not null default 'Active' check (status in ('Active', 'Maintenance', 'Retired')),
  purchase_date date,
  notes text,
  created_at timestamptz not null default now()
);

-- Index for common search fields
create index if not exists idx_computers_asset_tag on computers(asset_tag);
create index if not exists idx_computers_department on computers(department);
create index if not exists idx_computers_status on computers(status);

-- Enable Row Level Security (RLS)
alter table computers enable row level security;

-- Policy: allow all operations for anonymous users (for office intranet use)
-- For production, restrict to authenticated users by replacing "anon" with "authenticated"
create policy "Allow public read" on computers
  for select using (true);

create policy "Allow public insert" on computers
  for insert with check (true);

create policy "Allow public update" on computers
  for update using (true);

create policy "Allow public delete" on computers
  for delete using (true);

-- Sample data (optional — remove if not needed)
insert into computers (asset_tag, computer_name, brand, model, cpu, ram_gb, storage, os, department, assigned_to, status, purchase_date, notes)
values
  ('PC-001', 'DESKTOP-FINANCE01', 'Dell', 'OptiPlex 7090', 'Intel Core i7-11700', 16, '512GB SSD', 'Windows 11 Pro', 'Finance', 'Alice Johnson', 'Active', '2023-01-15', NULL),
  ('PC-002', 'LAPTOP-HR01', 'Lenovo', 'ThinkPad E15', 'Intel Core i5-1135G7', 8, '256GB SSD', 'Windows 11 Home', 'HR', 'Bob Smith', 'Active', '2023-03-20', 'Docking station assigned'),
  ('PC-003', 'DESKTOP-IT01', 'HP', 'EliteDesk 800 G6', 'Intel Core i9-10900', 32, '1TB NVMe SSD', 'Ubuntu 22.04 LTS', 'IT', 'Charlie Davis', 'Active', '2022-11-05', 'Development machine'),
  ('PC-004', 'LAPTOP-SALES01', 'Dell', 'Latitude 5520', 'Intel Core i5-1145G7', 16, '512GB SSD', 'Windows 11 Pro', 'Sales', 'Diana Wilson', 'Maintenance', '2022-06-10', 'Battery replacement pending'),
  ('PC-005', 'DESKTOP-OLD01', 'HP', 'ProDesk 400 G5', 'Intel Core i3-8100', 4, '256GB HDD', 'Windows 10 Pro', 'Warehouse', 'Unassigned', 'Retired', '2019-02-28', 'End of life — scheduled for disposal');
