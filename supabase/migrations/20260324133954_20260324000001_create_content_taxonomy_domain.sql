/*
  # Content Taxonomy & Classification Domain

  ## Overview
  Establishes a robust, scalable content classification system for the entire MindFuel AI platform.
  Replaces loose text fields (category/subcategory) with a proper relational taxonomy that supports
  multi-classification, reusability, ordering, and future multilingual expansion.

  ## 1. New Tables

  ### content_categories
  Main classification buckets (e.g., Mindset, Productivity, Leadership, Sales, Communication)
  - `id` (uuid, primary key)
  - `name` (text, unique) - Display name
  - `slug` (text, unique) - URL-friendly identifier
  - `description` (text, nullable)
  - `icon` (text, nullable) - Icon identifier for UI  
  - `color` (text, nullable) - Hex color for UI theming
  - `sort_order` (integer) - Admin-controlled display order
  - `is_active` (boolean) - Enable/disable categories
  - `metadata` (jsonb) - Flexible storage for future needs (i18n, SEO, etc.)
  - Timestamps

  ### content_subcategories
  Nested classification (e.g., Confidence, Focus, Negotiation, Public Speaking)
  - `id` (uuid, primary key)
  - `category_id` (uuid, foreign key to content_categories)
  - `name` (text)
  - `slug` (text, unique)
  - `description` (text, nullable)
  - `sort_order` (integer)
  - `is_active` (boolean)
  - `metadata` (jsonb)
  - Timestamps
  - Unique constraint on (category_id, name)

  ### content_tags
  Flexible labels for cross-cutting concerns (e.g., beginner, advanced, AI-enabled, habit-building)
  Note: Consolidates old book_tags into unified taxonomy
  - `id` (uuid, primary key)
  - `name` (text, unique)
  - `slug` (text, unique)
  - `type` (text) - Tag grouping: level, feature, theme, skill
  - `color` (text, nullable)
  - `is_active` (boolean)
  - `metadata` (jsonb)
  - Timestamps

  ### Mapping Tables (Many-to-Many)
  Enable content items to belong to multiple classifications:
  - `workbook_category_map` - Links workbooks to categories
  - `workbook_subcategory_map` - Links workbooks to subcategories
  - `workbook_content_tags` - Links workbooks to tags
  - `book_category_map` - Links library books to categories
  - `book_subcategory_map` - Links library books to subcategories
  - `book_content_tags` - Links library books to tags (replaces book_tag_mapping)
  - `product_category_map` - Links products to categories
  - `product_content_tags` - Links products to tags

  ## 2. Benefits
  - **Reusability**: Same taxonomy across all content types
  - **Consistency**: Unified classification for UX patterns
  - **Flexibility**: Multiple categories/tags per item
  - **Scalability**: Easy to add new categories without migration
  - **Personalization**: Enable recommendation engines
  - **Admin Control**: Sort order, activation, metadata
  - **Future-Ready**: Supports i18n, SEO, analytics segmentation

  ## 3. Mobile App UX Enhancements
  - Home screen category carousels
  - Subcategory filtering tabs
  - Tag-based search facets
  - Featured collections by category
  - Personalized recommendations
  - Progress tracking by category

  ## 4. Security
  - RLS policies restrict write access to admins only
  - Public read access for active categories/tags
  - User-specific access for personalized data

  ## 5. Migration Notes
  - Existing category/subcategory text fields remain temporarily for backward compatibility
  - Old book_tags table remains for backward compatibility
  - New unified content_tags table for all content types
  - Admin must populate new taxonomy tables
  - Future migration will backfill existing data and remove old text fields
*/

-- =====================================================
-- CONTENT CATEGORIES (Main Buckets)
-- =====================================================
CREATE TABLE IF NOT EXISTS content_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  color text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_categories_slug ON content_categories(slug);
CREATE INDEX IF NOT EXISTS idx_content_categories_active_sort ON content_categories(is_active, sort_order) WHERE is_active = true;

-- =====================================================
-- CONTENT SUBCATEGORIES (Nested Buckets)
-- =====================================================
CREATE TABLE IF NOT EXISTS content_subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES content_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(category_id, name)
);

CREATE INDEX IF NOT EXISTS idx_content_subcategories_category ON content_subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_content_subcategories_slug ON content_subcategories(slug);
CREATE INDEX IF NOT EXISTS idx_content_subcategories_active_sort ON content_subcategories(category_id, is_active, sort_order) WHERE is_active = true;

-- =====================================================
-- CONTENT TAGS (Flexible Labels - Unified System)
-- =====================================================
CREATE TABLE IF NOT EXISTS content_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  type text NOT NULL DEFAULT 'general',
  color text,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT content_tags_type_check CHECK (type IN ('level', 'feature', 'theme', 'skill', 'general'))
);

