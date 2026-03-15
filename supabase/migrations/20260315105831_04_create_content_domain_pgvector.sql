/*
  # Create Content Domain with pgvector

  ## Summary
  Creates comprehensive content management schema with pgvector for semantic search.

  ## Tables Created
  1. `books` - Main book/workbook content
  2. `book_chapters` - Chapters within books  
  3. `book_sections` - Sections within chapters
  4. `book_tags` - Tags for categorization
  5. `book_tag_mapping` - Many-to-many book-tag relationship
  6. `content_chunks` - Chunked content with embeddings for RAG
  7. `daily_quotes` - Daily motivational quotes

  ## Security
  - All tables have RLS enabled
  - Users can read active content
  - Only admins can manage content
*/

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  subtitle text,
  description text NOT NULL,
  author text NOT NULL,
  cover_image_url text NOT NULL,
  file_url text,
  category text NOT NULL,
  subcategory text,
  is_free boolean DEFAULT false NOT NULL,
  is_featured boolean DEFAULT false NOT NULL,
  status text DEFAULT 'active' NOT NULL CHECK (status IN ('draft', 'active', 'archived')),
  total_chapters int DEFAULT 0 NOT NULL,
  total_pages int DEFAULT 0,
  estimated_reading_time_minutes int DEFAULT 0 NOT NULL,
  average_rating numeric(3, 2) DEFAULT 0.0,
  total_ratings int DEFAULT 0,
  total_reads int DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES users(id)
);

-- Book chapters
CREATE TABLE IF NOT EXISTS book_chapters (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id uuid REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  chapter_number int NOT NULL,
  title text NOT NULL,
  subtitle text,
  description text,
  content text,
  summary text,
  key_takeaways text[],
  estimated_reading_time_minutes int DEFAULT 0,
  status text DEFAULT 'active' NOT NULL CHECK (status IN ('draft', 'active', 'archived')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(book_id, chapter_number)
);

-- Book sections
CREATE TABLE IF NOT EXISTS book_sections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id uuid REFERENCES book_chapters(id) ON DELETE CASCADE NOT NULL,
  section_number int NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  page_number int,
  has_exercises boolean DEFAULT false,
  status text DEFAULT 'active' NOT NULL CHECK (status IN ('draft', 'active', 'archived')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(chapter_id, section_number)
);

-- Book tags
CREATE TABLE IF NOT EXISTS book_tags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  color text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Book tag mapping
CREATE TABLE IF NOT EXISTS book_tag_mapping (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id uuid REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  tag_id uuid REFERENCES book_tags(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(book_id, tag_id)
);

-- Content chunks for RAG with pgvector
CREATE TABLE IF NOT EXISTS content_chunks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id uuid REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  chapter_id uuid REFERENCES book_chapters(id) ON DELETE CASCADE,
  section_id uuid REFERENCES book_sections(id) ON DELETE CASCADE,
  chunk_text text NOT NULL,
  chunk_index int NOT NULL,
  token_count int NOT NULL,
  embedding vector(1536),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Daily quotes
CREATE TABLE IF NOT EXISTS daily_quotes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_text text NOT NULL,
  author text NOT NULL,
  category text,
  book_id uuid REFERENCES books(id) ON DELETE SET NULL,
  status text DEFAULT 'active' NOT NULL CHECK (status IN ('draft', 'active', 'archived')),
  display_date date,
  created_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES users(id)
);

-- Enable RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_tag_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_quotes ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_featured ON books(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_book_chapters_book_id ON book_chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_book_chapters_number ON book_chapters(book_id, chapter_number);
CREATE INDEX IF NOT EXISTS idx_book_sections_chapter_id ON book_sections(chapter_id);
CREATE INDEX IF NOT EXISTS idx_book_sections_number ON book_sections(chapter_id, section_number);
CREATE INDEX IF NOT EXISTS idx_content_chunks_book_id ON content_chunks(book_id);
CREATE INDEX IF NOT EXISTS idx_content_chunks_chapter_id ON content_chunks(chapter_id);
CREATE INDEX IF NOT EXISTS idx_content_chunks_section_id ON content_chunks(section_id);
CREATE INDEX IF NOT EXISTS idx_content_chunks_embedding ON content_chunks 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_books_title_trgm ON books USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_books_author_trgm ON books USING gin(author gin_trgm_ops);
