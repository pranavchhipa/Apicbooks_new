-- Run this in your Supabase SQL Editor to support half-star ratings
-- This will change the rating column from INTEGER to NUMERIC(3, 1) to allow values like 3.5, 4.5
ALTER TABLE user_library 
ALTER COLUMN rating TYPE NUMERIC(3, 1);
