# MindFuel AI

A complete, production-grade AI-powered coaching platform with mobile app, admin dashboard, and backend API.

## Project Overview

MindFuel AI is an intelligent coaching platform that provides personalized guidance based on structured workbook content. The platform includes:

- **React Native Mobile App** - iOS/Android app for end users
- **React Admin Dashboard** - Web-based admin panel for content management
- **Node.js Backend API** - Express-based REST API with comprehensive features
- **PostgreSQL + pgvector** - Database with semantic search capabilities
- **Redis** - Caching and job queue management
- **AI Integration** - OpenAI-powered coaching conversations

## Technology Stack

### Frontend
- **Mobile**: React Native CLI, Redux Toolkit, React Navigation, TypeScript
- **Admin**: React, Vite, Material-UI, Redux Toolkit, React Router, TypeScript

### Backend
- **API**: Node.js, Express, TypeScript
- **Database**: Supabase (PostgreSQL + pgvector)
- **Cache**: Redis, BullMQ for job queues
- **AI**: OpenAI API
- **Payments**: Razorpay
- **Notifications**: Firebase Cloud Messaging
- **Storage**: AWS S3

### Shared Packages
- **@mindfuel/types** - Shared TypeScript types
- **@mindfuel/config** - Centralized configuration
- **@mindfuel/utils** - Shared utilities
- **@mindfuel/validation** - Zod validation schemas

## Monorepo Structure

```
mindfuel-ai/
├── apps/
│   ├── mobile/          # React Native mobile app
│   └── admin/           # React admin dashboard
├── services/
│   └── api/             # Express backend API
├── packages/
│   ├── types/           # Shared TypeScript types
│   ├── config/          # Shared configuration
│   ├── utils/           # Shared utilities
│   └── validation/      # Validation schemas
├── docs/                # Documentation
├── infra/               # Infrastructure configs
│   └── docker/          # Docker setup
└── package.json         # Root workspace config
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker and Docker Compose (for local services)
- Supabase account
- OpenAI API key
- Razorpay account
- Firebase project
- AWS S3 bucket

### Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd mindfuel-ai
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your credentials:
- Supabase URL and keys
- OpenAI API key
- Razorpay credentials
- Firebase credentials
- AWS S3 credentials

### Installation

Install all dependencies:
```bash
npm install
```

This will install dependencies for all workspaces (apps, services, and packages).

### Local Development

1. Start local services (Redis):
```bash
cd infra/docker
docker-compose up -d
```

2. Start the backend API:
```bash
npm run dev:api
```

3. Start the admin dashboard:
```bash
npm run dev:admin
```

4. For mobile development:
```bash
cd apps/mobile
npm run android  # For Android
npm run ios      # For iOS
```

## Building for Production

Build all workspaces:
```bash
npm run build
```

Build specific workspace:
```bash
npm run build:admin  # Admin dashboard
npm run build:api    # Backend API
npm run build:mobile # Mobile app
```

## Database Setup

The database schema is managed through Supabase migrations. All tables are created with proper Row Level Security (RLS) policies.

### Key Tables:
- `users` - User accounts
- `workbooks` - Workbook content
- `workbook_chapters` - Chapter content with embeddings
- `workbook_sections` - Section content with embeddings
- `products` - Products for sale
- `orders` - Purchase orders
- `goals` - User goals
- `journals` - Journal entries
- `quotes` - Daily quotes
- `notifications` - User notifications
- `conversations` - AI conversations
- `chat_messages` - Chat messages
- `ai_prompt_templates` - AI prompt templates
- `ai_model_config` - AI model configuration

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token

### Users
- `GET /api/users/profile` - Get user profile
- `PATCH /api/users/profile` - Update profile
- `GET /api/users/workbooks` - Get user workbooks

### Workbooks
- `GET /api/workbooks` - List workbooks
- `GET /api/workbooks/:id` - Get workbook
- `POST /api/workbooks` - Create workbook (admin)
- `PATCH /api/workbooks/:id` - Update workbook (admin)
- `DELETE /api/workbooks/:id` - Delete workbook (admin)
- `GET /api/workbooks/:id/chapters` - Get chapters
- `POST /api/workbooks/:id/chapters` - Create chapter (admin)

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product
- `POST /api/products` - Create product (admin)
- `PATCH /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `GET /api/orders` - List user orders
- `POST /api/orders` - Create order
- `POST /api/orders/verify` - Verify payment
- `GET /api/orders/admin/all` - List all orders (admin)

