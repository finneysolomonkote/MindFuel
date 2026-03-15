/*
  # Extend AI Domain

  ## Summary
  Extends AI domain with usage tracking, summaries, and retrieval logs.

  ## New Tables
  1. `ai_usage_logs` - Token usage and cost tracking
  2. `ai_summaries` - Generated summaries for content
  3. `retrieval_logs` - RAG retrieval logs for analytics

  ## Security
  - All tables have RLS enabled
  - Users can only access their own data
*/

-- AI usage logs
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  model_used text NOT NULL,
  prompt_tokens int DEFAULT 0,
  completion_tokens int DEFAULT 0,
  total_tokens int DEFAULT 0,
  estimated_cost_usd numeric(10, 6) DEFAULT 0.0,
  response_time_ms int,
  success boolean DEFAULT true,
  error_message text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- AI summaries
CREATE TABLE IF NOT EXISTS ai_summaries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type text NOT NULL CHECK (content_type IN ('book', 'chapter', 'section', 'conversation', 'journal')),
  content_id uuid NOT NULL,
  summary_text text NOT NULL,
  key_points text[],
  tags text[],
  model_used text,
  tokens_used int,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(content_type, content_id)
);

-- Retrieval logs for RAG analytics
CREATE TABLE IF NOT EXISTS retrieval_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  query_text text NOT NULL,
  query_embedding vector(1536),
  results_count int DEFAULT 0,
  top_chunks jsonb DEFAULT '[]'::jsonb,
  retrieval_method text DEFAULT 'semantic',
  filters_applied jsonb,
  execution_time_ms int,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE retrieval_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own usage logs"
  ON ai_usage_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read summaries"
  ON ai_summaries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read own retrieval logs"
  ON retrieval_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON ai_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_summaries_content ON ai_summaries(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_retrieval_logs_user_id ON retrieval_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_retrieval_logs_created_at ON retrieval_logs(created_at DESC);

-- Vector index for query embeddings
CREATE INDEX IF NOT EXISTS idx_retrieval_logs_query_embedding ON retrieval_logs 
  USING ivfflat (query_embedding vector_cosine_ops) 
  WITH (lists = 100);

-- Trigger
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_ai_summaries_updated_at') THEN
    CREATE TRIGGER update_ai_summaries_updated_at
      BEFORE UPDATE ON ai_summaries
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
