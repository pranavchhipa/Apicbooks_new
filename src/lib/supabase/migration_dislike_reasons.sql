-- Migration: Add dislike_reasons column to user_library
-- Run this in your Supabase SQL Editor

ALTER TABLE public.user_library
ADD COLUMN IF NOT EXISTS dislike_reasons JSONB DEFAULT '[]'::jsonb;

-- Add a comment for documentation
COMMENT ON COLUMN public.user_library.dislike_reasons IS 'Array of dislike reasons selected by the user for this book (e.g. "Boring plot", "Poor writing style"). Used to improve AI recommendations.';
