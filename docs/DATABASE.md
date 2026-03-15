# MindFuel AI Database Architecture

## Overview

Complete PostgreSQL database schema with pgvector for semantic search, comprehensive domain models, and production-ready indexes and constraints.

## Technology Stack

- **Database**: PostgreSQL 15+
- **Vector Extension**: pgvector for semantic embeddings
- **Extensions**: uuid-ossp, pg_trgm for full-text search
- **ORM**: Direct Supabase client usage (can integrate Prisma/Drizzle if needed)

## Domain Models

### 1. Auth & User Domain

Core authentication and user management with RBAC.

#### Tables:
- **users** - Core user accounts (extends Supabase auth)
- **roles** - System roles (admin, user, coach)
- **permissions** - Granular permissions
- **user_roles** - User-role mapping (many-to-many)
- **role_permissions** - Role-permission mapping
- **user_sessions** - Active sessions with FCM tokens
- **refresh_tokens** - JWT refresh token management
- **user_profiles** - Extended profile data
- **user_preferences** - User settings
- **user_streaks** - Daily streak tracking
- **user_goals** - User goal management

#### Key Relationships:
```
users 1:N user_roles N:1 roles N:M permissions
users 1:1 user_profiles
users 1:1 user_preferences
users 1:1 user_streaks
users 1:N user_goals
```

---

### 2. Content Domain (Books & Workbooks)

Content management with pgvector support for RAG.

#### Tables:
- **books** - Main book/workbook content
- **book_chapters** - Chapters within books
- **book_sections** - Sections within chapters (pages)
- **book_tags** - Tags for categorization
- **book_tag_mapping** - Book-tag relationships
- **content_chunks** - Chunked content with embeddings (vector)
- **daily_quotes** - Daily motivational quotes

#### Key Relationships:
```
books 1:N book_chapters 1:N book_sections
books N:M book_tags (via book_tag_mapping)
books 1:N content_chunks
book_chapters 1:N content_chunks
book_sections 1:N content_chunks
```

#### pgvector Implementation:
- `content_chunks.embedding` - vector(1536) for OpenAI embeddings
- IVFFlat index for fast similarity search
- Metadata JSON for filtering (book_id, chapter_id, page, etc.)

---

### 3. AI Domain (Conversations & RAG)

Complete AI coaching system with conversation management.

#### Tables:
- **conversations** (existing) - User AI conversations
- **chat_messages** (existing) - Messages within conversations
- **ai_prompt_templates** - Admin-configurable prompts
- **ai_model_config** - Model settings (temp, tokens, etc.)
- **ai_usage_logs** - Token usage and cost tracking
- **ai_summaries** - Generated summaries for content
- **retrieval_logs** - RAG retrieval analytics

#### Key Relationships:
```
users 1:N conversations 1:N chat_messages
books/chapters N:1 ai_summaries
conversations 1:N retrieval_logs
```

#### RAG Implementation:
- Semantic search on `content_chunks` using cosine similarity
- Query embeddings stored in `retrieval_logs` for analytics
- Context filtering by book_id, chapter_id, section_id
- Top-K retrieval with metadata ranking

---

### 4. Library & Reading Progress

User library management and detailed progress tracking.

#### Tables:
- **user_library** - User's book library with entitlements
- **reading_progress** - Granular reading tracking
- **bookmarks** - User bookmarks
- **highlights** - Text highlights with notes
- **reading_notes** - Personal notes

#### Key Relationships:
```
users 1:N user_library N:1 books
users 1:N reading_progress
users 1:N bookmarks
users 1:N highlights
users 1:N reading_notes
```

#### Access Control:
- `user_library.access_type` - purchased, subscribed, free, trial
- Entitlements synced with orders via `entitlements` table

---

### 5. Practice & Journal Domain

Guided practices and journaling system.

