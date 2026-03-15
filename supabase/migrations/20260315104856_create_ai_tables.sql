/*
  # Create AI Tables

  ## Summary
  Creates tables for AI conversations, messages, prompt templates, and model configuration.

  ## Tables Created
  1. `conversations` - User AI conversations
  2. `chat_messages` - Messages within conversations
  3. `ai_prompt_templates` - Admin-configurable prompt templates
  4. `ai_model_config` - AI model configuration

  ## Security
  - Enable RLS on all tables
  - Users can only access their own conversations and messages
  - Admins can manage prompt templates and model config
*/

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text,
  context_type text NOT NULL,
  context_id uuid,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  last_message_at timestamptz
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  context_type text,
  context_id uuid,
  tokens_used int,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_prompt_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text NOT NULL,
  template text NOT NULL,
  context_type text NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS ai_model_config (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_name text NOT NULL,
  temperature numeric(3, 2) DEFAULT 0.7 NOT NULL,
  max_tokens int DEFAULT 1000 NOT NULL,
  top_p numeric(3, 2) DEFAULT 1.0 NOT NULL,
  frequency_penalty numeric(3, 2) DEFAULT 0.0 NOT NULL,
  presence_penalty numeric(3, 2) DEFAULT 0.0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read prompt templates"
  ON ai_prompt_templates FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'role' IN ('admin', 'super_admin'));

CREATE POLICY "Admins can manage prompt templates"
  ON ai_prompt_templates FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' IN ('admin', 'super_admin'))
  WITH CHECK (auth.jwt()->>'role' IN ('admin', 'super_admin'));

CREATE POLICY "Admins can read model config"
  ON ai_model_config FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'role' IN ('admin', 'super_admin'));

CREATE POLICY "Admins can manage model config"
  ON ai_model_config FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' IN ('admin', 'super_admin'))
  WITH CHECK (auth.jwt()->>'role' IN ('admin', 'super_admin'));

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_templates_active ON ai_prompt_templates(is_active);
