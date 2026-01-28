-- BookScanner Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- BOOKS TABLE (Static metadata)
-- ============================================
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  isbn VARCHAR(13) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  authors TEXT[] DEFAULT '{}',
  description TEXT,
  cover_url TEXT,
  categories TEXT[] DEFAULT '{}',
  page_count INTEGER,
  published_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRICES TABLE (Volatile pricing data)
-- ============================================
CREATE TABLE IF NOT EXISTS prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  source VARCHAR(50) NOT NULL,
  price_new DECIMAL(10,2),
  price_used DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  url TEXT,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(book_id, source)
);

-- ============================================
-- WISHLISTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_books_title ON books USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_prices_book_id ON prices(book_id);
CREATE INDEX IF NOT EXISTS idx_prices_fetched_at ON prices(fetched_at);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Books: Everyone can read, only service role can write
CREATE POLICY "Books are viewable by everyone" 
  ON books FOR SELECT 
  USING (true);

CREATE POLICY "Service role can insert books" 
  ON books FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Service role can update books" 
  ON books FOR UPDATE 
  USING (true);

-- Prices: Everyone can read, only service role can write
CREATE POLICY "Prices are viewable by everyone" 
  ON prices FOR SELECT 
  USING (true);

CREATE POLICY "Service role can insert prices" 
  ON prices FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Service role can update prices" 
  ON prices FOR UPDATE 
  USING (true);

-- Wishlists: Users can only access their own wishlists
CREATE POLICY "Users can view their own wishlist" 
  ON wishlists FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own wishlist" 
  ON wishlists FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own wishlist" 
  ON wishlists FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for books table
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER VIEWS
-- ============================================

-- View to check if prices are fresh (less than 24 hours old)
CREATE OR REPLACE VIEW books_with_fresh_prices AS
SELECT 
  b.*,
  CASE 
    WHEN MIN(p.fetched_at) > NOW() - INTERVAL '24 hours' THEN true
    ELSE false
  END as has_fresh_prices
FROM books b
LEFT JOIN prices p ON b.id = p.book_id
GROUP BY b.id;