#### Tables:
- **guided_practices** - Practice templates
- **practice_steps** - Steps within practices
- **user_practice_sessions** - Session tracking
- **user_practice_answers** - User answers
- **journal_entries** - User journal entries
- **journal_tags** - Journal categorization
- **journal_prompts** - Daily prompts

#### Key Relationships:
```
guided_practices 1:N practice_steps
users 1:N user_practice_sessions N:1 guided_practices
user_practice_sessions 1:N user_practice_answers
users 1:N journal_entries
journal_entries N:M journal_tags
```

---

### 6. Commerce & Orders Domain

Complete e-commerce with payments and entitlements.

#### Tables:
- **product_categories** - Product categorization
- **products** - Products (books, subscriptions, courses)
- **product_images** - Product image gallery
- **coupons** - Discount coupons
- **coupon_rules** - Coupon applicability
- **product_reviews** - User reviews
- **carts** - Shopping carts
- **cart_items** - Cart items
- **orders** - Customer orders
- **order_items** - Order line items
- **payments** - Payment transactions (Razorpay)
- **payment_events** - Payment webhooks
- **refunds** - Refund requests
- **entitlements** - Digital product access

#### Key Relationships:
```
products N:1 product_categories
products 1:N product_images
products 1:N product_reviews
users 1:N carts 1:N cart_items N:1 products
users 1:N orders 1:N order_items
orders 1:N payments 1:N payment_events
orders 1:N refunds
orders 1:N entitlements N:1 books
```

#### Payment Flow:
1. User adds products to cart
2. Cart converted to order
3. Razorpay order created
4. Payment processed
5. Webhook updates payment status
6. Entitlements granted on success

---

### 7. Notification & Media Domain

Push notifications and media asset management.

#### Tables:
- **push_tokens** - FCM device tokens
- **notifications_new** - User notifications
- **notification_templates** - Notification templates
- **notification_logs** - Delivery tracking
- **notification_campaigns** - Marketing campaigns
- **campaign_recipients** - Campaign tracking
- **media_assets** - S3 file metadata
- **upload_jobs** - Background uploads

#### Key Relationships:
```
users 1:N push_tokens
users 1:N notifications_new
notification_campaigns 1:N campaign_recipients N:1 users
users 1:N media_assets
users 1:N upload_jobs N:1 media_assets
```

---

### 8. Admin, Audit & Analytics Domain

Administrative tools and analytics.

#### Tables:
- **audit_logs** - System audit trail
- **feature_flags** - Feature flag management
- **analytics_events** - User behavior tracking
- **analytics_daily_stats** - Daily aggregates
- **system_settings** - Global configuration
- **admin_actions** - Admin action logging

#### Key Relationships:
```
users 1:N audit_logs
users 1:N analytics_events
users 1:N admin_actions
```

---

## Indexing Strategy

### B-Tree Indexes
- Primary keys (automatic)
- Foreign keys for joins
- Status columns with WHERE filters
- Timestamp columns for sorting
- Composite indexes for common queries

### GIN Indexes
- Full-text search on title, content (using pg_trgm)
- Array columns (tags, interests)
- JSONB columns for nested queries

### Vector Indexes
- IVFFlat on embedding columns
- Optimized for cosine similarity
- Lists=100 for datasets under 1M vectors

### Partial Indexes
- `WHERE is_active = true`
- `WHERE status = 'active'`
- Reduces index size and improves performance

---

## Row Level Security (RLS)

All tables have RLS enabled with policies:

### User Data
- Users can read/update own data
- Admins can read all user data

### Content
- Anyone (authenticated) can read active content
- Admins can manage all content

### Commerce
- Users can manage own carts and view own orders
- Admins can view all orders

### AI & Analytics
- Users can read own conversations and usage
- Admins can read aggregated analytics

---

## Semantic Search Queries

### Find Related Content
```sql
SELECT
  id,
  book_id,
  chapter_id,
  chunk_text,
  1 - (embedding <=> query_embedding) as similarity
FROM content_chunks
WHERE book_id = $1
ORDER BY embedding <=> query_embedding
LIMIT 5;
```

