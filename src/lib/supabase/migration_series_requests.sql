-- Migration: Series Features
-- 1. Create global_book_metadata table
-- 2. Create series_requests table

-- 1. Global Book Metadata
create table if not exists public.global_book_metadata (
  book_id uuid references public.books(id) on delete cascade primary key,
  series_name text,
  series_order real, -- Using real to support 1.5 etc
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.global_book_metadata enable row level security;

-- Policies for global metadata
create policy "Global metadata is viewable by everyone" 
  on public.global_book_metadata for select using (true);
  
-- Only service role can insert/update (admin) - for now
-- (Policy creation skipped for insert/update as default deny applies to anon/authenticated)

-- 2. Series Requests
create type series_request_status as enum ('pending', 'approved', 'rejected');

create table if not exists public.series_requests (
  id uuid default gen_random_uuid() primary key,
  book_id uuid references public.books(id) on delete cascade,
  book_title text not null,
  suggested_series text,
  suggested_order real,
  user_id uuid references auth.users(id) on delete set null,
  status series_request_status default 'pending',
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.series_requests enable row level security;

-- Policies for requests
create policy "Users can view their own requests" 
  on public.series_requests for select 
  using (auth.uid() = user_id);

create policy "Users can insert requests" 
  on public.series_requests for insert 
  with check (auth.role() = 'authenticated');
  
-- Admin policies would go here (e.g. service role bypasses RLS)

