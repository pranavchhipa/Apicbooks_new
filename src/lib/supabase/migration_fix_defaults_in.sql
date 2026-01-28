-- Migration: Add Preferences to Profiles with India Default
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"region": "IN", "currency": "INR"}'::jsonb;

-- Optional: Backfill existing users who might have null or empty preferences
UPDATE public.profiles
SET preferences = '{"region": "IN", "currency": "INR"}'::jsonb
WHERE preferences IS NULL;
