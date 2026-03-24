# MindFuel AI - 3-Project Architecture

The MindFuel AI platform has been restructured into **3 standalone, independent projects** for easier development, deployment, and scaling.

## Project Overview

```
MindFuel AI Platform
├── mindfuel-backend/      # Complete Node.js/Express API
├── mindfuel-admin/        # React Admin Dashboard
└── mindfuel-mobile/       # React Native Mobile App
```

Each project is:
- **Completely standalone** - Can be developed, tested, and deployed independently
- **Self-contained** - No dependencies on other projects
- **Production-ready** - Includes all necessary configuration and documentation
- **Git-ready** - Each can be its own repository

## 1. MindFuel Backend

**Location:** `mindfuel-backend/`

**Description:** Complete REST API backend built with Node.js, Express, TypeScript, and PostgreSQL (Supabase).

### Key Features
- JWT authentication with refresh tokens
- 150+ API endpoints covering all platform features
- AI integration (OpenAI GPT-4, embeddings, RAG)
- File storage (AWS S3)
- Payments (Razorpay)
- Push notifications (Firebase)
- Content taxonomy system
- Background job processing (BullMQ)
- Rate limiting (NO Redis - uses in-memory store)

### Tech Stack
- Node.js 18+
- Express.js
- TypeScript
- PostgreSQL + pgvector (Supabase)
- OpenAI API
- AWS S3
- Firebase Admin SDK
- Razorpay

### Quick Start
```bash
cd mindfuel-backend
npm install
cp .env.example .env
# Configure .env with your credentials
npm run dev
```

### API Documentation
- Health check: `GET /health`
- API base: `http://localhost:3000/api`
- See `README.md` for complete endpoint list

---

## 2. MindFuel Admin

**Location:** `mindfuel-admin/`

**Description:** Web-based admin dashboard for managing the MindFuel platform.

### Key Features
- User management
- Content management (workbooks, products, quotes)
- Order management
- Analytics dashboard
- AI configuration
- Secure admin authentication

### Tech Stack
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Redux Toolkit
- React Router v6

### Quick Start
```bash
cd mindfuel-admin
npm install
cp .env.example .env
# Set VITE_API_URL to your backend URL
npm run dev
```

### Access
- Development: `http://localhost:5173`
- Login with admin credentials

---

## 3. MindFuel Mobile

**Location:** `mindfuel-mobile/`

**Description:** Native mobile application for iOS and Android built with React Native.

### Key Features
- Authentication & onboarding
- Content library with reader
- AI chat assistant
- Goal tracking & journaling
- E-commerce (shop, cart, checkout)
- Push notifications
- Progress tracking

### Tech Stack
- React Native
- TypeScript
- Redux Toolkit
- React Navigation v6
- Axios

### Quick Start
```bash
cd mindfuel-mobile
npm install
cp .env.example .env
# Configure API_URL and other credentials
npm start
```

### Running
- iOS: `npm run ios` (Mac only)
- Android: `npm run android`
- Expo Go: Scan QR code from `npm start`

---

## Database Setup

The platform uses **Supabase** (PostgreSQL + pgvector) for all data persistence.

### Migration Files
Located in original project: `../supabase/migrations/`

### Running Migrations
```bash
# From the original project directory
supabase db reset

# Or manually run migrations in order from supabase/migrations/
```

### Key Tables
- `users` - User accounts
- `workbooks`, `books`, `chapters` - Content
- `products`, `orders` - E-commerce
- `goals`, `journals` - Personal development
- `content_categories`, `content_tags` - Taxonomy
- `ai_conversations`, `ai_messages` - AI chat
- `content_embeddings` - Vector embeddings for RAG

---

## Python AI Service (Optional)

**Location:** `services/ai-python/` (in original project)

**Description:** Optional Python microservice for advanced AI operations.

### Features
- Text embedding generation
- RAG (Retrieval-Augmented Generation)
- Semantic search
- Book content ingestion

### Tech Stack
- Python 3.11+
- FastAPI
- OpenAI Python SDK
- psycopg2 (PostgreSQL)

### Quick Start
```bash
cd services/ai-python
pip install -r requirements.txt
cp .env.example .env
# Configure environment variables
uvicorn app.main:app --reload --port 8000
```

### Integration
The Node.js backend can proxy AI requests to this service, or use the built-in AI services directly.

---

## Environment Variables

### Backend (`mindfuel-backend/.env`)
```env
# Required
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_secret
OPENAI_API_KEY=your_openai_key

# Optional
AWS_ACCESS_KEY_ID=your_aws_key
RAZORPAY_KEY_ID=your_razorpay_key
FIREBASE_PROJECT_ID=your_firebase_project
```

### Admin (`mindfuel-admin/.env`)
```env
VITE_API_URL=http://localhost:3000/api
```

### Mobile (`mindfuel-mobile/.env`)
```env
API_URL=http://localhost:3000/api
RAZORPAY_KEY=your_razorpay_key
```

---

## Development Workflow

### 1. Start Backend
```bash
cd mindfuel-backend
npm run dev
# Runs on http://localhost:3000
```

