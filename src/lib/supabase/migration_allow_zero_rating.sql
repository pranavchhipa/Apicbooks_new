-- Drop the existing check constraint
ALTER TABLE user_library DROP CONSTRAINT IF EXISTS user_library_rating_check;

-- Add a new check constraint that allows 0
ALTER TABLE user_library ADD CONSTRAINT user_library_rating_check CHECK (rating >= 0 AND rating <= 5);
