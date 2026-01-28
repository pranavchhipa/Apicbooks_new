-- Add explicit foreign key to profiles for easier joining
ALTER TABLE activities
DROP CONSTRAINT IF EXISTS activities_user_id_fkey,
ADD CONSTRAINT activities_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE;
