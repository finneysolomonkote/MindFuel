CREATE TABLE IF NOT EXISTS workbooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  author TEXT NOT NULL,
  cover_image TEXT,
  price DECIMAL(10, 2) DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  rating DECIMAL(3, 2) DEFAULT 0,
  enrollment_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workbook_chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workbook_id UUID NOT NULL REFERENCES workbooks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  order_index INTEGER NOT NULL,
  estimated_duration INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workbook_id, order_index)
);

CREATE TABLE IF NOT EXISTS workbook_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID NOT NULL REFERENCES workbook_chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chapter_id, order_index)
);

CREATE INDEX idx_workbooks_status ON workbooks(status);
CREATE INDEX idx_workbook_chapters_workbook_id ON workbook_chapters(workbook_id);
CREATE INDEX idx_workbook_sections_chapter_id ON workbook_sections(chapter_id);

ALTER TABLE workbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workbook_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE workbook_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view published workbooks" ON workbooks FOR SELECT TO authenticated USING (status = 'published');
CREATE POLICY "Authenticated users can view workbook chapters" ON workbook_chapters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view workbook sections" ON workbook_sections FOR SELECT TO authenticated USING (true);
