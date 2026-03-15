/*
  # Create Goals and Journals Tables

  ## Summary
  Creates tables for user goals and journal entries in the MindFuel AI platform.

  ## Tables Created
  1. `goals` - User goals
  2. `goal_progress` - Progress tracking for goals
  3. `journals` - User journal entries

  ## Security
  - Enable RLS on all tables
  - Users can only access their own goals and journals
*/

CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  target_date timestamptz,
  status text DEFAULT 'active' NOT NULL,
  is_completed boolean DEFAULT false NOT NULL,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS goal_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
  note text NOT NULL,
  progress_percentage int NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS journals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  mood text,
  tags text[] DEFAULT ARRAY[]::text[],
  is_favorite boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own goals"
  ON goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own goal progress"
  ON goal_progress FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM goals WHERE goals.id = goal_id AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own goal progress"
  ON goal_progress FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM goals WHERE goals.id = goal_id AND goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can read own journals"
  ON journals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journals"
  ON journals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journals"
  ON journals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own journals"
  ON journals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_progress_goal_id ON goal_progress(goal_id);
CREATE INDEX IF NOT EXISTS idx_journals_user_id ON journals(user_id);
