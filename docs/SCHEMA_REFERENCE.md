# MindFuel AI - Complete Schema Reference

## Quick Overview

Total Tables: **60+ tables** across 8 domains

### Domain Summary

| Domain | Tables | Purpose |
|--------|--------|---------|
| Auth & User | 11 | Authentication, RBAC, user management |
| Content | 7 | Books, chapters, sections, tags, chunks |
| AI | 7 | Conversations, RAG, usage tracking |
| Library | 5 | User library, progress, highlights, notes |
| Practice & Journal | 7 | Guided practices, journaling |
| Commerce | 14 | Products, orders, payments, entitlements |
| Notification & Media | 8 | Push notifications, media management |
| Admin & Analytics | 6 | Audit logs, analytics, feature flags |

---

## Complete Table List

### Auth & User Domain
1. ✅ **users** - Core user accounts
2. ✅ **roles** - System roles
3. ✅ **permissions** - Granular permissions
4. ✅ **user_roles** - User-role mapping
5. ✅ **role_permissions** - Role-permission mapping
6. ✅ **user_sessions** - Active sessions
7. ✅ **refresh_tokens** - JWT tokens
8. ✅ **user_profiles** - Extended profiles
9. ✅ **user_preferences** - User settings
10. ✅ **user_streaks** - Daily streaks
11. ✅ **user_goals** - Goal tracking

### Content Domain
12. ✅ **books** - Main content
13. ✅ **book_chapters** - Book chapters
14. ✅ **book_sections** - Chapter sections
15. ✅ **book_tags** - Content tags
16. ✅ **book_tag_mapping** - Book-tag relations
17. ✅ **content_chunks** - RAG chunks with vectors
18. ✅ **daily_quotes** - Daily quotes

### AI Domain
19. ✅ **conversations** - AI conversations
20. ✅ **chat_messages** - Conversation messages
21. ✅ **ai_prompt_templates** - Prompt templates
22. ✅ **ai_model_config** - Model configuration
23. ✅ **ai_usage_logs** - Usage tracking
24. ✅ **ai_summaries** - Content summaries
25. ✅ **retrieval_logs** - RAG analytics

### Library & Progress Domain
26. ✅ **user_library** - User's library
27. ✅ **reading_progress** - Detailed progress
28. ✅ **bookmarks** - User bookmarks
29. ✅ **highlights** - Text highlights
30. ✅ **reading_notes** - Personal notes

### Practice & Journal Domain
31. ✅ **guided_practices** - Practice templates
32. ✅ **practice_steps** - Practice steps
33. ✅ **user_practice_sessions** - Session tracking
34. ✅ **user_practice_answers** - User answers
35. ✅ **journal_entries** - Journal entries
36. ✅ **journal_tags** - Journal tags
37. ✅ **journal_prompts** - Daily prompts

### Commerce Domain
38. ✅ **product_categories** - Product categories
39. ✅ **products** - Products catalog
40. ✅ **product_images** - Product images
41. ✅ **coupons** - Discount coupons
42. ✅ **coupon_rules** - Coupon rules
43. ✅ **product_reviews** - User reviews
44. ✅ **carts** - Shopping carts
45. ✅ **cart_items** - Cart items
46. ✅ **orders** - Customer orders
47. ✅ **order_items** - Order line items
48. ✅ **payments** - Payment transactions
49. ✅ **payment_events** - Payment webhooks
50. ✅ **refunds** - Refund requests
51. ✅ **entitlements** - Access grants

### Notification & Media Domain
52. ✅ **push_tokens** - FCM tokens
53. ✅ **notifications_new** - User notifications
54. ✅ **notification_templates** - Templates
55. ✅ **notification_logs** - Delivery logs
56. ✅ **notification_campaigns** - Campaigns
57. ✅ **campaign_recipients** - Campaign tracking
58. ✅ **media_assets** - Media files
59. ✅ **upload_jobs** - Upload tracking

### Admin & Analytics Domain
60. ✅ **audit_logs** - Audit trail
61. ✅ **feature_flags** - Feature flags
62. ✅ **analytics_events** - User events
63. ✅ **analytics_daily_stats** - Daily stats
64. ✅ **system_settings** - Global config
65. ✅ **admin_actions** - Admin actions

---

## Vector Columns (pgvector)

| Table | Column | Dimension | Purpose |
|-------|--------|-----------|---------|
| content_chunks | embedding | 1536 | OpenAI embeddings for RAG |
| retrieval_logs | query_embedding | 1536 | Query embedding analytics |

**Index Type**: IVFFlat with cosine distance
**Lists Parameter**: 100 (suitable for <1M vectors)

---

## Key Indexes

### Full-Text Search (GIN)
- `books.title` - Title search
- `books.author` - Author search
- `book_chapters.title` - Chapter search
- `journal_entries.content` - Journal search

### Vector Search (IVFFlat)
- `content_chunks.embedding` - Semantic search
- `retrieval_logs.query_embedding` - Query analytics

### JSONB (GIN)
- `content_chunks.metadata` - Metadata filtering
- `analytics_events.event_properties` - Event properties
- `ai_summaries.tags` - Summary tags

### Array (GIN)
- `user_profiles.interests` - User interests
- `journal_entries.tags` - Journal tags
- `book_chapters.key_takeaways` - Takeaways

---

## RLS Policies Summary

### User Data
✅ Users can read/update own data
✅ Admins can read all users

### Content
✅ Anyone can read active content
✅ Admins can manage content

