#!/bin/bash

# Generate all remaining migration files efficiently

cd database/migrations

# Array of migrations with their content
declare -A migrations

# 005 - Workbooks
cat > 005_create_workbooks.sql << 'EOF'
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
EOF

# 006 - Library
cat > 006_create_library.sql << 'EOF'
CREATE TABLE IF NOT EXISTS user_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'reading' CHECK (status IN ('reading', 'completed', 'paused')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  current_chapter_id UUID,
  last_read_at TIMESTAMPTZ,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

CREATE TABLE IF NOT EXISTS reading_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  chapter_id UUID,
  section_id UUID,
  progress_percentage INTEGER DEFAULT 0,
  last_position TEXT,
  time_spent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  chapter_id UUID,
  section_id UUID,
  position TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  chapter_id UUID,
  text TEXT NOT NULL,
  color TEXT DEFAULT '#FFEB3B',
  position TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reading_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  chapter_id UUID,
  title TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_library_user_id ON user_library(user_id);
CREATE INDEX idx_reading_progress_user_id ON reading_progress(user_id);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_highlights_user_id ON highlights(user_id);
CREATE INDEX idx_reading_notes_user_id ON reading_notes(user_id);

ALTER TABLE user_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own library" ON user_library FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own progress" ON reading_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own bookmarks" ON bookmarks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own highlights" ON highlights FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own notes" ON reading_notes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EOF

# 007 - Goals
cat > 007_create_goals.sql << 'EOF'
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'abandoned')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  target_date DATE,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS goal_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  order_index INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS goal_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  note TEXT,
  progress_percentage INTEGER,
  milestone_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goal_milestones_goal_id ON goal_milestones(goal_id);
CREATE INDEX idx_goal_progress_goal_id ON goal_progress(goal_id);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own goals" ON goals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage goal milestones" ON goal_milestones FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_milestones.goal_id AND goals.user_id = auth.uid()));
CREATE POLICY "Users can manage goal progress" ON goal_progress FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_progress.goal_id AND goals.user_id = auth.uid()));
EOF

# 008 - Journals
cat > 008_create_journals.sql << 'EOF'
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
EOF

# 009 - Products
cat > 009_create_products.sql << 'EOF'
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  category TEXT,
  subcategory TEXT,
  images TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value DECIMAL(10, 2) NOT NULL,
  description TEXT,
  min_purchase_amount DECIMAL(10, 2),
  max_discount DECIMAL(10, 2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_coupons_code ON coupons(code);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view products" ON products FOR SELECT TO authenticated USING (is_available = true);
CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can view coupons" ON coupons FOR SELECT TO authenticated USING (is_active = true);
EOF

# 010 - Orders
cat > 010_create_orders.sql << 'EOF'
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  shipping DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'pending_payment', 'processing', 'completed', 'cancelled', 'refunded')),
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_id TEXT,
  shipping_address JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders" ON orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
EOF

# 011 - Quotes
cat > 011_create_quotes.sql << 'EOF'
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
EOF

# 012 - Notifications
cat > 012_create_notifications.sql << 'EOF'
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS device_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_device_tokens_user_id ON device_tokens(user_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage own device tokens" ON device_tokens FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EOF

# 013 - AI Tables (Critical!)
cat > 013_create_ai_tables.sql << 'EOF'
/*
  # Create AI and RAG System Tables

  1. New Tables
    - `ai_conversations` - User AI chat conversations
    - `ai_messages` - Individual messages in conversations
    - `ai_prompts` - System prompt templates
    - `ai_models` - AI model configurations
    - `ai_usage_logs` - Token usage tracking
    - `content_embeddings` - Vector embeddings for RAG (1536 dimensions for OpenAI)
    - `content_chunks` - Chunked content for embedding

  2. Security
    - Users can only access own conversations
    - Admin can manage prompts and models
    - Service role for embeddings
*/

CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  context JSONB,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  citations JSONB,
  tokens_used INTEGER,
  model TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  template TEXT NOT NULL,
  description TEXT,
  variables JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'custom')),
  model_id TEXT NOT NULL,
  config JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE SET NULL,
  model TEXT NOT NULL,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  cost DECIMAL(10, 4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content embeddings for RAG system (1536 dimensions for OpenAI text-embedding-3-small)
CREATE TABLE IF NOT EXISTS content_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT NOT NULL CHECK (content_type IN ('book', 'workbook', 'chapter', 'section')),
  content_id UUID NOT NULL,
  chunk_index INTEGER NOT NULL,
  text_content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_type, content_id, chunk_index)
);

