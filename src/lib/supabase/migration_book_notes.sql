-- Migration: Book Notes & Quotes
-- Run this in your Supabase SQL Editor

-- 1. Create book_notes table
create table if not exists public.book_notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  library_id uuid not null,  -- references user_library(id)
  type text not null check (type in ('note', 'quote')),
  content text not null,
  page_number integer,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. Enable RLS
alter table public.book_notes enable row level security;

-- 3. Policies: Users can only CRUD their own notes
create policy "Users can view own notes"
  on public.book_notes for select
  using (auth.uid() = user_id);

create policy "Users can insert own notes"
  on public.book_notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notes"
  on public.book_notes for update
  using (auth.uid() = user_id);

create policy "Users can delete own notes"
  on public.book_notes for delete
  using (auth.uid() = user_id);

-- 4. Index for fast lookups
create index if not exists idx_book_notes_library
  on public.book_notes (library_id, user_id, type);
