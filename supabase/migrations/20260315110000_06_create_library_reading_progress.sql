/*
  # Create Library and Reading Progress Domain

  ## Summary
  Complete library management and reading progress tracking.

  ## Tables Created
  1. `user_library` - User's book library with entitlements
  2. `reading_progress` - Detailed reading progress tracking
  3. `bookmarks` - User bookmarks within books
  4. `highlights` - Text highlights with notes
  5. `reading_notes` - Personal notes on content

  ## Security
  - All tables have RLS enabled
  - Users can only access their own library data
*/

-- User library
CREATE TABLE IF NOT EXISTS user_library (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  access_type text DEFAULT 'purchased' CHECK (access_type IN ('purchased', 'subscribed', 'free', 'trial')),
  progress_percentage int DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  current_chapter_id uuid REFERENCES book_chapters(id) ON DELETE SET NULL,
  current_section_id uuid REFERENCES book_sections(id) ON DELETE SET NULL,
  total_reading_time_minutes int DEFAULT 0,
  is_completed boolean DEFAULT false,
  is_favorite boolean DEFAULT false,
  last_read_at timestamptz,
  started_at timestamptz DEFAULT now() NOT NULL,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, book_id)
);

-- Reading progress (granular tracking)
CREATE TABLE IF NOT EXISTS reading_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  chapter_id uuid REFERENCES book_chapters(id) ON DELETE CASCADE,
  section_id uuid REFERENCES book_sections(id) ON DELETE CASCADE,
  page_number int,
  scroll_position numeric(5, 2),
  is_completed boolean DEFAULT false,
  reading_time_minutes int DEFAULT 0,
  last_read_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, book_id, chapter_id, section_id)
);

-- Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  chapter_id uuid REFERENCES book_chapters(id) ON DELETE CASCADE,
  section_id uuid REFERENCES book_sections(id) ON DELETE CASCADE,
  page_number int,
  title text,
  note text,
  color text DEFAULT '#fbbf24',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Highlights
CREATE TABLE IF NOT EXISTS highlights (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  chapter_id uuid REFERENCES book_chapters(id) ON DELETE CASCADE,
  section_id uuid REFERENCES book_sections(id) ON DELETE CASCADE,
  highlighted_text text NOT NULL,
  start_offset int,
  end_offset int,
  color text DEFAULT '#fde047',
  note text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Reading notes
CREATE TABLE IF NOT EXISTS reading_notes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  chapter_id uuid REFERENCES book_chapters(id) ON DELETE CASCADE,
  section_id uuid REFERENCES book_sections(id) ON DELETE CASCADE,
  note_text text NOT NULL,
  tags text[],
  is_private boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE user_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own library"
  ON user_library FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own library"
  ON user_library FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own progress"
  ON reading_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own progress"
  ON reading_progress FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own bookmarks"
  ON bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own bookmarks"
  ON bookmarks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own highlights"
  ON highlights FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read public highlights"
  ON highlights FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can manage own highlights"
  ON highlights FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own notes"
  ON reading_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notes"
  ON reading_notes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_library_user_id ON user_library(user_id);
CREATE INDEX IF NOT EXISTS idx_user_library_book_id ON user_library(book_id);
CREATE INDEX IF NOT EXISTS idx_user_library_last_read ON user_library(last_read_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_library_favorites ON user_library(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_book ON reading_progress(user_id, book_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_chapter ON reading_progress(chapter_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_book ON bookmarks(user_id, book_id);
CREATE INDEX IF NOT EXISTS idx_highlights_user_book ON highlights(user_id, book_id);
CREATE INDEX IF NOT EXISTS idx_highlights_public ON highlights(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_reading_notes_user_book ON reading_notes(user_id, book_id);
CREATE INDEX IF NOT EXISTS idx_reading_notes_tags ON reading_notes USING gin(tags);

-- Triggers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_library_updated_at') THEN
    CREATE TRIGGER update_user_library_updated_at
      BEFORE UPDATE ON user_library
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_reading_progress_updated_at') THEN
    CREATE TRIGGER update_reading_progress_updated_at
      BEFORE UPDATE ON reading_progress
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_bookmarks_updated_at') THEN
    CREATE TRIGGER update_bookmarks_updated_at
      BEFORE UPDATE ON bookmarks
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_highlights_updated_at') THEN
    CREATE TRIGGER update_highlights_updated_at
      BEFORE UPDATE ON highlights
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_reading_notes_updated_at') THEN
    CREATE TRIGGER update_reading_notes_updated_at
      BEFORE UPDATE ON reading_notes
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
