# MindFuel Backend API

Complete standalone backend API for MindFuel AI - A personal development platform powered by AI.

## Features

- **Authentication & Authorization**: JWT-based auth with refresh tokens
- **Content Management**: Workbooks, Books, Chapters, Products
- **AI Integration**: OpenAI GPT-4, RAG system, embeddings
- **Goal Tracking**: User goals, milestones, progress tracking
- **Journal System**: Daily journaling with AI insights
- **E-commerce**: Product catalog, orders, Razorpay payments
- **Library**: Reading progress, bookmarks, highlights
- **Notifications**: Push notifications via Firebase
- **File Storage**: AWS S3 integration
- **Analytics**: User activity tracking
- **Rate Limiting**: Built-in rate limiting (no Redis required)
- **Content Taxonomy**: Categories, subcategories, tags for all content

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **Vector DB**: pgvector (for AI embeddings)
- **File Storage**: AWS S3
- **Payments**: Razorpay
- **Push Notifications**: Firebase Admin SDK
- **AI**: OpenAI GPT-4 Turbo
- **Background Jobs**: BullMQ

## Project Structure

```
mindfuel-backend/
├── src/
│   ├── config/           # Configuration and env variables
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions (logger, crypto, jwt)
│   ├── validation/       # Zod validation schemas
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts      # Authentication middleware
│   │   ├── validate.ts  # Request validation
│   │   ├── rate-limit.ts # Rate limiting
│   │   └── error-handler.ts
│   ├── lib/             # External service clients
│   │   ├── supabase.ts  # Supabase client
│   │   ├── openai.ts    # OpenAI client
│   │   ├── firebase.ts  # Firebase Admin
│   │   ├── s3.ts        # AWS S3 client
│   │   ├── razorpay.ts  # Payment gateway
│   │   └── ai/          # AI services (chat, RAG, embeddings)
│   ├── modules/         # Business logic handlers
│   │   ├── auth/        # Authentication
│   │   ├── users/       # User management
│   │   ├── workbooks/   # Workbook CRUD
│   │   ├── books/       # Book management
│   │   ├── library/     # Reading library
│   │   ├── products/    # Product catalog
│   │   ├── orders/      # Order management
│   │   ├── goals/       # Goal tracking
│   │   ├── journals/    # Journal entries
│   │   ├── quotes/      # Daily quotes
│   │   ├── ai/          # AI chat and recommendations
│   │   ├── taxonomy/    # Content categorization
│   │   ├── analytics/   # Analytics and insights
│   │   ├── notifications/ # Notification system
│   │   ├── uploads/     # File upload handling
│   │   ├── shop/        # Shop endpoints
│   │   ├── practices/   # Practice tracking
│   │   └── admin/       # Admin operations
│   ├── routes/          # API route definitions
│   ├── workers/         # Background job workers
│   └── index.ts         # Application entry point
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Installation

### 1. Clone and Install

```bash
cd mindfuel-backend
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Application
NODE_ENV=development
PORT=3000

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=your_openai_key

# Firebase (optional - for push notifications)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# AWS S3 (optional - for file uploads)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket_name

# Razorpay (optional - for payments)
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

### 3. Database Setup

Run Supabase migrations (from parent directory):

```bash
# Assuming you have supabase CLI installed
supabase db reset
```

Or manually run migrations from `../supabase/migrations/`

### 4. Run the Server

Development:
```bash
npm run dev
```

Production:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/:id` - Get user by ID (admin)

### Workbooks
- `GET /api/workbooks` - List all workbooks
- `GET /api/workbooks/:id` - Get workbook details
- `POST /api/workbooks` - Create workbook (admin)
- `PUT /api/workbooks/:id` - Update workbook (admin)
- `DELETE /api/workbooks/:id` - Delete workbook (admin)

### Books & Library
- `GET /api/books` - List books
- `GET /api/books/:id` - Get book details
- `GET /api/books/:id/chapters` - Get chapters
- `GET /api/library/my-library` - Get user's library
- `POST /api/library/add` - Add book to library
- `PUT /api/library/progress` - Update reading progress

### Products & Orders
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - User orders
- `POST /api/orders/:id/verify-payment` - Verify Razorpay payment

### Goals & Journals
- `GET /api/goals` - List user goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `GET /api/journals` - List journal entries
- `POST /api/journals` - Create journal entry

### AI Endpoints
- `POST /api/ai/chat` - Chat with AI
- `POST /api/ai/chat/stream` - Streaming chat
- `POST /api/ai/suggestions` - Get personalized suggestions
- `POST /api/ai/analyze-journal` - Analyze journal entry

### Taxonomy
- `GET /api/taxonomy/categories` - List categories
- `GET /api/taxonomy/subcategories` - List subcategories
- `GET /api/taxonomy/tags` - List tags
- `GET /api/taxonomy/browse/category/:slug` - Browse by category
- `GET /api/taxonomy/browse/tag/:slug` - Browse by tag

### Analytics
- `GET /api/analytics/dashboard` - User dashboard stats
- `GET /api/analytics/progress` - Learning progress

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/analytics` - Platform analytics
- `POST /api/admin/ingest-book/:bookId` - Ingest book for AI

For complete API documentation, see the Postman collection in the parent directory.

## Rate Limiting

Built-in rate limiting (no Redis required):

- **Auth endpoints**: 5 requests per 15 minutes
- **API endpoints**: 100 requests per 15 minutes
- **Strict endpoints**: 10 requests per hour

## Background Workers

BullMQ workers for async tasks:

- **Embedding Worker**: Generate AI embeddings for content
- **Notification Worker**: Send push notifications

## Security Features

- Helmet.js for HTTP security headers
- CORS configuration
- JWT authentication
- Request validation with Zod
- Rate limiting
- SQL injection prevention (parameterized queries)
- XSS protection

## Development

### Type Checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

### Testing
```bash
npm test
```

## Deployment

### Docker

```bash
docker build -t mindfuel-backend .
docker run -p 3000:3000 --env-file .env mindfuel-backend
```

### Traditional Hosting

1. Build the project:
```bash
npm run build
```

2. Start the server:
```bash
NODE_ENV=production npm start
```

### Environment Variables for Production

Ensure all required environment variables are set in your hosting platform:
- Supabase credentials
- JWT secret
- OpenAI API key
- AWS S3 credentials (if using file uploads)
- Razorpay credentials (if using payments)
- Firebase credentials (if using push notifications)

## Monitoring

Health check endpoint:
```
GET /health
```

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2024-03-24T10:00:00.000Z",
  "uptime": 12345
}
```

## License

MIT

## Support

For issues and questions, contact the development team.
