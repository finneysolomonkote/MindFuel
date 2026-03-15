# MindFuel AI - Architecture Documentation

## System Overview

MindFuel AI is a comprehensive coaching platform consisting of three main applications:
1. React Native mobile app for end users
2. React admin dashboard for content management
3. Express backend API for business logic and data management

## Architecture Principles

### Monorepo Structure
The project uses a monorepo approach with npm workspaces to share code and maintain consistency across applications.

### Functional Architecture
The backend follows a functional, modular architecture instead of object-oriented patterns. Each module contains handlers, services, and utilities as pure functions where possible.

### Separation of Concerns
- **Presentation Layer**: React Native (mobile), React (admin)
- **Business Logic Layer**: Express API
- **Data Layer**: Supabase (PostgreSQL)
- **Caching Layer**: Redis
- **Storage Layer**: AWS S3
- **AI Layer**: OpenAI API

## Backend Architecture

### Module Structure
Each feature module follows this structure:
```
modules/
  feature/
    feature.handlers.ts    # Request handlers
    feature.services.ts    # Business logic
    feature.utils.ts       # Helper functions
```

### Key Components

#### Middleware
- **Authentication**: JWT-based authentication middleware
- **Authorization**: Role-based access control
- **Validation**: Zod schema validation
- **Error Handling**: Centralized error handling
- **Logging**: Request and error logging

#### Libraries
- **Supabase**: Database client
- **Redis**: Caching and job queues
- **OpenAI**: AI completions and embeddings
- **Razorpay**: Payment processing
- **Firebase**: Push notifications
- **AWS S3**: File storage

#### Workers
- **Notification Worker**: Processes push notification jobs
- **Embedding Worker**: Generates vector embeddings for content

### Data Flow

1. **Request Flow**:
   - Client sends request
   - Middleware authenticates and validates
   - Handler processes request
   - Service layer executes business logic
   - Database query executed
   - Response sent to client

2. **Background Job Flow**:
   - Job added to Redis queue
   - Worker picks up job
   - Processes job asynchronously
   - Updates database
   - Sends notification if needed

## Database Architecture

### Schema Design

#### Core Tables
- **users**: User accounts and profiles
- **workbooks**: Main content container
- **workbook_chapters**: Chapter-level content with embeddings
- **workbook_sections**: Section-level content with embeddings
- **products**: Purchasable products
- **orders**: Purchase orders and payment info

#### User Data Tables
- **goals**: User-defined goals
- **goal_progress**: Goal progress tracking
- **journals**: Journal entries
- **user_workbooks**: Workbook progress tracking
- **user_devices**: Device tokens for notifications

#### AI Tables
- **conversations**: AI conversation threads
- **chat_messages**: Individual messages
- **ai_prompt_templates**: Admin-configured prompts
- **ai_model_config**: AI model settings

#### Content Tables
- **quotes**: Inspirational quotes
- **daily_quotes**: Daily quote assignments
- **notifications**: User notifications

### Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Allow users to read their own data
- Allow users to create/update their own data
- Restrict admin operations to admin users
- Ensure data isolation between users

### Vector Embeddings

The platform uses pgvector to store embeddings for:
- Workbook chapters
- Workbook sections

This enables semantic search for AI-powered coaching responses.

## Frontend Architecture

### Mobile App (React Native)

#### Navigation Structure
- **RootNavigator**: Switches between Auth and Main navigators
- **AuthNavigator**: Login and registration screens
- **MainNavigator**: Bottom tab navigation with Home, Library, Goals, Journal, Profile

#### State Management
- Redux Toolkit for global state
- Slices for auth, workbooks, goals
- AsyncStorage for persistence

#### API Integration
- Axios client with interceptors
- Automatic token injection
- Error handling and retry logic

### Admin Dashboard (React + MUI)

#### Layout
- **DashboardLayout**: Main layout with sidebar navigation
- **AuthLayout**: Centered layout for authentication

#### Routes
- Dashboard overview
- Workbooks management
- Products management
- Orders management
- Users management
- Quotes management
- AI configuration
- Analytics

#### State Management
- Redux Toolkit for global state
- Slices for auth, workbooks, products
- LocalStorage for token persistence

## AI Integration

### Conversation Context

The AI system supports different context types:
- **General**: General coaching conversations
- **Workbook**: Context from specific workbook
- **Chapter**: Context from specific chapter
- **Goal**: Context from user goal

### Semantic Search

When a user asks a question:
1. Generate embedding for the question
2. Search for similar content using vector similarity
3. Include relevant content in the AI prompt
4. Generate contextualized response

### Prompt Templates

Admins can configure prompt templates for different contexts:
- System prompts
- Context-specific prompts
- Goal-oriented prompts

## Security Architecture

### Authentication
- JWT tokens with configurable expiration
- Refresh token mechanism
- Secure password hashing with bcrypt

### Authorization
- Role-based access control (RBAC)
- User roles: user, admin, super_admin
- Route-level authorization checks

### Data Protection
- Row Level Security on all tables
- User data isolation
- Admin access logging
- Input validation and sanitization

### API Security
- HTTPS only in production
- CORS configuration
- Rate limiting (to be implemented)
- Helmet.js security headers

## Scalability Considerations

### Horizontal Scaling
- Stateless API servers
- Redis for shared state
- Load balancer ready

### Caching Strategy
- Redis caching for frequently accessed data
- Cache invalidation on updates
- Configurable TTL

### Database Optimization
- Proper indexing on all foreign keys
- Composite indexes for common queries
- Query optimization with select statements

### Background Jobs
- Asynchronous processing for heavy operations
- Job prioritization
- Retry mechanism
- Dead letter queue

## Monitoring and Observability

### Logging
- Structured JSON logging
- Request/response logging
- Error logging with stack traces
- Different log levels (info, warn, error, debug)

### Health Checks
- `/health` endpoint for API status
- Database connectivity check
- Redis connectivity check

## Development Workflow

### Local Development
1. Start local services (Redis) with Docker Compose
2. Run database migrations
3. Start API in watch mode
4. Start admin dashboard in dev mode
5. Start mobile app on emulator/device

### Code Quality
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Pre-commit hooks (to be configured)

### Testing Strategy
- Unit tests for utilities
- Integration tests for API endpoints
- E2E tests for critical flows
- Component tests for React components

## Deployment Architecture

### API Deployment
- Docker containerization
- Environment-based configuration
- Health check endpoints
- Graceful shutdown

### Admin Dashboard Deployment
- Static file serving with nginx
- CDN integration
- Environment variable injection

### Mobile App Deployment
- iOS: TestFlight for beta, App Store for production
- Android: Internal testing, Google Play Store

## Future Enhancements

### Planned Features
- Real-time chat with WebSocket
- Video content support
- Offline mode for mobile
- Advanced analytics
- A/B testing framework
- Multi-language support
- Social features

### Technical Improvements
- GraphQL API option
- Microservices architecture
- Event-driven architecture
- Kubernetes deployment
- CI/CD pipeline
- Automated testing
- Performance monitoring
- Error tracking service integration
