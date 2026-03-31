
-- 1. Profiles Table (Extends Auth Users)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  bio text,
  location text,
  website text,
  streak_count integer default 0,
  location_gl text default 'IN', -- Default to India as requested
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(full_name) >= 3)
);

-- 2. User Books / Library Table
create table if not exists public.user_books (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  book_id text not null, -- Google Books ID or ISBN
  title text not null,
  author text,
  cover_url text,
  status text check (status in ('read', 'reading', 'want_to_read', 'did_not_finish')),
  rating integer check (rating >= 1 and rating <= 5),
  review text,
  
  -- Progress Tracking
  current_page integer default 0,
  total_pages integer default 0,
  timer_data jsonb default '{}'::jsonb, -- Store session logs { "sessions": [{ "date": "...", "duration": 120 }] }
  
  -- Categorization
  is_academic boolean default false, -- For Biotech/Academic Shelf
  
  added_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.user_books enable row level security;

-- 4. Policies
-- Profiles: Public read, Self update
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- User Books: Self read/write
create policy "Users can view own books" on public.user_books
  for select using (auth.uid() = user_id);

create policy "Users can insert own books" on public.user_books
  for insert with check (auth.uid() = user_id);

create policy "Users can update own books" on public.user_books
  for update using (auth.uid() = user_id);

create policy "Users can delete own books" on public.user_books
  for delete using (auth.uid() = user_id);

-- 5. Auto-create profile trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, location_gl)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'IN');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
