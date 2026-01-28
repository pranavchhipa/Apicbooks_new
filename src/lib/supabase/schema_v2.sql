-- ============================================
-- 1. PROFILES (Extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  location TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT username_length CHECK (char_length(full_name) >= 3)
);

-- RLS: Profiles are viewable by everyone, editable by owner
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- 2. USER LIBRARY (Replaces simple wishlist)
-- ============================================
-- We keep 'books' as the canonical cache of book metadata
-- 'user_library' links users to books with a specific status

CREATE TYPE reading_status AS ENUM ('wishlist', 'reading', 'completed', 'dnf');

CREATE TABLE IF NOT EXISTS public.user_library (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  status reading_status DEFAULT 'wishlist',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, book_id)
);

-- RLS: Private to the user (unless we want social features later)
ALTER TABLE public.user_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own library" 
  ON public.user_library FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own library" 
  ON public.user_library FOR ALL 
  USING (auth.uid() = user_id);

-- ============================================
-- 3. STORAGE (Avatars)
-- ============================================
-- Note: You must create a bucket named 'avatars' in the Supabase Dashboard
-- Policies cannot be easily scripted if the bucket doesn't exist, 
-- but here are the SQL commands if using the storage schema:

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

CREATE POLICY "Anyone can upload an avatar"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

CREATE POLICY "Anyone can update their own avatar"
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'avatars' AND auth.uid() = owner )
  WITH CHECK ( bucket_id = 'avatars' AND auth.uid() = owner );
