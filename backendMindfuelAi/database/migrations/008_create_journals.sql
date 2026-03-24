CREATE TABLE IF NOT EXISTS journals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood TEXT,
  energy INTEGER CHECK (energy >= 1 AND energy <= 10),
  tags TEXT[] DEFAULT '{}',
  is_private BOOLEAN DEFAULT true,
  linked_goals UUID[],
  linked_books UUID[],
  word_count INTEGER DEFAULT 0,
  ai_insights JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_journals_user_id ON journals(user_id);
CREATE INDEX idx_journals_created_at ON journals(created_at DESC);

ALTER TABLE journals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own journals" ON journals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
