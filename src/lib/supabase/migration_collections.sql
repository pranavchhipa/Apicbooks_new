-- Create collections table
create table if not exists collections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  cover_url text, -- Optional custom cover, otherwise use first book's cover
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create collection_items table
create table if not exists collection_items (
  id uuid default gen_random_uuid() primary key,
  collection_id uuid references collections(id) on delete cascade not null,
  book_id uuid references books(id) on delete cascade not null,
  added_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(collection_id, book_id)
);

-- Enable RLS
alter table collections enable row level security;
alter table collection_items enable row level security;

-- Policies for collections
create policy "Users can view their own collections"
  on collections for select
  using (auth.uid() = user_id);

create policy "Users can insert their own collections"
  on collections for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own collections"
  on collections for update
  using (auth.uid() = user_id);

create policy "Users can delete their own collections"
  on collections for delete
  using (auth.uid() = user_id);

-- Policies for collection_items
-- We check if the parent collection belongs to the user
create policy "Users can view items in their collections"
  on collection_items for select
  using (exists (
    select 1 from collections
    where collections.id = collection_items.collection_id
    and collections.user_id = auth.uid()
  ));

create policy "Users can add items to their collections"
  on collection_items for insert
  with check (exists (
    select 1 from collections
    where collections.id = collection_items.collection_id
    and collections.user_id = auth.uid()
  ));

create policy "Users can remove items from their collections"
  on collection_items for delete
  using (exists (
    select 1 from collections
    where collections.id = collection_items.collection_id
    and collections.user_id = auth.uid()
  ));