### 2. Start Admin (Optional)
```bash
cd mindfuel-admin
npm run dev
# Runs on http://localhost:5173
```

### 3. Start Mobile
```bash
cd mindfuel-mobile
npm start
# Follow prompts to open in simulator/emulator
```

---

## Deployment

### Backend
**Recommended:** Heroku, Railway, Render, AWS Elastic Beanstalk, Google Cloud Run

```bash
cd mindfuel-backend
npm run build
# Deploy dist/ folder
```

**Environment:** Set all required environment variables in your hosting platform.

### Admin Panel
**Recommended:** Vercel, Netlify, AWS S3 + CloudFront

```bash
cd mindfuel-admin
npm run build
# Deploy dist/ folder
```

**Configuration:** Single environment variable: `VITE_API_URL`

### Mobile App
**iOS:** Build with Xcode or Expo, submit to App Store
**Android:** Build APK/AAB, submit to Google Play

```bash
cd mindfuel-mobile
# iOS
npx expo build:ios

# Android
npx expo build:android
```

---

## Architecture Benefits

### ✅ Independent Development
- Teams can work on different projects without conflicts
- Each project has its own dependencies and build process
- No monorepo complexity

### ✅ Independent Deployment
- Deploy backend updates without touching frontend
- Update mobile app independently
- Deploy admin panel separately

### ✅ Scalability
- Scale each service independently
- Backend can be horizontal scaled
- Multiple instances of services

### ✅ Technology Flexibility
- Each project can use different tech stacks
- Easier to upgrade dependencies
- No forced technology coupling

### ✅ Clear Separation of Concerns
- Backend: Pure API logic
- Admin: Admin-specific UI
- Mobile: User-facing mobile experience

---

## Communication Between Projects

All communication happens via **REST API**:

```
Mobile App  ─────┐
                 │
Admin Panel ────┼────> Backend API ────> Supabase
                 │
Python AI   ─────┘
```

- **Mobile → Backend**: HTTP requests to `/api/*`
- **Admin → Backend**: HTTP requests to `/api/*`
- **Backend → Supabase**: Direct PostgreSQL connection
- **Backend → Python AI**: HTTP requests to Python service (optional)

---

## Key Changes from Monorepo

### ✅ Removed
- Workspace configuration
- Shared packages (consolidated into each project)
- Redis dependency (replaced with in-memory rate limiting)
- Complex build orchestration
- Inter-package dependencies

### ✅ Added
- Standalone package.json for each project
- Self-contained configuration
- Independent .gitignore files
- Project-specific README files
- Environment file examples

### ✅ Simplified
- Build process (one command per project)
- Deployment (deploy each independently)
- Development (run one project at a time)
- Testing (test each project separately)

---

## Migration from Monorepo

If you have the old monorepo structure, here's how the projects map:

```
OLD Structure → NEW Structure
─────────────────────────────
services/api/                 → mindfuel-backend/src/
packages/config/              → mindfuel-backend/src/config/
packages/types/               → mindfuel-backend/src/types/
packages/utils/               → mindfuel-backend/src/utils/
packages/validation/          → mindfuel-backend/src/validation/

apps/admin/                   → mindfuel-admin/

apps/mobile/                  → mindfuel-mobile/

services/ai-python/           → (stays same, optional)
supabase/migrations/          → (shared, run once)
```

---

## Getting Started (First Time)

### 1. Setup Supabase
```bash
# Create Supabase project at https://supabase.com
# Run all migrations from supabase/migrations/ directory
# Note your connection details
```

### 2. Setup Backend
```bash
cd mindfuel-backend
npm install
cp .env.example .env
# Edit .env with Supabase credentials
npm run dev
```

### 3. Setup Admin (Optional)
```bash
cd mindfuel-admin
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:3000/api
npm run dev
```

### 4. Setup Mobile
```bash
cd mindfuel-mobile
npm install
cp .env.example .env
# Set API_URL=http://localhost:3000/api
npm start
```

---

## Troubleshooting

### Backend won't start
- Check Supabase connection in .env
- Verify JWT_SECRET is set
- Run `npm install` again

### Admin panel shows CORS errors
- Backend must be running
- Check VITE_API_URL in .env
- Verify backend CORS_ORIGIN includes admin URL

### Mobile app can't connect to API
- Check API_URL in .env
- For Android emulator, use `http://10.0.2.2:3000/api`
- For iOS simulator, use `http://localhost:3000/api`
- For physical device, use computer's IP address

### Database errors
- Ensure all migrations are run
- Check Supabase dashboard for errors
- Verify SERVICE_ROLE_KEY has correct permissions

---

## Support & Documentation

- **Backend API Docs:** `mindfuel-backend/README.md`
- **Admin Docs:** `mindfuel-admin/README.md`
- **Mobile Docs:** `mindfuel-mobile/README.md`
- **Database Schema:** `../docs/DATABASE.md` (original project)
- **API Endpoints:** `../docs/API.md` (original project)

---

## License

MIT

## Version

3-Project Architecture v1.0 - March 2024
