-- Migration to add series information to books table

-- Add series_name column (Text)
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS series_name TEXT;

-- Add series_order column (Numeric to handle 1.5 etc, though usually integer)
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS series_order NUMERIC;

-- Optional: Add index for faster queries if needed
CREATE INDEX IF NOT EXISTS idx_books_series_name ON books(series_name);
