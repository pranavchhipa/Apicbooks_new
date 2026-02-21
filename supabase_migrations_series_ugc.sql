-- Add series columns to user_library
alter table public.user_library 
add column series_name text,
add column series_order numeric;
