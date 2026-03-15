/*
  # MindFuel AI Seed Data

  Comprehensive seed data for local development and testing.

  ## Includes:
  - Admin and test users
  - Roles and permissions
  - Sample books with chapters and sections
  - Content chunks with embeddings placeholders
  - Products and pricing
  - Daily quotes
  - AI prompt templates
  - Feature flags
*/

-- ============================================
-- USERS
-- ============================================

-- Insert admin user
INSERT INTO users (id, email, password_hash, full_name, phone_number, role, status, profile_image_url)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@mindfuel.ai', '$2a$10$rqKJZW8S5YhJM2pTZQ5LPuwVnYWFzW8YvN6qj8cHxVkK3VxGqJjWa', 'Admin User', '+919876543210', 'admin', 'active', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'),
  ('22222222-2222-2222-2222-222222222222', 'user@example.com', '$2a$10$rqKJZW8S5YhJM2pTZQ5LPuwVnYWFzW8YvN6qj8cHxVkK3VxGqJjWa', 'Test User', '+919876543211', 'user', 'active', 'https://api.dicebear.com/7.x/avataaars/svg?seed=test')
ON CONFLICT (id) DO NOTHING;

-- Insert roles
INSERT INTO roles (id, name, description, is_system)
VALUES
  ('r1111111-1111-1111-1111-111111111111', 'super_admin', 'Super Administrator with full access', true),
  ('r2222222-2222-2222-2222-222222222222', 'admin', 'Administrator with management access', true),
  ('r3333333-3333-3333-3333-333333333333', 'user', 'Regular user', true),
  ('r4444444-4444-4444-4444-444444444444', 'coach', 'AI Coach', true)
ON CONFLICT (name) DO NOTHING;

-- Insert user profiles
INSERT INTO user_profiles (user_id, bio, interests, timezone, language)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Platform administrator', ARRAY['coaching', 'personal development'], 'Asia/Kolkata', 'en'),
  ('22222222-2222-2222-2222-222222222222', 'Personal growth enthusiast', ARRAY['mindfulness', 'productivity', 'self-help'], 'Asia/Kolkata', 'en')
ON CONFLICT (user_id) DO NOTHING;

-- Insert user preferences
INSERT INTO user_preferences (user_id, daily_reminder_enabled, daily_reminder_time, reading_goal_minutes_per_day)
VALUES
  ('11111111-1111-1111-1111-111111111111', true, '09:00:00', 30),
  ('22222222-2222-2222-2222-222222222222', true, '08:00:00', 15)
ON CONFLICT (user_id) DO NOTHING;

-- Insert user streaks
INSERT INTO user_streaks (user_id, current_streak, longest_streak, total_active_days, last_activity_date)
VALUES
  ('22222222-2222-2222-2222-222222222222', 7, 12, 45, CURRENT_DATE)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- BOOKS AND CONTENT
-- ============================================

-- Insert book tags
INSERT INTO book_tags (id, name, slug, color)
VALUES
  ('t1111111-1111-1111-1111-111111111111', 'Self-Help', 'self-help', '#3b82f6'),
  ('t2222222-2222-2222-2222-222222222222', 'Productivity', 'productivity', '#10b981'),
  ('t3333333-3333-3333-3333-333333333333', 'Mindfulness', 'mindfulness', '#8b5cf6'),
  ('t4444444-4444-4444-4444-444444444444', 'Leadership', 'leadership', '#f59e0b')
ON CONFLICT (slug) DO NOTHING;

