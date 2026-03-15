# MindFuel AI - Sample Database Queries

## Table of Contents
1. [User & Auth Queries](#user--auth-queries)
2. [Content & Books Queries](#content--books-queries)
3. [AI & RAG Queries](#ai--rag-queries)
4. [Library & Progress Queries](#library--progress-queries)
5. [Commerce Queries](#commerce-queries)
6. [Analytics Queries](#analytics-queries)

---

## User & Auth Queries

### Get User with Profile and Preferences
```sql
SELECT
  u.*,
  up.*,
  upr.*,
  us.*
FROM users u
LEFT JOIN user_profiles up ON up.user_id = u.id
LEFT JOIN user_preferences upr ON upr.user_id = u.id
LEFT JOIN user_streaks us ON us.user_id = u.id
WHERE u.id = $1;
```

### Get User Roles and Permissions
```sql
SELECT
  u.id,
  u.email,
  u.full_name,
  r.name as role_name,
  array_agg(DISTINCT p.name) as permissions
FROM users u
JOIN user_roles ur ON ur.user_id = u.id
JOIN roles r ON r.id = ur.role_id
LEFT JOIN role_permissions rp ON rp.role_id = r.id
LEFT JOIN permissions p ON p.id = rp.permission_id
WHERE u.id = $1
GROUP BY u.id, u.email, u.full_name, r.name;
```

### Update User Streak
```sql
INSERT INTO user_streaks (user_id, current_streak, longest_streak, total_active_days, last_activity_date)
VALUES ($1, 1, 1, 1, CURRENT_DATE)
ON CONFLICT (user_id) DO UPDATE SET
  current_streak = CASE
    WHEN user_streaks.last_activity_date = CURRENT_DATE - INTERVAL '1 day'
    THEN user_streaks.current_streak + 1
    WHEN user_streaks.last_activity_date = CURRENT_DATE
    THEN user_streaks.current_streak
    ELSE 1
  END,
  longest_streak = GREATEST(user_streaks.longest_streak, user_streaks.current_streak + 1),
  total_active_days = user_streaks.total_active_days + 1,
  last_activity_date = CURRENT_DATE,
  updated_at = NOW();
```

---

## Content & Books Queries

### Get Book with Chapters and Progress
```sql
SELECT
  b.*,
  json_agg(
    json_build_object(
      'id', bc.id,
      'chapter_number', bc.chapter_number,
      'title', bc.title,
      'description', bc.description,
      'estimated_reading_time_minutes', bc.estimated_reading_time_minutes
    ) ORDER BY bc.chapter_number
  ) as chapters,
  ul.progress_percentage,
  ul.is_completed
FROM books b
LEFT JOIN book_chapters bc ON bc.book_id = b.id AND bc.status = 'active'
LEFT JOIN user_library ul ON ul.book_id = b.id AND ul.user_id = $2
WHERE b.id = $1 AND b.status = 'active'
GROUP BY b.id, ul.progress_percentage, ul.is_completed;
```

### Get Chapter with Sections
```sql
SELECT
  bc.*,
  b.title as book_title,
  json_agg(
    json_build_object(
      'id', bs.id,
      'section_number', bs.section_number,
      'title', bs.title,
      'content', bs.content,
      'page_number', bs.page_number
    ) ORDER BY bs.section_number
  ) as sections
FROM book_chapters bc
JOIN books b ON b.id = bc.book_id
LEFT JOIN book_sections bs ON bs.chapter_id = bc.id AND bs.status = 'active'
WHERE bc.id = $1 AND bc.status = 'active'
GROUP BY bc.id, b.title;
```

### Search Books by Title or Author
```sql
SELECT
  b.*,
  similarity(b.title, $1) + similarity(b.author, $1) as relevance
FROM books b
WHERE b.status = 'active'
  AND (b.title ILIKE '%' || $1 || '%' OR b.author ILIKE '%' || $1 || '%')
ORDER BY relevance DESC, b.average_rating DESC
LIMIT 20;
```

### Get Featured Books with Tags
```sql
SELECT
  b.*,
  array_agg(DISTINCT bt.name) as tags
FROM books b
LEFT JOIN book_tag_mapping btm ON btm.book_id = b.id
LEFT JOIN book_tags bt ON bt.id = btm.tag_id
WHERE b.status = 'active' AND b.is_featured = true
GROUP BY b.id
ORDER BY b.total_reads DESC
LIMIT 10;
```

---

## AI & RAG Queries

### Semantic Search for Book Content
```sql
-- Step 1: Generate embedding for user query (done in application)
-- Step 2: Search similar content
SELECT
  cc.id,
  cc.chunk_text,
  cc.chunk_index,
  cc.metadata,
  bc.title as chapter_title,
  bc.chapter_number,
  b.title as book_title,
  1 - (cc.embedding <=> $1::vector) as similarity
FROM content_chunks cc
JOIN books b ON b.id = cc.book_id
LEFT JOIN book_chapters bc ON bc.id = cc.chapter_id
WHERE b.status = 'active'
  AND ($2::uuid IS NULL OR cc.book_id = $2)
ORDER BY cc.embedding <=> $1::vector
LIMIT $3;
```

### Hybrid Search (Semantic + Keyword)
```sql
WITH semantic_results AS (
  SELECT
    cc.id,
    cc.chunk_text,
    cc.book_id,
    cc.chapter_id,
    1 - (cc.embedding <=> $1::vector) as semantic_score
  FROM content_chunks cc
  WHERE cc.book_id = $2
  ORDER BY cc.embedding <=> $1::vector
  LIMIT 20
),
keyword_results AS (
  SELECT
    cc.id,
    cc.chunk_text,
    cc.book_id,
    cc.chapter_id,
    ts_rank(to_tsvector('english', cc.chunk_text), plainto_tsquery('english', $3)) as keyword_score
  FROM content_chunks cc
  WHERE cc.book_id = $2
    AND to_tsvector('english', cc.chunk_text) @@ plainto_tsquery('english', $3)
  LIMIT 20
)
SELECT DISTINCT
  COALESCE(sr.id, kr.id) as id,
  COALESCE(sr.chunk_text, kr.chunk_text) as chunk_text,
  COALESCE(sr.semantic_score, 0) * 0.7 + COALESCE(kr.keyword_score, 0) * 0.3 as combined_score,
  bc.title as chapter_title,
  b.title as book_title
FROM semantic_results sr
FULL OUTER JOIN keyword_results kr ON sr.id = kr.id
JOIN books b ON b.id = COALESCE(sr.book_id, kr.book_id)
LEFT JOIN book_chapters bc ON bc.id = COALESCE(sr.chapter_id, kr.chapter_id)
ORDER BY combined_score DESC
LIMIT 10;
```

### Get Conversation History with Context
```sql
SELECT
  cm.*,
  c.context_type,
  c.context_id,
  CASE
    WHEN c.context_type = 'book' THEN b.title
    WHEN c.context_type = 'chapter' THEN bc.title
    ELSE NULL
  END as context_name
FROM chat_messages cm
JOIN conversations c ON c.id = cm.conversation_id
LEFT JOIN books b ON b.id = c.context_id AND c.context_type = 'book'
LEFT JOIN book_chapters bc ON bc.id = c.context_id AND c.context_type = 'chapter'
WHERE cm.conversation_id = $1
ORDER BY cm.created_at ASC;
```

### Log AI Usage
```sql
INSERT INTO ai_usage_logs (
  user_id, conversation_id, model_used,
  prompt_tokens, completion_tokens, total_tokens,
  estimated_cost_usd, response_time_ms, success
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
```

---

## Library & Progress Queries

### Get User Library with Progress
```sql
SELECT
  b.*,
  ul.progress_percentage,
  ul.is_completed,
  ul.is_favorite,
  ul.last_read_at,
  ul.total_reading_time_minutes,
  bc.title as current_chapter_title,
  (
    SELECT COUNT(*)
    FROM book_chapters
    WHERE book_id = b.id AND status = 'active'
  ) as total_chapters,
  (
    SELECT COUNT(*)
    FROM reading_progress rp
    WHERE rp.user_id = ul.user_id
      AND rp.book_id = b.id
      AND rp.is_completed = true
  ) as completed_chapters
FROM user_library ul
JOIN books b ON b.id = ul.book_id
LEFT JOIN book_chapters bc ON bc.id = ul.current_chapter_id
WHERE ul.user_id = $1
ORDER BY ul.last_read_at DESC NULLS LAST;
```

### Update Reading Progress
```sql
-- Update or insert reading progress
INSERT INTO reading_progress (
  user_id, book_id, chapter_id, section_id,
  page_number, scroll_position, is_completed, reading_time_minutes
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
ON CONFLICT (user_id, book_id, chapter_id, section_id) DO UPDATE SET
  page_number = EXCLUDED.page_number,
  scroll_position = EXCLUDED.scroll_position,
  is_completed = EXCLUDED.is_completed,
  reading_time_minutes = reading_progress.reading_time_minutes + EXCLUDED.reading_time_minutes,
  last_read_at = NOW(),
  updated_at = NOW();

-- Update user library summary
UPDATE user_library SET
  current_chapter_id = $3,
  current_section_id = $4,
  last_read_at = NOW(),
  total_reading_time_minutes = total_reading_time_minutes + $8,
  progress_percentage = (
    SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE is_completed = true) / COUNT(*))
    FROM reading_progress
    WHERE user_id = $1 AND book_id = $2
  ),
  updated_at = NOW()
WHERE user_id = $1 AND book_id = $2;
```

### Get User Highlights and Bookmarks
```sql
SELECT
  h.id,
  h.highlighted_text,
  h.note,
  h.color,
  h.created_at,
  'highlight' as type,
  bc.title as chapter_title,
  b.title as book_title
FROM highlights h
JOIN books b ON b.id = h.book_id
LEFT JOIN book_chapters bc ON bc.id = h.chapter_id
WHERE h.user_id = $1
UNION ALL
SELECT
  bm.id,
  bm.title as highlighted_text,
  bm.note,
  bm.color,
  bm.created_at,
  'bookmark' as type,
  bc.title as chapter_title,
  b.title as book_title
FROM bookmarks bm
JOIN books b ON b.id = bm.book_id
LEFT JOIN book_chapters bc ON bc.id = bm.chapter_id
WHERE bm.user_id = $1
ORDER BY created_at DESC;
```

---

## Commerce Queries

### Get Product Catalog
```sql
SELECT
  p.*,
  pc.name as category_name,
  b.title as book_title,
  b.author as book_author,
  array_agg(pi.image_url) as images
FROM products p
LEFT JOIN product_categories pc ON pc.id = p.category_id
LEFT JOIN books b ON b.id = p.book_id
LEFT JOIN product_images pi ON pi.product_id = p.id
WHERE p.status = 'active'
GROUP BY p.id, pc.name, b.title, b.author
ORDER BY p.is_featured DESC, p.created_at DESC;
```

### Get Active Cart for User
```sql
SELECT
  c.*,
  json_agg(
    json_build_object(
      'id', ci.id,
      'product_id', ci.product_id,
      'product_name', p.name,
      'product_type', p.product_type,
      'quantity', ci.quantity,
      'unit_price', ci.unit_price,
      'total_price', ci.total_price
    )
  ) as items
FROM carts c
LEFT JOIN cart_items ci ON ci.cart_id = c.id
LEFT JOIN products p ON p.id = ci.product_id
WHERE c.user_id = $1 AND c.status = 'active'
GROUP BY c.id;
```

### Create Order from Cart
```sql
-- Step 1: Create order
INSERT INTO orders (
  order_number, user_id, subtotal_amount, discount_amount,
  total_amount, currency, status, payment_status
)
VALUES ($1, $2, $3, $4, $5, 'INR', 'pending', 'pending')
RETURNING id;

-- Step 2: Insert order items from cart
INSERT INTO order_items (
  order_id, product_id, product_name, product_type,
  quantity, unit_price, total_price
)
SELECT
  $1, -- order_id
  ci.product_id,
  p.name,
  p.product_type,
  ci.quantity,
  ci.unit_price,
  ci.total_price
FROM cart_items ci
JOIN products p ON p.id = ci.product_id
WHERE ci.cart_id = $2;

-- Step 3: Mark cart as converted
UPDATE carts SET status = 'converted' WHERE id = $2;
```

### Grant Entitlements After Payment
```sql
INSERT INTO entitlements (
  user_id, product_id, order_id, book_id,
  entitlement_type, status, granted_at
)
SELECT
  o.user_id,
  oi.product_id,
  o.id,
  p.book_id,
  CASE
    WHEN p.product_type = 'book' THEN 'permanent'
    WHEN p.product_type = 'subscription' THEN 'subscription'
    ELSE 'permanent'
  END,
  'active',
  NOW()
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.id = $1
  AND p.book_id IS NOT NULL
ON CONFLICT (user_id, product_id, book_id) DO NOTHING;

-- Also add to user library
INSERT INTO user_library (user_id, book_id, access_type)
SELECT
  o.user_id,
  p.book_id,
  'purchased'
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.id = $1
  AND p.book_id IS NOT NULL
ON CONFLICT (user_id, book_id) DO NOTHING;
```

---

## Analytics Queries

### Daily Active Users (DAU)
```sql
SELECT
  date_trunc('day', created_at) as date,
  COUNT(DISTINCT user_id) as active_users
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND event_category = 'engagement'
GROUP BY date
ORDER BY date DESC;
```

### User Retention Cohort
```sql
WITH user_cohorts AS (
  SELECT
    user_id,
    date_trunc('week', created_at) as cohort_week
  FROM users
),
user_activity AS (
  SELECT
    user_id,
    date_trunc('week', created_at) as activity_week
  FROM analytics_events
  WHERE event_name = 'session_start'
)
SELECT
  uc.cohort_week,
  COUNT(DISTINCT uc.user_id) as cohort_size,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN ua.activity_week = uc.cohort_week + INTERVAL '1 week' THEN ua.user_id END) / COUNT(DISTINCT uc.user_id), 2) as week_1_retention,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN ua.activity_week = uc.cohort_week + INTERVAL '2 weeks' THEN ua.user_id END) / COUNT(DISTINCT uc.user_id), 2) as week_2_retention,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN ua.activity_week = uc.cohort_week + INTERVAL '4 weeks' THEN ua.user_id END) / COUNT(DISTINCT uc.user_id), 2) as week_4_retention
FROM user_cohorts uc
LEFT JOIN user_activity ua ON ua.user_id = uc.user_id
WHERE uc.cohort_week >= NOW() - INTERVAL '12 weeks'
GROUP BY uc.cohort_week
ORDER BY uc.cohort_week DESC;
```

### Revenue Metrics
```sql
SELECT
  COUNT(*) as total_orders,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as avg_order_value,
  COUNT(DISTINCT user_id) as unique_customers,
  SUM(total_amount) / COUNT(DISTINCT user_id) as revenue_per_customer
FROM orders
WHERE payment_status = 'paid'
  AND created_at >= NOW() - INTERVAL '30 days';
```

### Top Selling Products
```sql
SELECT
  p.id,
  p.name,
  p.product_type,
  COUNT(DISTINCT oi.order_id) as orders_count,
  SUM(oi.quantity) as units_sold,
  SUM(oi.total_price) as total_revenue
FROM products p
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
WHERE o.payment_status = 'paid'
  AND o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY p.id, p.name, p.product_type
ORDER BY total_revenue DESC
LIMIT 10;
```

### User Engagement Funnel
```sql
WITH funnel_steps AS (
  SELECT
    COUNT(DISTINCT CASE WHEN event_name = 'app_open' THEN user_id END) as opened_app,
    COUNT(DISTINCT CASE WHEN event_name = 'book_viewed' THEN user_id END) as viewed_book,
    COUNT(DISTINCT CASE WHEN event_name = 'reading_started' THEN user_id END) as started_reading,
    COUNT(DISTINCT CASE WHEN event_name = 'ai_chat_opened' THEN user_id END) as opened_ai_chat,
    COUNT(DISTINCT CASE WHEN event_name = 'purchase_completed' THEN user_id END) as made_purchase
  FROM analytics_events
  WHERE created_at >= NOW() - INTERVAL '7 days'
)
SELECT
  'App Opened' as step, opened_app as users, 100.0 as conversion_rate FROM funnel_steps
UNION ALL
SELECT
  'Book Viewed', viewed_book, ROUND(100.0 * viewed_book / opened_app, 2) FROM funnel_steps
UNION ALL
SELECT
  'Reading Started', started_reading, ROUND(100.0 * started_reading / opened_app, 2) FROM funnel_steps
UNION ALL
SELECT
  'AI Chat Opened', opened_ai_chat, ROUND(100.0 * opened_ai_chat / opened_app, 2) FROM funnel_steps
UNION ALL
SELECT
  'Purchase Made', made_purchase, ROUND(100.0 * made_purchase / opened_app, 2) FROM funnel_steps;
```

### AI Usage Statistics
```sql
SELECT
  model_used,
  COUNT(*) as total_requests,
  SUM(total_tokens) as total_tokens,
  AVG(response_time_ms) as avg_response_time_ms,
  SUM(estimated_cost_usd) as total_cost_usd,
  ROUND(100.0 * SUM(CASE WHEN success THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM ai_usage_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY model_used;
```

---

## Maintenance Queries

### Find Missing Indexes
```sql
SELECT
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
  AND correlation < 0.1
ORDER BY n_distinct DESC;
```

### Table Size Report
```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;
```

### Unused Indexes
```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```
