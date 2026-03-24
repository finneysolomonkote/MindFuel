# MindFuel AI Backend

Clean architecture backend for MindFuel AI platform with repository pattern, service layer, and AI-powered RAG system.

## Architecture

```
Route → Handler → Service → Repository → Database
```

### Layers

- **Routes**: API endpoint definitions
- **Handlers**: Request/response handling, validation
- **Services**: Business logic
- **Repositories**: Data access layer
- **Database**: PostgreSQL with Supabase

## Project Structure

```
backendMindfuelAi/
├── database/
│   ├── migrations/       # Database migrations (001-015)
│   └── seeds/           # Seed data
├── src/
│   ├── config/          # Configuration
│   ├── lib/             # External services (OpenAI, S3, etc)
│   │   └── ai/          # AI services (embeddings, RAG, chat)
│   ├── middleware/      # Express middleware
│   ├── modules/         # Feature modules
│   │   ├── auth/        # Authentication
│   │   ├── ai/          # AI conversations
│   │   ├── users/       # User management
│   │   ├── books/       # Books & content
│   │   ├── workbooks/   # Workbooks
│   │   ├── library/     # User library
│   │   ├── goals/       # Goal tracking
│   │   ├── journals/    # Journaling
│   │   ├── products/    # E-commerce products
│   │   ├── orders/      # Order management
│   │   ├── shop/        # Shopping cart
│   │   └── ...
│   ├── routes/          # Route definitions
│   ├── types/           # TypeScript types
│   ├── utils/           # Utilities
│   ├── validation/      # Zod schemas
│   ├── workers/         # Background jobs
│   └── shared/          # Shared constants
```

## Database Migrations

### Migration Order
1. `001_enable_extensions.sql` - PostgreSQL extensions (uuid, pgcrypto, vector)
2. `002_create_users.sql` - User authentication
3. `003_create_taxonomy.sql` - Content categorization
4. `004_create_books.sql` - Books and chapters
5. `005_create_workbooks.sql` - Workbooks
6. `006_create_library.sql` - User library & reading progress
7. `007_create_goals.sql` - Goal tracking
8. `008_create_journals.sql` - Journaling
9. `009_create_products.sql` - Products & cart
10. `010_create_orders.sql` - Order management
11. `011_create_quotes.sql` - Daily quotes
12. `012_create_notifications.sql` - Notifications
13. `013_create_ai_tables.sql` - AI conversations & RAG (with pgvector)
14. `014_create_analytics.sql` - Analytics & audit logs
15. `015_rls_policies.sql` - Row Level Security policies

### Running Migrations

```bash
# Apply all migrations
npm run migrate

# Seed database
npm run seed
```

## AI & RAG System

### Features
- **Vector Embeddings**: 1536-dimensional vectors (OpenAI text-embedding-3-small)
- **Semantic Search**: HNSW index for fast similarity search
- **Context-Aware Chat**: RAG-powered responses using book/workbook content
- **Citation System**: Automatic citation of source material

### Tables
- `content_embeddings` - Vector embeddings with metadata
- `content_chunks` - Chunked content for processing
- `ai_conversations` - User conversations
- `ai_messages` - Chat messages with citations

### Functions
```sql
match_content(query_embedding, threshold, count)
```

## Setup

### Prerequisites
- Node.js >= 18
- PostgreSQL 14+ with pgvector extension
- Supabase account

### Environment Variables

Copy `.env` and configure:

```bash
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_key

# AI
OPENAI_API_KEY=your_openai_key

# AWS S3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

# Payment
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

### Installation

```bash
# Install dependencies
npm install

# Run migrations
npm run migrate

# Seed database
npm run seed

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Documentation

- **Postman Collection**: `MindFuel_API_Complete.postman_collection.json`
- **User Flows**: `API_USER_FLOWS.md`
- **Quick Reference**: `API_QUICK_REFERENCE.md`

### Key Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/books` - List books
- `GET /api/library` - User library
- `POST /api/ai/conversations` - Create AI conversation
- `POST /api/ai/messages` - Send message to AI
- `POST /api/goals` - Create goal
- `POST /api/journals` - Create journal entry

## Module Structure

Each module follows this pattern:

```
modules/users/
├── user.handlers.ts     # Request/response handling
├── user.service.ts      # Business logic
├── user.repository.ts   # Database queries
└── user.mapper.ts       # DTO transformations (optional)
```

### Flow Example

```typescript
// 1. Route
router.post('/users', validate(schema), userHandlers.create);

// 2. Handler
async create(req, res) {
  const user = await userService.create(req.body);
  return res.json(user);
}

// 3. Service
async create(data) {
  const hashed = await hashPassword(data.password);
  return await userRepository.create({...data, password_hash: hashed});
}

// 4. Repository
async create(data) {
  const {data: user} = await supabase.from('users').insert(data).single();
  return user;
}
```

## Security

- **RLS (Row Level Security)**: All tables have RLS enabled
- **JWT Authentication**: Bearer token authentication
- **Rate Limiting**: Per-route rate limits
- **Input Validation**: Zod schema validation
- **Password Hashing**: bcrypt with salt rounds
- **CORS**: Configurable origins

## Testing

```bash
# Run tests
npm test

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Deployment

### Docker

```bash
# Build image
docker build -t mindfuel-backend .

# Run container
docker run -p 3000:3000 --env-file .env mindfuel-backend
```

### Supabase

Database is hosted on Supabase with:
- Automatic backups
- Point-in-time recovery
- Connection pooling
- Real-time subscriptions

## Performance

- **Caching**: In-memory caching for frequently accessed data
- **Connection Pooling**: Supabase connection pooler
- **Indexes**: Strategic database indexes
- **Vector Search**: HNSW index for fast similarity search

## Monitoring

- **Logging**: Winston logger with multiple transports
- **Analytics**: Event tracking and audit logs
- **Error Tracking**: Structured error logging
- **Usage Metrics**: AI token usage tracking

## Contributing

1. Follow the repository pattern
2. Add types for all functions
3. Write migration for schema changes
4. Update API documentation
5. Add tests for new features

## License

MIT License - MindFuel AI Team
