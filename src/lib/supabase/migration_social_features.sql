-- Migration: Add Social Features Support
-- Run this in Supabase SQL Editor

-- 1. Add is_review_public column to user_library
ALTER TABLE user_library 
ADD COLUMN IF NOT EXISTS is_review_public BOOLEAN DEFAULT TRUE;

-- 2. Create activities table for activity feed
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- 'started_reading', 'finished', 'reviewed', 'added_to_library'
    book_id TEXT NOT NULL,
    book_title TEXT,
    book_cover TEXT,
    metadata JSONB DEFAULT '{}', -- Additional data like rating, review snippet
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- 3. Create follows table for friend system
CREATE TABLE IF NOT EXISTS follows (
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

-- Index for faster friend lookups
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- 4. Add streak and goal columns to profiles if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'current_streak') THEN
        ALTER TABLE profiles ADD COLUMN current_streak INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'longest_streak') THEN
        ALTER TABLE profiles ADD COLUMN longest_streak INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'reading_goal') THEN
        ALTER TABLE profiles ADD COLUMN reading_goal INTEGER DEFAULT 12;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_visited_at') THEN
        ALTER TABLE profiles ADD COLUMN last_visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 5. RLS Policies for activities
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all activities" ON activities
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own activities" ON activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities" ON activities
    FOR DELETE USING (auth.uid() = user_id);

-- 6. RLS Policies for follows
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view follows" ON follows
    FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" ON follows
    FOR DELETE USING (auth.uid() = follower_id);
