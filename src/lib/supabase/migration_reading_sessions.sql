-- ============================================
-- READING SESSIONS MIGRATION
-- Adds reading session tracking for time spent reading
-- ============================================

-- 1. Create reading_sessions table
CREATE TABLE IF NOT EXISTS public.reading_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  library_id UUID REFERENCES public.user_library(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 0,
  pages_start INTEGER DEFAULT 0,
  pages_end INTEGER DEFAULT 0,
  pages_read INTEGER GENERATED ALWAYS AS (GREATEST(0, pages_end - pages_start)) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add total_minutes_read column to user_library if not exists
ALTER TABLE public.user_library ADD COLUMN IF NOT EXISTS total_minutes_read INTEGER DEFAULT 0;

-- 3. Enable RLS
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for reading_sessions
CREATE POLICY "Users can view own sessions" 
  ON public.reading_sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" 
  ON public.reading_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" 
  ON public.reading_sessions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" 
  ON public.reading_sessions FOR DELETE 
  USING (auth.uid() = user_id);

-- 5. Index for faster queries
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_id ON public.reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_library_id ON public.reading_sessions(library_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_started_at ON public.reading_sessions(started_at DESC);

-- 6. Function to aggregate reading time when session ends
CREATE OR REPLACE FUNCTION public.update_library_reading_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL AND NEW.duration_minutes > 0 THEN
    UPDATE public.user_library 
    SET total_minutes_read = COALESCE(total_minutes_read, 0) + NEW.duration_minutes,
        updated_at = NOW()
    WHERE id = NEW.library_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger to update total reading time
DROP TRIGGER IF EXISTS on_session_end ON public.reading_sessions;
CREATE TRIGGER on_session_end
  AFTER UPDATE OF ended_at ON public.reading_sessions
  FOR EACH ROW
  WHEN (OLD.ended_at IS NULL AND NEW.ended_at IS NOT NULL)
  EXECUTE FUNCTION public.update_library_reading_time();
