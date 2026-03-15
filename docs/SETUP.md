# Setup Guide

## Prerequisites

### Required Software
- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker and Docker Compose
- Git

### For Mobile Development
- **iOS**: macOS with Xcode 12+, CocoaPods
- **Android**: Android Studio, JDK 11+, Android SDK

### Required Accounts
- Supabase account
- OpenAI account
- Razorpay account
- Firebase project
- AWS account with S3

## Initial Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd mindfuel-ai
```

### 2. Install Dependencies
```bash
npm install
```

This will install dependencies for all workspaces.

### 3. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Update the `.env` file with your credentials:

#### Supabase Configuration
1. Go to https://supabase.com
2. Create a new project
3. Go to Project Settings > API
4. Copy the URL and anon key
5. Copy the service role key (keep this secret!)

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### OpenAI Configuration
1. Go to https://platform.openai.com
2. Create an API key
3. Add to .env:

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4-turbo-preview
```

#### Razorpay Configuration
1. Go to https://dashboard.razorpay.com
2. Go to Settings > API Keys
3. Generate Test/Live keys

```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

#### Firebase Configuration
1. Go to https://console.firebase.google.com
2. Create a new project
3. Go to Project Settings > Service Accounts
4. Generate new private key
5. Extract values from JSON:

```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

#### AWS S3 Configuration
1. Go to AWS Console
2. Create an S3 bucket
3. Create IAM user with S3 access
4. Generate access keys

```env
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket_name
```

#### JWT Configuration
Generate a random secret (at least 32 characters):

```env
JWT_SECRET=your_very_long_random_secret_min_32_chars
JWT_EXPIRES_IN=7d
```

### 4. Database Setup

The database migrations are already applied through Supabase. To verify:

1. Go to Supabase Dashboard
2. Go to Table Editor
3. Verify all tables are created

### 5. Start Local Services

Start Redis using Docker Compose:
```bash
cd infra/docker
docker-compose up -d
```

Verify services are running:
```bash
docker-compose ps
```

### 6. Build Shared Packages

```bash
npm run build --workspace=packages/types
npm run build --workspace=packages/config
npm run build --workspace=packages/utils
npm run build --workspace=packages/validation
```

## Running Applications

### Backend API

```bash
npm run dev:api
```

The API will start on http://localhost:3001

Verify it's running:
```bash
curl http://localhost:3001/health
```

### Admin Dashboard

```bash
npm run dev:admin
```

The dashboard will start on http://localhost:5173

### Mobile App

#### iOS Setup
```bash
cd apps/mobile
cd ios && pod install && cd ..
npm run ios
```

#### Android Setup
```bash
cd apps/mobile
npm run android
```

## Creating First Admin User

Use Supabase SQL Editor or API to create an admin user:

```sql
INSERT INTO users (email, password_hash, full_name, role, status)
VALUES (
  'admin@mindfuel.ai',
  '$2b$10$...',  -- Hash of 'admin123'
  'Admin User',
  'admin',
  'active'
);
```

Or use the register endpoint and then manually update the role in the database.

## Testing the Setup

### 1. Test API Health
```bash
curl http://localhost:3001/health
```

### 2. Test Authentication
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'
```

### 3. Test Admin Dashboard
1. Open http://localhost:5173
2. Login with admin credentials
3. Verify dashboard loads

### 4. Test Mobile App
1. Start the app on emulator/device
2. Register a new account
3. Verify navigation works

## Troubleshooting

### Port Already in Use
If port 3001 or 5173 is already in use:
```bash
# Find process using port
lsof -i :3001
# Kill process
kill -9 <PID>
```

### Database Connection Issues
- Verify Supabase credentials
- Check if your IP is allowed in Supabase settings
- Verify database tables are created

### Redis Connection Issues
```bash
# Check if Redis is running
docker-compose ps
# Restart Redis
docker-compose restart redis
```

### Mobile App Build Issues

#### iOS
```bash
cd apps/mobile/ios
pod install
cd ..
npm run ios
```

#### Android
```bash
cd apps/mobile/android
./gradlew clean
cd ..
npm run android
```

### TypeScript Errors
```bash
# Rebuild shared packages
npm run build --workspace=packages/types
npm run build --workspace=packages/config
npm run build --workspace=packages/utils
npm run build --workspace=packages/validation
```

## Development Tips

### Hot Reload
- API: Uses tsx watch mode for hot reload
- Admin: Vite provides instant HMR
- Mobile: React Native fast refresh enabled

### Debugging
- API: Use VS Code debugger with tsx
- Admin: Browser DevTools
- Mobile: React Native Debugger or Flipper

### Database Changes
When making database changes:
1. Create a new migration file
2. Test locally
3. Apply to production

### Code Quality
Before committing:
```bash
npm run lint
npm run typecheck
npm run test
```

## Next Steps

1. Read the [Architecture Documentation](./ARCHITECTURE.md)
2. Review the [API Documentation](./API.md)
3. Start building features!
