/*
  # Create Books and Workbooks Tables

  1. New Tables
    - `books` - Individual books/content
    - `book_chapters` - Chapters within books
    - `book_sections` - Sections within chapters

  2. Security
    - Enable RLS
    - Authenticated users can view
    - Only admins can create/modify
*/

CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  author TEXT NOT NULL,
  cover_image TEXT,
  price DECIMAL(10, 2) DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration TEXT,
  total_chapters INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS book_chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  order_index INTEGER NOT NULL,
  content TEXT,
  estimated_duration INTEGER DEFAULT 0,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(book_id, order_index)
);

CREATE TABLE IF NOT EXISTS book_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID NOT NULL REFERENCES book_chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'markdown' CHECK (content_type IN ('markdown', 'html', 'video')),
  order_index INTEGER NOT NULL,
  estimated_duration INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chapter_id, order_index)
);

-- Indexes
CREATE INDEX idx_books_is_published ON books(is_published);
CREATE INDEX idx_book_chapters_book_id ON book_chapters(book_id);
CREATE INDEX idx_book_sections_chapter_id ON book_sections(chapter_id);

-- Enable RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_sections ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can view published books" ON books FOR SELECT TO authenticated USING (is_published = true);
CREATE POLICY "Authenticated users can view chapters" ON book_chapters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view sections" ON book_sections FOR SELECT TO authenticated USING (true);