### AI & Analytics
✅ Users can read own conversations
✅ Admins can read all analytics

### Commerce
✅ Users can manage own carts
✅ Users can view own orders
✅ Admins can view all orders

---

## Common Relationships

### One-to-One
- users ↔ user_profiles
- users ↔ user_preferences
- users ↔ user_streaks
- content (type + id) ↔ ai_summaries

### One-to-Many
- users → user_goals
- users → journal_entries
- books → book_chapters → book_sections
- books → content_chunks
- users → conversations → chat_messages
- orders → order_items
- orders → payments

### Many-to-Many
- users ↔ roles (via user_roles)
- roles ↔ permissions (via role_permissions)
- books ↔ book_tags (via book_tag_mapping)

---

## Soft Delete Strategy

Tables with `status` column for soft delete:
- users
- books, book_chapters, book_sections
- products
- daily_quotes
- guided_practices

Values: `active`, `archived`, `deleted`, `draft`

---

## Timestamps

All tables have:
- ✅ `created_at` - Creation timestamp
- ✅ `updated_at` - Last update (auto-updated via trigger)

Tables without `updated_at`:
- Immutable logs (audit_logs, analytics_events, payment_events)
- Simple mappings (user_roles, book_tag_mapping)

---

## Foreign Key Cascade Rules

### ON DELETE CASCADE
- All child records (chapters, sections, items, etc.)
- User-owned data (when user is deleted)
- Session and token data

### ON DELETE SET NULL
- Optional references (created_by, book_id in quotes)
- Soft references (conversation_id in logs)

### ON DELETE RESTRICT (implicit)
- Core entities (users, books, products)
- Financial records (orders, payments)

---

## Data Volume Estimates (1 Year)

| Table | Estimated Rows | Growth Rate |
|-------|----------------|-------------|
| users | 100K | Medium |
| books | 1K | Low |
| content_chunks | 500K | Low |
| conversations | 1M | High |
| chat_messages | 10M | High |
| analytics_events | 50M | Very High |
| orders | 200K | Medium |
| audit_logs | 5M | High |

---

## Partitioning Recommendations

Consider partitioning for:
1. **analytics_events** - By month (high volume)
2. **chat_messages** - By quarter (conversation history)
3. **audit_logs** - By month (compliance)
4. **ai_usage_logs** - By month (cost tracking)

---

## Backup Priority

### Critical (Daily + WAL)
- users, user_profiles, user_preferences
- orders, payments, entitlements
- products, books

### Important (Daily)
- user_library, reading_progress
- journal_entries, highlights
- ai_prompt_templates, ai_model_config

### Can Regenerate
- content_chunks (embeddings)
- ai_summaries
- analytics_daily_stats

---

## Migration Files Created

1. ✅ `01_enable_extensions.sql` - Enable uuid, vector, pg_trgm
2. ✅ `02_create_users_table.sql` - Base users table (existing)
3. ✅ `03_extend_auth_and_rbac.sql` - RBAC and extended user tables
4. ✅ `04_create_content_domain_pgvector.sql` - Books and vector chunks
5. ✅ `05_extend_ai_domain.sql` - AI usage and retrieval logs
6. ✅ `06_create_library_reading_progress.sql` - Library and progress
7. ✅ `07_create_practice_journal_domain.sql` - Practices and journals
8. ✅ `08_extend_commerce_domain.sql` - Complete e-commerce
9. ✅ `09_create_notification_media_domains.sql` - Notifications and media
10. ✅ `10_create_admin_audit_analytics.sql` - Admin and analytics

---

## Seed Data Included

✅ Admin and test users
✅ Sample roles and permissions
✅ 2 complete books (Atomic Habits, Deep Work)
✅ Chapters and sections
✅ Content chunks (with embedding placeholders)
✅ Daily quotes
✅ AI prompt templates
✅ Products and pricing
✅ Guided practices
✅ Journal prompts
✅ Feature flags
✅ System settings

**Run seed**: Load `/supabase/seed.sql` via Supabase Dashboard or CLI

---

## Performance Tuning

### Connection Pooling
- Use pgBouncer (Supabase provides this)
- Transaction pooling for short queries
- Session pooling for long transactions

### Query Optimization
- Use EXPLAIN ANALYZE for slow queries
- Add indexes for common WHERE/JOIN columns
- Use partial indexes for filtered queries
- Avoid N+1 queries with proper JOINs

### Caching Strategy
- Redis for hot data (sessions, carts)
- Application-level for book metadata
- CDN for static assets (covers, thumbnails)

---

## Security Checklist

✅ All tables have RLS enabled
✅ Service role key never exposed to client
✅ Prepared statements prevent SQL injection
✅ Sensitive data encrypted at rest
✅ Audit logs track all changes
✅ Rate limiting on API endpoints
✅ Input validation before DB operations
✅ Regular security audits

---

## Next Steps

1. **Load seed data**: Import seed.sql
2. **Test queries**: Run sample queries from DATABASE_QUERIES.md
3. **Generate embeddings**: Process content_chunks with OpenAI API
4. **Set up monitoring**: Track slow queries and table sizes
5. **Configure backups**: Verify Supabase backup schedule
6. **Load test**: Test with production-like data volume

---

## Support & References

- **Supabase Docs**: https://supabase.com/docs
- **pgvector Docs**: https://github.com/pgvector/pgvector
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

For questions or issues, refer to:
- `docs/DATABASE.md` - Detailed architecture
- `docs/DATABASE_QUERIES.md` - Sample queries
- `docs/API.md` - API endpoints