CREATE INDEX IF NOT EXISTS idx_content_tags_slug ON content_tags(slug);
CREATE INDEX IF NOT EXISTS idx_content_tags_type ON content_tags(type);
CREATE INDEX IF NOT EXISTS idx_content_tags_active ON content_tags(is_active) WHERE is_active = true;

-- =====================================================
-- WORKBOOK MAPPING TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS workbook_category_map (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workbook_id uuid NOT NULL REFERENCES workbooks(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES content_categories(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workbook_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_workbook_category_map_workbook ON workbook_category_map(workbook_id);
CREATE INDEX IF NOT EXISTS idx_workbook_category_map_category ON workbook_category_map(category_id);

CREATE TABLE IF NOT EXISTS workbook_subcategory_map (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workbook_id uuid NOT NULL REFERENCES workbooks(id) ON DELETE CASCADE,
  subcategory_id uuid NOT NULL REFERENCES content_subcategories(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workbook_id, subcategory_id)
);

CREATE INDEX IF NOT EXISTS idx_workbook_subcategory_map_workbook ON workbook_subcategory_map(workbook_id);
CREATE INDEX IF NOT EXISTS idx_workbook_subcategory_map_subcategory ON workbook_subcategory_map(subcategory_id);

CREATE TABLE IF NOT EXISTS workbook_content_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workbook_id uuid NOT NULL REFERENCES workbooks(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES content_tags(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workbook_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_workbook_content_tags_workbook ON workbook_content_tags(workbook_id);
CREATE INDEX IF NOT EXISTS idx_workbook_content_tags_tag ON workbook_content_tags(tag_id);

-- =====================================================
-- LIBRARY BOOKS MAPPING TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS book_category_map (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES content_categories(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(book_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_book_category_map_book ON book_category_map(book_id);
CREATE INDEX IF NOT EXISTS idx_book_category_map_category ON book_category_map(category_id);

CREATE TABLE IF NOT EXISTS book_subcategory_map (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  subcategory_id uuid NOT NULL REFERENCES content_subcategories(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(book_id, subcategory_id)
);

CREATE INDEX IF NOT EXISTS idx_book_subcategory_map_book ON book_subcategory_map(book_id);
CREATE INDEX IF NOT EXISTS idx_book_subcategory_map_subcategory ON book_subcategory_map(subcategory_id);

CREATE TABLE IF NOT EXISTS book_content_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES content_tags(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(book_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_book_content_tags_book ON book_content_tags(book_id);
CREATE INDEX IF NOT EXISTS idx_book_content_tags_tag ON book_content_tags(tag_id);

-- =====================================================
-- PRODUCT MAPPING TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS product_category_map (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES content_categories(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_product_category_map_product ON product_category_map(product_id);
CREATE INDEX IF NOT EXISTS idx_product_category_map_category ON product_category_map(category_id);

CREATE TABLE IF NOT EXISTS product_content_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES content_tags(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_product_content_tags_product ON product_content_tags(product_id);
CREATE INDEX IF NOT EXISTS idx_product_content_tags_tag ON product_content_tags(tag_id);

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_content_categories_updated_at ON content_categories;
CREATE TRIGGER update_content_categories_updated_at
  BEFORE UPDATE ON content_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_subcategories_updated_at ON content_subcategories;
CREATE TRIGGER update_content_subcategories_updated_at
  BEFORE UPDATE ON content_subcategories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_tags_updated_at ON content_tags;
CREATE TRIGGER update_content_tags_updated_at
  BEFORE UPDATE ON content_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = $1 AND r.name = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Content Categories
ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active categories"
  ON content_categories FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can view all categories"
  ON content_categories FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert categories"
  ON content_categories FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update categories"
  ON content_categories FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete categories"
  ON content_categories FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Content Subcategories
ALTER TABLE content_subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active subcategories"
  ON content_subcategories FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage subcategories"
  ON content_subcategories FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Content Tags
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active tags"
  ON content_tags FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage tags"
  ON content_tags FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Mapping tables: Public read for active content, admin write
ALTER TABLE workbook_category_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE workbook_subcategory_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE workbook_content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_category_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_subcategory_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_category_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_content_tags ENABLE ROW LEVEL SECURITY;

-- Public can view mappings for active content
CREATE POLICY "Public can view workbook category map" ON workbook_category_map FOR SELECT TO public USING (true);
CREATE POLICY "Public can view workbook subcategory map" ON workbook_subcategory_map FOR SELECT TO public USING (true);
CREATE POLICY "Public can view workbook content tags" ON workbook_content_tags FOR SELECT TO public USING (true);
CREATE POLICY "Public can view book category map" ON book_category_map FOR SELECT TO public USING (true);
CREATE POLICY "Public can view book subcategory map" ON book_subcategory_map FOR SELECT TO public USING (true);
CREATE POLICY "Public can view book content tags" ON book_content_tags FOR SELECT TO public USING (true);
CREATE POLICY "Public can view product category map" ON product_category_map FOR SELECT TO public USING (true);
CREATE POLICY "Public can view product content tags" ON product_content_tags FOR SELECT TO public USING (true);

-- Admins can manage all mappings
CREATE POLICY "Admins can manage workbook category map" ON workbook_category_map FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can manage workbook subcategory map" ON workbook_subcategory_map FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can manage workbook content tags" ON workbook_content_tags FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can manage book category map" ON book_category_map FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can manage book subcategory map" ON book_subcategory_map FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can manage book content tags" ON book_content_tags FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can manage product category map" ON product_category_map FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can manage product content tags" ON product_content_tags FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- =====================================================
-- SEED DATA: Initial Categories
-- =====================================================
INSERT INTO content_categories (name, slug, description, icon, color, sort_order)
VALUES
  ('Mindset', 'mindset', 'Mental frameworks and psychological growth', 'Brain', '#8B5CF6', 1),
  ('Productivity', 'productivity', 'Time management and efficiency techniques', 'Zap', '#3B82F6', 2),
  ('Communication', 'communication', 'Interpersonal skills and expression', 'MessageCircle', '#10B981', 3),
  ('Leadership', 'leadership', 'Team management and influence', 'Users', '#F59E0B', 4),
  ('Sales', 'sales', 'Persuasion and business development', 'TrendingUp', '#EF4444', 5),
  ('Wellness', 'wellness', 'Physical and mental health practices', 'Heart', '#EC4899', 6)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- SEED DATA: Initial Subcategories
-- =====================================================
INSERT INTO content_subcategories (category_id, name, slug, description, sort_order)
SELECT
  c.id,
  sub.name,
  sub.slug,
  sub.description,
  sub.sort_order
FROM content_categories c
CROSS JOIN LATERAL (
  VALUES
    ('Confidence', 'confidence', 'Self-assurance and belief', 1),
    ('Resilience', 'resilience', 'Bouncing back from setbacks', 2),
    ('Growth Mindset', 'growth-mindset', 'Embracing challenges and learning', 3)
) AS sub(name, slug, description, sort_order)
WHERE c.slug = 'mindset'
ON CONFLICT (category_id, name) DO NOTHING;

INSERT INTO content_subcategories (category_id, name, slug, description, sort_order)
SELECT
  c.id,
  sub.name,
  sub.slug,
  sub.description,
  sub.sort_order
FROM content_categories c
CROSS JOIN LATERAL (
  VALUES
    ('Focus', 'focus', 'Concentration and deep work', 1),
    ('Time Management', 'time-management', 'Organizing tasks and priorities', 2),
    ('Habits', 'habits', 'Building systems and routines', 3)
) AS sub(name, slug, description, sort_order)
WHERE c.slug = 'productivity'
ON CONFLICT (category_id, name) DO NOTHING;

INSERT INTO content_subcategories (category_id, name, slug, description, sort_order)
SELECT
  c.id,
  sub.name,
  sub.slug,
  sub.description,
  sub.sort_order
FROM content_categories c
CROSS JOIN LATERAL (
  VALUES
    ('Public Speaking', 'public-speaking', 'Presentations and speeches', 1),
    ('Negotiation', 'negotiation', 'Conflict resolution and deals', 2),
    ('Active Listening', 'active-listening', 'Understanding and empathy', 3)
) AS sub(name, slug, description, sort_order)
WHERE c.slug = 'communication'
ON CONFLICT (category_id, name) DO NOTHING;

-- =====================================================
-- SEED DATA: Initial Tags
-- =====================================================
INSERT INTO content_tags (name, slug, type, color)
VALUES
  ('Beginner', 'beginner', 'level', '#10B981'),
  ('Intermediate', 'intermediate', 'level', '#F59E0B'),
  ('Advanced', 'advanced', 'level', '#EF4444'),
  ('AI-Enabled', 'ai-enabled', 'feature', '#8B5CF6'),
  ('Habit-Building', 'habit-building', 'theme', '#3B82F6'),
  ('Quick Win', 'quick-win', 'theme', '#10B981'),
  ('Deep Work', 'deep-work', 'theme', '#6366F1'),
  ('Interactive', 'interactive', 'feature', '#EC4899'),
  ('Daily Practice', 'daily-practice', 'theme', '#F59E0B')
ON CONFLICT (slug) DO NOTHING;