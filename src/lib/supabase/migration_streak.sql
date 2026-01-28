-- Add Streak tracking columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_visited_at TIMESTAMPTZ DEFAULT NOW();

-- Policy update (ensure users can update their own streak)
-- Existing policy "Users can update own profile" should cover this, assuming it allows all columns.
-- If RLS restricts columns, we might need a specific policy, but usually UPDATE is row-based.