CREATE TABLE IF NOT EXISTS content_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT NOT NULL CHECK (content_type IN ('book', 'workbook', 'chapter', 'section')),
  content_id UUID NOT NULL,
  chunk_index INTEGER NOT NULL,
  text TEXT NOT NULL,
  token_count INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_type, content_id, chunk_index)
);

-- Practices table
CREATE TABLE IF NOT EXISTS practices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration INTEGER NOT NULL,
  image TEXT,
  audio_url TEXT,
  video_url TEXT,
  instructor_name TEXT,
  steps JSONB,
  is_premium BOOLEAN DEFAULT false,
  rating DECIMAL(3, 2) DEFAULT 0,
  completion_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS practice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  duration INTEGER,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX idx_content_embeddings_content ON content_embeddings(content_type, content_id);
CREATE INDEX idx_content_chunks_content ON content_chunks(content_type, content_id);
CREATE INDEX idx_practices_category ON practices(category);
CREATE INDEX idx_practice_sessions_user_id ON practice_sessions(user_id);

-- Vector similarity search index using HNSW (Hierarchical Navigable Small World)
CREATE INDEX idx_content_embeddings_vector ON content_embeddings 
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Enable RLS
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own conversations" ON ai_conversations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view messages in own conversations" ON ai_messages FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM ai_conversations WHERE ai_conversations.id = ai_messages.conversation_id AND ai_conversations.user_id = auth.uid()));
CREATE POLICY "Service role can manage embeddings" ON content_embeddings FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can view practices" ON practices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own practice sessions" ON practice_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Function for similarity search
CREATE OR REPLACE FUNCTION match_content(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  content_type TEXT,
  content_id UUID,
  text_content TEXT,
  similarity FLOAT,
  metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    content_embeddings.id,
    content_embeddings.content_type,
    content_embeddings.content_id,
    content_embeddings.text_content,
    1 - (content_embeddings.embedding <=> query_embedding) AS similarity,
    content_embeddings.metadata
  FROM content_embeddings
  WHERE 1 - (content_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY content_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
EOF

# 014 - Analytics
cat > 014_create_analytics.sql << 'EOF'
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  changes JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage analytics" ON analytics_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage audit logs" ON audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
EOF

# 015 - RLS Policies
cat > 015_rls_policies.sql << 'EOF'
/*
  # Additional RLS Policies and Security

  1. Admin Policies
    - Admins can manage all content
    - Super admins have full access

  2. Helper Functions
    - is_admin() - Check if user is admin
    - is_super_admin() - Check if user is super admin
*/

-- Helper functions
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies for books
CREATE POLICY "Admins can manage books" ON books FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage book chapters" ON book_chapters FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage book sections" ON book_sections FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Admin policies for workbooks
CREATE POLICY "Admins can manage workbooks" ON workbooks FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage workbook chapters" ON workbook_chapters FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage workbook sections" ON workbook_sections FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Admin policies for products
CREATE POLICY "Admins can manage products" ON products FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage coupons" ON coupons FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Admin policies for quotes
CREATE POLICY "Admins can manage quotes" ON quotes FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Admin policies for practices
CREATE POLICY "Admins can manage practices" ON practices FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Admin policies for taxonomy
CREATE POLICY "Admins can manage categories" ON categories FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage subcategories" ON subcategories FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage tags" ON tags FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Admin policies for AI
CREATE POLICY "Admins can manage AI prompts" ON ai_prompts FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage AI models" ON ai_models FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can view all usage logs" ON ai_usage_logs FOR SELECT TO authenticated USING (is_admin());

-- Admin can view all orders
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT TO authenticated USING (is_admin());

-- Admin can view all users
CREATE POLICY "Admins can view all users" ON users FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admins can update user roles" ON users FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
EOF

echo "All migrations created successfully!"
echo "Total migrations: 15"
ls -1 *.sql | wc -l