### Hybrid Search (Semantic + Metadata Filter)
```sql
SELECT
  cc.*,
  1 - (cc.embedding <=> $1::vector) as similarity,
  bc.title as chapter_title,
  b.title as book_title
FROM content_chunks cc
JOIN book_chapters bc ON bc.id = cc.chapter_id
JOIN books b ON b.id = cc.book_id
WHERE cc.book_id = $2
  AND b.status = 'active'
ORDER BY cc.embedding <=> $1::vector
LIMIT 10;
```

---

## Analytics Queries

### Daily Active Users
```sql
SELECT
  date_trunc('day', created_at) as day,
  COUNT(DISTINCT user_id) as dau
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY day
ORDER BY day DESC;
```

### Book Completion Rate
```sql
SELECT
  b.title,
  COUNT(*) as started,
  SUM(CASE WHEN ul.is_completed THEN 1 ELSE 0 END) as completed,
  ROUND(100.0 * SUM(CASE WHEN ul.is_completed THEN 1 ELSE 0 END) / COUNT(*), 2) as completion_rate
FROM books b
JOIN user_library ul ON ul.book_id = b.id
GROUP BY b.id, b.title
ORDER BY completion_rate DESC;
```

### Revenue Analytics
```sql
SELECT
  date_trunc('day', created_at) as day,
  COUNT(*) as orders,
  SUM(total_amount) as revenue,
  AVG(total_amount) as avg_order_value
FROM orders
WHERE status = 'completed'
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY day
ORDER BY day DESC;
```

---

## Scaling Considerations

### Read Replicas
- Separate read replicas for analytics queries
- Route writes to primary, reads to replicas
- Use pgBouncer for connection pooling

### Partitioning
Consider partitioning for high-volume tables:
- `analytics_events` by month
- `audit_logs` by month
- `chat_messages` by year

### Caching Strategy
- Redis for hot data (user sessions, active carts)
- Application-level caching for book metadata
- CDN for static content (covers, thumbnails)

### Vector Index Tuning
- Increase `lists` parameter as data grows
- Use HNSW index for better accuracy (PG 16+)
- Pre-warm indexes on application start

### Archival Strategy
- Archive completed orders older than 2 years
- Soft delete user data (GDPR compliance)
- Regular vacuum and analyze on large tables

---

## Migration Best Practices

1. **Always use transactions** for schema changes
2. **Create indexes concurrently** to avoid locks
3. **Test migrations on staging** with production data volume
4. **Have rollback scripts** ready
5. **Monitor query performance** after migrations

---

## Backup Strategy

### Automated Backups
- Supabase provides automatic daily backups
- Point-in-time recovery available
- Test restore procedures monthly

### Export Important Data
- Weekly exports of critical tables
- Store embeddings separately (can regenerate)
- Keep audit logs in cold storage

---

## Security Best Practices

1. **Never expose service role key** to clients
2. **Always use RLS policies** for data access
3. **Validate user input** before database queries
4. **Use prepared statements** to prevent SQL injection
5. **Rotate secrets** regularly
6. **Monitor suspicious activity** via audit_logs
7. **Encrypt sensitive data** at rest and in transit

---

## Performance Monitoring

### Key Metrics
- Query response times (p50, p95, p99)
- Cache hit rates
- Connection pool utilization
- Index usage statistics
- Table bloat

### Tools
- Supabase Dashboard for query insights
- pg_stat_statements for slow queries
- Custom analytics in analytics_daily_stats

---

## Future Enhancements

1. **Partitioning** for time-series data
2. **HNSW indexes** for improved vector search
3. **Materialized views** for complex analytics
4. **Event sourcing** for audit trail
5. **GraphQL API** via PostgREST
6. **Real-time subscriptions** for live updates
