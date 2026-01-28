-- Add current_page to user_library
ALTER TABLE public.user_library 
ADD COLUMN IF NOT EXISTS current_page INTEGER DEFAULT 0;
