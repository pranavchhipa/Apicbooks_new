-- Create global_book_metadata table
create table if not exists public.global_book_metadata (
  book_id uuid not null references public.books(id) on delete cascade primary key,
  series_name text,
  series_order numeric,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_by uuid references auth.users(id)
);

-- Enable RLS
alter table public.global_book_metadata enable row level security;

-- Policies
create policy "Enable read access for all users"
on public.global_book_metadata for select
using (true);

create policy "Enable insert/update for authenticated users"
on public.global_book_metadata for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');
