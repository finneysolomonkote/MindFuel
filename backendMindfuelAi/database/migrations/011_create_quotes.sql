CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quotes_category ON quotes(category);
CREATE INDEX idx_quotes_is_active ON quotes(is_active);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view quotes" ON quotes FOR SELECT TO authenticated USING (is_active = true);
