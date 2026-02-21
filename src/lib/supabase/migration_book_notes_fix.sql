-- Safety-net migration: Ensure book_notes table exists and has proper RLS
-- Run this in your Supabase SQL Editor

-- 1. Create book_notes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.book_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  library_id UUID NOT NULL,  -- references user_library(id)
  type TEXT NOT NULL CHECK (type IN ('note', 'quote')),
  content TEXT NOT NULL,
  page_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.book_notes ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies (if any) and recreate
DROP POLICY IF EXISTS "Users can view own notes" ON public.book_notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON public.book_notes;
DROP POLICY IF EXISTS "Users can update own notes" ON public.book_notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON public.book_notes;

CREATE POLICY "Users can view own notes"
  ON public.book_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON public.book_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON public.book_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON public.book_notes FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_book_notes_library
  ON public.book_notes (library_id, user_id, type);

-- 5. Index for journal queries (fetch all notes/quotes for a user)
CREATE INDEX IF NOT EXISTS idx_book_notes_user_type
  ON public.book_notes (user_id, type, created_at DESC);