### Goals
- `GET /api/goals` - List goals
- `GET /api/goals/:id` - Get goal
- `POST /api/goals` - Create goal
- `PATCH /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal
- `POST /api/goals/:id/progress` - Add progress

### Journals
- `GET /api/journals` - List journals
- `GET /api/journals/:id` - Get journal
- `POST /api/journals` - Create journal
- `PATCH /api/journals/:id` - Update journal
- `DELETE /api/journals/:id` - Delete journal

### Quotes
- `GET /api/quotes/daily` - Get daily quote
- `GET /api/quotes` - List quotes (admin)
- `POST /api/quotes` - Create quote (admin)
- `PATCH /api/quotes/:id` - Update quote (admin)
- `DELETE /api/quotes/:id` - Delete quote (admin)

### Notifications
- `GET /api/notifications` - List notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/devices` - Register device

### AI
- `GET /api/ai/conversations` - List conversations
- `POST /api/ai/conversations` - Create conversation
- `POST /api/ai/messages` - Send message
- `GET /api/ai/prompts` - List prompt templates (admin)
- `POST /api/ai/prompts` - Create prompt template (admin)
- `PATCH /api/ai/prompts/:id` - Update prompt template (admin)
- `GET /api/ai/config` - Get model config (admin)
- `PATCH /api/ai/config` - Update model config (admin)

### Analytics
- `GET /api/analytics/dashboard` - Dashboard stats (admin)
- `GET /api/analytics/user-activity` - User activity (admin)
- `GET /api/analytics/revenue` - Revenue analytics (admin)
- `GET /api/analytics/workbooks` - Workbook analytics (admin)

## Key Features

### For Users (Mobile App)
- User registration and authentication
- Set and track personal goals
- Access purchased workbooks
- Read book content with progress tracking
- AI-powered coaching conversations
- Context-aware AI responses based on book content
- Journal entries with mood tracking
- Daily inspirational quotes
- Push notifications
- Payment integration

### For Admins (Dashboard)
- Manage workbooks, chapters, and sections
- Upload and organize content
- Manage products and pricing
- View and manage orders
- User management
- Configure AI prompts and settings
- Manage daily quotes
- View analytics and insights
- System configuration

### Backend Features
- RESTful API with Express
- JWT authentication
- Role-based access control
- Input validation with Zod
- Database with Row Level Security
- Vector embeddings for semantic search
- Background job processing
- Push notification service
- Payment processing with Razorpay
- File storage with S3
- Redis caching
- Comprehensive error handling
- Request logging

## Security

- All API endpoints require authentication
- JWT token-based authentication
- Row Level Security (RLS) on all database tables
- Role-based access control (user, admin, super_admin)
- Input validation and sanitization
- Secure password hashing with bcrypt
- HTTPS only in production
- CORS configured properly
- Helmet.js for security headers

## Testing

Run tests:
```bash
npm run test
```

Type checking:
```bash
npm run typecheck
```

Linting:
```bash
npm run lint
```

## Deployment

### API Deployment
1. Build the API:
```bash
npm run build:api
```

2. Deploy using Docker:
```bash
docker build -t mindfuel-api -f services/api/Dockerfile .
docker run -p 3001:3001 --env-file .env mindfuel-api
```

### Admin Dashboard Deployment
1. Build the dashboard:
```bash
npm run build:admin
```

2. Deploy using Docker or serve static files:
```bash
docker build -t mindfuel-admin -f apps/admin/Dockerfile .
docker run -p 80:80 mindfuel-admin
```

### Mobile App Deployment
- **iOS**: Build and submit to App Store using Xcode
- **Android**: Build APK/AAB and submit to Google Play Store

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

Proprietary - All rights reserved

## Support

For support and questions, please contact the development team.
