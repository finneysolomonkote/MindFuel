#!/bin/bash

# This script creates all remaining database migration files for MindFuel AI

cd backendMindfuelAi/database/migrations

# 003 - Taxonomy
cat > 003_create_taxonomy.sql << 'EOF'
/*
  # Create Taxonomy System

  1. New Tables
    - `categories` - Main content categories
    - `subcategories` - Sub-categories within categories
    - `tags` - Flexible tagging system
    - `workbook_categories` - Many-to-many mapping
    - `workbook_subcategories` - Many-to-many mapping
    - `workbook_tags` - Many-to-many mapping
    - `book_categories`, `book_subcategories`, `book_tags` - Book mappings
    - `product_categories`, `product_tags` - Product mappings

  2. Security
    - Public read access for browsing
    - Authenticated users can manage their content mappings
    - Admin only for creating/updating taxonomy
*/

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#4A90E2',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, name)
);

CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  type TEXT DEFAULT 'general' CHECK (type IN ('general', 'skill', 'difficulty', 'topic')),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workbook_categories (
  workbook_id UUID NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (workbook_id, category_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workbook_subcategories (
  workbook_id UUID NOT NULL,
  subcategory_id UUID NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
  PRIMARY KEY (workbook_id, subcategory_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workbook_tags (
  workbook_id UUID NOT NULL,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (workbook_id, tag_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS book_categories (
  book_id UUID NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, category_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS book_subcategories (
  book_id UUID NOT NULL,
  subcategory_id UUID NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, subcategory_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS book_tags (
  book_id UUID NOT NULL,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, tag_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_categories (
  product_id UUID NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_tags (
  product_id UUID NOT NULL,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX idx_subcategories_slug ON subcategories(slug);
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_type ON tags(type);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE workbook_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE workbook_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE workbook_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view subcategories" ON subcategories FOR SELECT USING (true);
CREATE POLICY "Anyone can view tags" ON tags FOR SELECT USING (true);

-- Authenticated users can view mappings
CREATE POLICY "Authenticated users can view workbook categories" ON workbook_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view workbook subcategories" ON workbook_subcategories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view workbook tags" ON workbook_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view book categories" ON book_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view book subcategories" ON book_subcategories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view book tags" ON book_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view product categories" ON product_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view product tags" ON product_tags FOR SELECT TO authenticated USING (true);
EOF

echo "Created 003_create_taxonomy.sql"
