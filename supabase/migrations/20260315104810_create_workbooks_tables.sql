/*
  # Create Workbooks Tables

  ## Summary
  Creates tables for managing workbooks, chapters, and sections in the MindFuel AI platform.

  ## Tables Created
  1. `workbooks` - Main workbook content
  2. `workbook_chapters` - Chapters within workbooks
  3. `workbook_sections` - Sections within chapters
  4. `user_workbooks` - User progress tracking for workbooks

  ## Security
  - Enable RLS on all tables
  - Users can read active workbooks
  - Only admins can create/update/delete workbooks
  - Users can read and update their own workbook progress
*/

CREATE TABLE IF NOT EXISTS workbooks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text NOT NULL,
  author text NOT NULL,
  cover_image_url text NOT NULL,
  file_url text,
  category text NOT NULL,
  tags text[] DEFAULT ARRAY[]::text[],
  is_free boolean DEFAULT false NOT NULL,
  status text DEFAULT 'active' NOT NULL,
  total_chapters int DEFAULT 0 NOT NULL,
  estimated_reading_time_minutes int DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS workbook_chapters (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  workbook_id uuid REFERENCES workbooks(id) ON DELETE CASCADE NOT NULL,
  chapter_number int NOT NULL,
  title text NOT NULL,
  description text,
  content text,
  embedding vector(1536),
  status text DEFAULT 'active' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(workbook_id, chapter_number)
);

CREATE TABLE IF NOT EXISTS workbook_sections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id uuid REFERENCES workbook_chapters(id) ON DELETE CASCADE NOT NULL,
  section_number int NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  embedding vector(1536),
  page_number int,
  status text DEFAULT 'active' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(chapter_id, section_number)
);

CREATE TABLE IF NOT EXISTS user_workbooks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  workbook_id uuid REFERENCES workbooks(id) ON DELETE CASCADE NOT NULL,
  progress_percentage int DEFAULT 0 NOT NULL,
  last_chapter_id uuid REFERENCES workbook_chapters(id),
  last_section_id uuid REFERENCES workbook_sections(id),
  total_reading_time_minutes int DEFAULT 0 NOT NULL,
  is_completed boolean DEFAULT false NOT NULL,
  started_at timestamptz DEFAULT now() NOT NULL,
  completed_at timestamptz,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, workbook_id)
);

ALTER TABLE workbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workbook_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE workbook_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_workbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read active workbooks"
  ON workbooks FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Admins can manage workbooks"
  ON workbooks FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' IN ('admin', 'super_admin'))
  WITH CHECK (auth.jwt()->>'role' IN ('admin', 'super_admin'));

CREATE POLICY "Users can read chapters of active workbooks"
  ON workbook_chapters FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM workbooks WHERE workbooks.id = workbook_id AND workbooks.status = 'active'
  ));

CREATE POLICY "Users can read sections of accessible chapters"
  ON workbook_sections FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM workbook_chapters
    JOIN workbooks ON workbooks.id = workbook_chapters.workbook_id
    WHERE workbook_chapters.id = chapter_id AND workbooks.status = 'active'
  ));

CREATE POLICY "Users can read own workbook progress"
  ON user_workbooks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own workbook progress"
  ON user_workbooks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own workbook progress"
  ON user_workbooks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_workbooks_status ON workbooks(status);
CREATE INDEX IF NOT EXISTS idx_workbooks_category ON workbooks(category);
CREATE INDEX IF NOT EXISTS idx_chapters_workbook_id ON workbook_chapters(workbook_id);
CREATE INDEX IF NOT EXISTS idx_sections_chapter_id ON workbook_sections(chapter_id);
CREATE INDEX IF NOT EXISTS idx_user_workbooks_user_id ON user_workbooks(user_id);