-- Insert books
INSERT INTO books (id, title, subtitle, description, author, cover_image_url, category, subcategory, is_free, is_featured, total_chapters, estimated_reading_time_minutes, status, published_at, created_by)
VALUES
  ('b1111111-1111-1111-1111-111111111111',
   'Atomic Habits',
   'An Easy & Proven Way to Build Good Habits & Break Bad Ones',
   'No matter your goals, Atomic Habits offers a proven framework for improving every day. James Clear, one of the world''s leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.',
   'James Clear',
   'https://images.pexels.com/photos/1261427/pexels-photo-1261427.jpeg',
   'Personal Development',
   'Habits',
   false,
   true,
   20,
   240,
   'active',
   NOW(),
   '11111111-1111-1111-1111-111111111111'),

  ('b2222222-2222-2222-2222-222222222222',
   'Deep Work',
   'Rules for Focused Success in a Distracted World',
   'Deep work is the ability to focus without distraction on a cognitively demanding task. It''s a skill that allows you to quickly master complicated information and produce better results in less time. Deep Work will make you better at what you do and provide the sense of true fulfillment that comes from craftsmanship.',
   'Cal Newport',
   'https://images.pexels.com/photos/207662/pexels-photo-207662.jpeg',
   'Productivity',
   'Focus',
   false,
   true,
   18,
   220,
   'active',
   NOW(),
   '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- Insert book chapters for Atomic Habits
INSERT INTO book_chapters (id, book_id, chapter_number, title, description, summary, key_takeaways, estimated_reading_time_minutes, status)
VALUES
  ('c1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 1,
   'The Surprising Power of Atomic Habits',
   'Why tiny changes make a big difference',
   'Small habits compound over time. A 1% improvement daily leads to 37x better results in a year.',
   ARRAY['Habits are the compound interest of self-improvement', 'Small changes appear to make no difference until you cross a critical threshold', 'The most powerful outcomes are delayed'],
   12, 'active'),

  ('c2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 2,
   'How Your Habits Shape Your Identity',
   'Understanding the feedback loop between habits and identity',
   'The ultimate form of intrinsic motivation is when a habit becomes part of your identity.',
   ARRAY['Behavior that is incongruent with the self will not last', 'Decide who you want to be, then prove it with small wins', 'Identity change is the North Star of habit change'],
   10, 'active'),

  ('c3333333-3333-3333-3333-333333333333', 'b2222222-2222-2222-2222-222222222222', 1,
   'Deep Work is Valuable',
   'Why deep work matters in the modern economy',
   'In an increasingly competitive knowledge economy, the ability to perform deep work is becoming both rarer and more valuable.',
   ARRAY['Deep work is the superpower of the 21st century', 'The ability to quickly master hard things is crucial', 'Deep work produces elite-level results'],
   15, 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert book sections
INSERT INTO book_sections (id, chapter_id, section_number, title, content, page_number, status)
VALUES
  ('s1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 1,
   'Introduction to Habit Formation',
   'Habits are the invisible architecture of daily life. They are repeated behaviors that happen automatically. Understanding how habits work is the first step to improving them. The aggregation of marginal gains is the philosophy of searching for tiny improvements in everything you do. If you get 1% better each day, you will end up with results that are nearly 37 times better after one year.',
   1, 'active'),

  ('s2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 2,
   'The Plateau of Latent Potential',
   'We often expect progress to be linear. We think we should make steady gains in performance. In reality, the results of our efforts are often delayed. All big things come from small beginnings. The seed of every habit is a single, tiny decision. This is one of the core philosophies of this book: if you''re having trouble changing your habits, the problem isn''t you. The problem is your system.',
   3, 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert content chunks (for RAG)
INSERT INTO content_chunks (id, book_id, chapter_id, section_id, chunk_text, chunk_index, token_count, metadata)
VALUES
  ('ch111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111',
   'Habits are the compound interest of self-improvement. The same way that money multiplies through compound interest, the effects of your habits multiply as you repeat them. They seem to make little difference on any given day and yet the impact they deliver over the months and years can be enormous. It is only when looking back two, five, or perhaps ten years later that the value of good habits and the cost of bad ones becomes strikingly apparent.',
   1, 78,
   '{"topic": "compound_effect", "page": 1}'::jsonb),

  ('ch222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 's2222222-2222-2222-2222-222222222222',
   'We make a few changes, but the results never seem to come quickly and so we slide back into our previous routines. Unfortunately, the slow pace of transformation also makes it easy to let a bad habit slide. If you eat an unhealthy meal today, the scale doesn''t move much. If you work late tonight and ignore your family, they will forgive you. Success is the product of daily habits—not once-in-a-lifetime transformations.',
   2, 75,
   '{"topic": "daily_habits", "page": 3}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PRODUCTS AND COMMERCE
-- ============================================

-- Insert product categories
INSERT INTO product_categories (id, name, slug, description, display_order, is_active)
VALUES
  ('pc111111-1111-1111-1111-111111111111', 'E-Books', 'e-books', 'Digital books and workbooks', 1, true),
  ('pc222222-2222-2222-2222-222222222222', 'Subscriptions', 'subscriptions', 'Monthly and annual subscriptions', 2, true),
  ('pc333333-3333-3333-3333-333333333333', 'Courses', 'courses', 'Online coaching courses', 3, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert products
INSERT INTO products (id, name, description, product_type, category_id, price_inr, currency, is_active, is_featured, status, created_by)
VALUES
  ('p1111111-1111-1111-1111-111111111111',
   'Atomic Habits Digital Book',
   'Get instant access to the complete Atomic Habits book with interactive features, highlights, and AI coaching.',
   'physical',
   'pc111111-1111-1111-1111-111111111111',
   499.00,
   'INR',
   true,
   true,
   'active',
   '11111111-1111-1111-1111-111111111111'),

  ('p2222222-2222-2222-2222-222222222222',
   'MindFuel Premium Monthly',
   'Unlimited access to all books, AI coaching, and premium features.',
   'physical',
   'pc222222-2222-2222-2222-222222222222',
   299.00,
   'INR',
   true,
   true,
   'active',
   '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- DAILY QUOTES
-- ============================================

INSERT INTO daily_quotes (id, quote_text, author, category, book_id, status, display_date, created_by)
VALUES
  ('q1111111-1111-1111-1111-111111111111',
   'You do not rise to the level of your goals. You fall to the level of your systems.',
   'James Clear',
   'Habits',
   'b1111111-1111-1111-1111-111111111111',
   'active',
   CURRENT_DATE,
   '11111111-1111-1111-1111-111111111111'),

  ('q2222222-2222-2222-2222-222222222222',
   'The task of a craftsman is not to generate meaning, but rather to cultivate in himself the skill of discerning the meanings that are already there.',
   'Cal Newport',
   'Focus',
   'b2222222-2222-2222-2222-222222222222',
   'active',
   CURRENT_DATE + INTERVAL '1 day',
   '11111111-1111-1111-1111-111111111111'),

  ('q3333333-3333-3333-3333-333333333333',
   'Every action you take is a vote for the type of person you wish to become.',
   'James Clear',
   'Identity',
   'b1111111-1111-1111-1111-111111111111',
   'active',
   CURRENT_DATE + INTERVAL '2 days',
   '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- AI PROMPT TEMPLATES
-- ============================================

INSERT INTO ai_prompt_templates (id, name, slug, description, template, context_type, is_active, created_by)
VALUES
  ('pt111111-1111-1111-1111-111111111111',
   'General Coaching',
   'general-coaching',
   'Default prompt for general AI coaching conversations',
   'You are an AI life coach specializing in personal development, habits, and goal achievement. You draw wisdom from evidence-based psychology, behavioral science, and the principles found in self-help literature. Be supportive, insightful, and practical in your guidance. Ask thoughtful questions to understand the user''s situation better.',
   'general',
   true,
   '11111111-1111-1111-1111-111111111111'),

  ('pt222222-2222-2222-2222-222222222222',
   'Book-Based Coaching',
   'book-coaching',
   'Prompt for coaching based on specific book content',
   'You are an AI coach helping users apply insights from {{book_title}} by {{book_author}}. Reference specific concepts, frameworks, and principles from this book. Help users understand how to apply these teachings to their personal situation. Use relevant quotes and examples from the book when appropriate.',
   'book',
   true,
   '11111111-1111-1111-1111-111111111111'),

  ('pt333333-3333-3333-3333-333333333333',
   'Goal Setting Coach',
   'goal-setting',
   'Prompt for goal-setting and planning sessions',
   'You are an AI coach specializing in goal setting and achievement. Help users define clear, actionable goals using frameworks like SMART goals. Break down big goals into smaller steps. Identify potential obstacles and create strategies to overcome them. Be encouraging and help users maintain motivation.',
   'goal',
   true,
   '11111111-1111-1111-1111-111111111111')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- AI MODEL CONFIG
-- ============================================

INSERT INTO ai_model_config (id, model_name, temperature, max_tokens, top_p, is_active)
VALUES
  ('mc111111-1111-1111-1111-111111111111', 'gpt-4-turbo-preview', 0.7, 1000, 1.0, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- FEATURE FLAGS
-- ============================================

INSERT INTO feature_flags (id, name, slug, description, is_enabled, rollout_percentage)
VALUES
  ('ff111111-1111-1111-1111-111111111111', 'AI Chat', 'ai-chat', 'Enable AI coaching chat feature', true, 100),
  ('ff222222-2222-2222-2222-222222222222', 'Voice Notes', 'voice-notes', 'Enable voice note journaling', false, 0),
  ('ff333333-3333-3333-3333-333333333333', 'Social Sharing', 'social-sharing', 'Enable sharing highlights and quotes', true, 50)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- GUIDED PRACTICES
-- ============================================

INSERT INTO guided_practices (id, title, description, category, difficulty, estimated_time_minutes, book_id, is_active, created_by)
VALUES
  ('gp111111-1111-1111-1111-111111111111',
   'Habit Tracker Setup',
   'Learn how to set up an effective habit tracking system based on Atomic Habits principles.',
   'Habits',
   'beginner',
   15,
   'b1111111-1111-1111-1111-111111111111',
   true,
   '11111111-1111-1111-1111-111111111111'),

  ('gp222222-2222-2222-2222-222222222222',
   'Morning Routine Design',
   'Design a powerful morning routine that sets you up for success.',
   'Productivity',
   'beginner',
   20,
   NULL,
   true,
   '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- Insert practice steps
INSERT INTO practice_steps (id, practice_id, step_number, step_type, title, content, question_type, is_required)
VALUES
  ('ps111111-1111-1111-1111-111111111111', 'gp111111-1111-1111-1111-111111111111', 1, 'instruction',
   'Welcome to Habit Tracking',
   'In this practice, you''ll learn to create a habit tracking system that works. James Clear emphasizes that tracking is crucial for habit formation.',
   NULL, false),

  ('ps222222-2222-2222-2222-222222222222', 'gp111111-1111-1111-1111-111111111111', 2, 'question',
   'Choose Your Habit',
   'What is one small habit you want to build? Remember, start with something that takes less than 2 minutes to do.',
   'text', true),

  ('ps333333-3333-3333-3333-333333333333', 'gp111111-1111-1111-1111-111111111111', 3, 'reflection',
   'Reflect on Your Why',
   'Why is this habit important to you? How will it improve your life?',
   'text', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- JOURNAL PROMPTS
-- ============================================

INSERT INTO journal_prompts (id, prompt_text, category, difficulty, is_active, display_date, created_by)
VALUES
  ('jp111111-1111-1111-1111-111111111111',
   'What is one small habit you started today that you''d like to continue?',
   'Habits',
   'beginner',
   true,
   CURRENT_DATE,
   '11111111-1111-1111-1111-111111111111'),

  ('jp222222-2222-2222-2222-222222222222',
   'Describe a moment today when you felt fully present and focused.',
   'Mindfulness',
   'beginner',
   true,
   CURRENT_DATE + INTERVAL '1 day',
   '11111111-1111-1111-1111-111111111111'),

  ('jp333333-3333-3333-3333-333333333333',
   'What are you grateful for today? List at least three things.',
   'Gratitude',
   'beginner',
   true,
   CURRENT_DATE + INTERVAL '2 days',
   '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- USER LIBRARY (Test user has access to one book)
-- ============================================

INSERT INTO user_library (id, user_id, book_id, access_type, progress_percentage, current_chapter_id, last_read_at)
VALUES
  ('ul111111-1111-1111-1111-111111111111',
   '22222222-2222-2222-2222-222222222222',
   'b1111111-1111-1111-1111-111111111111',
   'purchased',
   15,
   'c1111111-1111-1111-1111-111111111111',
   NOW() - INTERVAL '2 hours')
ON CONFLICT (user_id, book_id) DO NOTHING;

-- ============================================
-- SYSTEM SETTINGS
-- ============================================

INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public)
VALUES
  ('app_name', '"MindFuel AI"'::jsonb, 'string', 'Application name', true),
  ('app_version', '"1.0.0"'::jsonb, 'string', 'Current app version', true),
  ('maintenance_mode', 'false'::jsonb, 'boolean', 'Enable maintenance mode', false),
  ('max_free_books', '3'::jsonb, 'number', 'Maximum free books per user', false)
ON CONFLICT (setting_key) DO NOTHING;
