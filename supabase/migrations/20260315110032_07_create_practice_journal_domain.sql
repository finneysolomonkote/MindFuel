/*
  # Create Practice and Journal Domain

  ## Summary
  Comprehensive guided practices and journaling system.

  ## Tables Created
  1. `guided_practices` - Practice templates
  2. `practice_steps` - Steps within practices
  3. `user_practice_sessions` - User practice session tracking
  4. `user_practice_answers` - User answers to practice questions
  5. `journal_entries` - User journal entries
  6. `journal_tags` - Tags for journals
  7. `journal_prompts` - Admin-configured journal prompts

  ## Security
  - All tables have RLS enabled
  - Users can only access their own data
  - Public can read practice templates
*/

-- Guided practices
CREATE TABLE IF NOT EXISTS guided_practices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  difficulty text DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_time_minutes int DEFAULT 10,
  book_id uuid REFERENCES books(id) ON DELETE SET NULL,
  chapter_id uuid REFERENCES book_chapters(id) ON DELETE SET NULL,
  icon_url text,
  is_active boolean DEFAULT true,
  total_completions int DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES users(id)
);

-- Practice steps
CREATE TABLE IF NOT EXISTS practice_steps (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id uuid REFERENCES guided_practices(id) ON DELETE CASCADE NOT NULL,
  step_number int NOT NULL,
  step_type text NOT NULL CHECK (step_type IN ('instruction', 'question', 'reflection', 'media', 'exercise')),
  title text NOT NULL,
  content text NOT NULL,
  media_url text,
  question_type text CHECK (question_type IN ('text', 'multiple_choice', 'rating', 'yes_no')),
  options jsonb,
  is_required boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(practice_id, step_number)
);

-- User practice sessions
CREATE TABLE IF NOT EXISTS user_practice_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  practice_id uuid REFERENCES guided_practices(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  current_step int DEFAULT 1,
  total_steps int NOT NULL,
  completion_percentage int DEFAULT 0,
  started_at timestamptz DEFAULT now() NOT NULL,
  completed_at timestamptz,
  time_spent_minutes int DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- User practice answers
CREATE TABLE IF NOT EXISTS user_practice_answers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid REFERENCES user_practice_sessions(id) ON DELETE CASCADE NOT NULL,
  step_id uuid REFERENCES practice_steps(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  answer_text text,
  answer_data jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(session_id, step_id)
);

-- Journal entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text,
  content text NOT NULL,
  mood text,
  mood_score int CHECK (mood_score >= 1 AND mood_score <= 10),
  tags text[],
  is_private boolean DEFAULT true,
  book_id uuid REFERENCES books(id) ON DELETE SET NULL,
  practice_session_id uuid REFERENCES user_practice_sessions(id) ON DELETE SET NULL,
  prompt_id uuid,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Journal tags
CREATE TABLE IF NOT EXISTS journal_tags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  color text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Journal prompts
CREATE TABLE IF NOT EXISTS journal_prompts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_text text NOT NULL,
  category text,
  difficulty text DEFAULT 'beginner',
  is_active boolean DEFAULT true,
  display_date date,
  created_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES users(id)
);

-- Enable RLS
ALTER TABLE guided_practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_practice_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_prompts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read active practices"
  ON guided_practices FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Anyone can read practice steps"
  ON practice_steps FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM guided_practices 
      WHERE guided_practices.id = practice_id AND guided_practices.is_active = true
    )
  );

CREATE POLICY "Users can read own sessions"
  ON user_practice_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own sessions"
  ON user_practice_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own answers"
  ON user_practice_answers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own answers"
  ON user_practice_answers FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own journal entries"
  ON journal_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own journal entries"
  ON journal_entries FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read journal tags"
  ON journal_tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read active prompts"
  ON journal_prompts FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_guided_practices_category ON guided_practices(category);
CREATE INDEX IF NOT EXISTS idx_guided_practices_active ON guided_practices(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_practice_steps_practice_id ON practice_steps(practice_id);
CREATE INDEX IF NOT EXISTS idx_practice_steps_number ON practice_steps(practice_id, step_number);
CREATE INDEX IF NOT EXISTS idx_user_practice_sessions_user_id ON user_practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_practice_sessions_practice_id ON user_practice_sessions(practice_id);
CREATE INDEX IF NOT EXISTS idx_user_practice_sessions_status ON user_practice_sessions(status);
CREATE INDEX IF NOT EXISTS idx_user_practice_answers_session_id ON user_practice_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_tags ON journal_entries USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_journal_prompts_date ON journal_prompts(display_date);
CREATE INDEX IF NOT EXISTS idx_journal_prompts_active ON journal_prompts(is_active) WHERE is_active = true;

-- Full-text search for journal entries
CREATE INDEX IF NOT EXISTS idx_journal_entries_content_trgm ON journal_entries USING gin(content gin_trgm_ops);

-- Triggers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_guided_practices_updated_at') THEN
    CREATE TRIGGER update_guided_practices_updated_at
      BEFORE UPDATE ON guided_practices
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_practice_sessions_updated_at') THEN
    CREATE TRIGGER update_user_practice_sessions_updated_at
      BEFORE UPDATE ON user_practice_sessions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_practice_answers_updated_at') THEN
    CREATE TRIGGER update_user_practice_answers_updated_at
      BEFORE UPDATE ON user_practice_answers
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_journal_entries_updated_at') THEN
    CREATE TRIGGER update_journal_entries_updated_at
      BEFORE UPDATE ON journal_entries
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
