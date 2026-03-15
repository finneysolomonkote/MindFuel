# MindFuel AI Mobile App

## Overview
Complete production-ready React Native CLI mobile application for MindFuel AI - your personal AI-powered companion for self-growth and mindfulness.

## Architecture

### Directory Structure
```
src/
├── components/          # Reusable UI components
│   ├── Avatar.tsx
│   ├── Badge.tsx
│   ├── BookCard.tsx
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── EmptyState.tsx
│   ├── ErrorBoundary.tsx
│   ├── Input.tsx
│   ├── LoadingSpinner.tsx
│   ├── ProductCard.tsx
│   ├── ProgressBar.tsx
│   └── QuoteCard.tsx
│
├── navigation/          # Navigation structure
│   ├── RootNavigator.tsx
│   ├── AuthNavigator.tsx
│   └── MainNavigator.tsx
│
├── screens/            # All application screens
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── ForgotPasswordScreen.tsx
│   │   └── OnboardingScreen.tsx
│   ├── home/
│   │   └── HomeScreen.tsx
│   ├── ai/
│   │   ├── AIConversationsScreen.tsx
│   │   └── AIChatScreen.tsx
│   ├── library/
│   │   ├── LibraryScreen.tsx
│   │   ├── BookDetailsScreen.tsx
│   │   ├── ReaderScreen.tsx
│   │   └── ChaptersScreen.tsx
│   ├── shop/
│   │   ├── ShopScreen.tsx
│   │   ├── ProductDetailScreen.tsx
│   │   ├── CartScreen.tsx
│   │   └── CheckoutScreen.tsx
│   ├── profile/
│   │   ├── ProfileScreen.tsx
│   │   ├── EditProfileScreen.tsx
│   │   └── SettingsScreen.tsx
│   └── goals/
│       └── GoalsScreen.tsx
│
├── services/           # API integration
│   └── api.ts         # Comprehensive API client with auth interceptors
│
├── store/             # Redux state management
│   ├── index.ts
│   └── slices/
│       ├── authSlice.ts
│       ├── booksSlice.ts
│       ├── aiSlice.ts
│       ├── shopSlice.ts
│       ├── goalsSlice.ts
│       └── profileSlice.ts
│
└── types/             # TypeScript type definitions
    └── index.ts
```

## Features

### Authentication Flow
- **LoginScreen**: Email/password login with validation
- **RegisterScreen**: Full registration with form validation
- **ForgotPasswordScreen**: Password reset flow
- **OnboardingScreen**: Welcome slides and goal selection

### Home Dashboard
- Personalized greeting
- Daily motivational quote with gradient background
- Continue reading card with progress tracking
- AI coach quick access
- Progress summary (books, streak, practices, journals)
- Recommended daily practice
- Featured products carousel
- Pull-to-refresh functionality

### AI Chat System
- Real-time conversation with AI coach
- Message history with citations
- Context-aware responses (book/chapter/section context)
- Typing indicators
- "Ask AI about this page" from reader
- Conversation management

### Book Reader
- Library view with filters (All, Reading, Completed)
- Book details with cover, description, progress
- Chapter-by-chapter navigation
- Section-based reading with pagination
- Progress tracking (automatic updates)
- Bookmarks support
- Reading statistics

### Shop
- Product grid with search
- Category filtering
- Product details with images
- Quantity selector
- Cart management
- Checkout with shipping address
- Order history
- Razorpay payment integration

### Profile & Settings
- User profile with avatar
- Reading statistics
- Goals and preferences
- Notification settings
- Theme selection
- Account management

### Goals & Practices
- Goal tracking with progress bars
- Practice library by category
- Step-by-step practice guidance
- Journal entries with mood tracking
- Daily recommendations

## Technical Implementation

### API Service (`services/api.ts`)
Complete API client with:
- Axios instance with configurable base URL
- Request interceptor for auth token injection
- Response interceptor for 401 handling and token refresh
- Typed API methods for all endpoints:
  - Authentication (login, register, logout, forgot password)
  - User management (profile, preferences, dashboard)
  - Library & Books (workbooks, chapters, progress)
  - AI (conversations, messages, context-aware chat)
  - Shop (products, cart, orders, categories)
  - Goals, Practices, Journals
- Comprehensive error handling
- Token storage with AsyncStorage

### Redux Store
Centralized state management with 6 slices:

1. **authSlice**: User authentication, tokens, login/logout
2. **booksSlice**: Library, current book, chapters, progress
3. **aiSlice**: Conversations, messages, typing state
4. **shopSlice**: Products, cart, categories, orders
5. **goalsSlice**: Goals, practices, journals
6. **profileSlice**: User profile, preferences, settings

Each slice includes:
- Async thunks for API calls
- Loading/error states
- Optimistic UI updates where appropriate

### Navigation Structure

**RootNavigator**: Handles auth state
- AuthNavigator (unauthenticated)
- MainNavigator (authenticated)

**AuthNavigator**: Stack navigator
- Login → Register → ForgotPassword → Onboarding

**MainNavigator**: Bottom tabs with nested stacks
- Home Tab (Home, BookDetails, Reader)
- AI Tab (Conversations, Chat)
- Library Tab (Library, BookDetails, Reader, Chapters)
- Shop Tab (Shop, ProductDetail, Cart, Checkout, Orders)
- Profile Tab (Profile, EditProfile, Settings, Goals)

### Type Safety
Comprehensive TypeScript interfaces for:
- User, Book, Chapter, Section, LibraryBook
- AIConversation, AIMessage with citations
- Product, Cart, Order, Address
- Goal, Practice, Journal
- Navigation param lists
- API request/response types

## Component Library

### Core Components
- **Button**: Primary, secondary, outline variants with loading state
- **Input**: Text input with label, error, icon support
- **Card**: Container with elevation variants
- **LoadingSpinner**: Full screen and inline loading states
- **EmptyState**: Consistent empty state UI with action

### Domain Components
- **BookCard**: Book display with cover, progress bar
- **ProductCard**: Product display with price, stock status
- **QuoteCard**: Daily quote with gradient background
- **ProgressBar**: Configurable progress indicator
- **Avatar**: User avatar with initials fallback
- **Badge**: Notification badge with count

### Utility Components
- **ErrorBoundary**: Error catching and recovery

## Design System

### Colors
- Primary: #4A90E2 (Blue)
- Secondary: #6C63FF (Purple)
- Success: #4CAF50 (Green)
- Error: #FF6B6B (Red)
- Warning: #FF9500 (Orange)
- Background: #F8F9FA
- Text: #333333
- Text Secondary: #666666

### Typography
- Headings: 20-28px, Bold (700)
- Body: 16px, Regular (400)
- Small: 12-14px, Medium (600)

### Spacing
- Base unit: 4px
- Padding: 16px, 20px, 24px
- Margins: 8px, 12px, 16px, 24px

### Elevation
- Cards: shadowOpacity 0.1, shadowRadius 8, elevation 3
- Buttons: shadowOpacity 0.15, shadowRadius 12, elevation 6

## Key Features Implementation

### Authentication
- Form validation with react-hook-form patterns
- Secure token storage with AsyncStorage
- Automatic token refresh on 401
- Persistent login state check on app launch

### Reading Experience
- Smooth pagination between sections
- Auto-save progress on page turn
- Chapter completion tracking
- Floating "Ask AI" button for contextual help

### AI Integration
- Context-aware conversations (sends book/chapter/section IDs)
- Message history with citations
- Real-time typing indicators
- Suggested prompts for new conversations

### Shopping Cart
- Real-time cart updates
- Quantity controls with stock validation
- Coupon code support
- Order summary with tax calculation

### Progress Tracking
- Reading streaks
- Books completed counter
- Practices completed
- Journal entries count

## API Endpoints Used

### Auth
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/logout
- POST /api/auth/forgot-password
- POST /api/auth/refresh

### Users
- GET /api/users/profile
- PUT /api/users/profile
- GET /api/users/dashboard
- PUT /api/users/preferences

### Library & Books
- GET /api/library
- GET /api/library/:bookId
- POST /api/library/:bookId/progress
- GET /api/workbooks/:id
- GET /api/workbooks/:id/chapters
- GET /api/workbooks/:id/chapters/:chapterId

### AI
- GET /api/ai/conversations
- GET /api/ai/conversations/:id
- GET /api/ai/conversations/:id/messages
- POST /api/ai/messages
- POST /api/ai/conversations/:id/messages
- DELETE /api/ai/conversations/:id

### Shop
- GET /api/products
- GET /api/products/:id
- GET /api/shop/categories
- GET /api/shop/cart
- POST /api/shop/cart/items
- PUT /api/shop/cart/items/:id
- DELETE /api/shop/cart/items/:id

### Orders
- POST /api/orders
- GET /api/orders
- GET /api/orders/:id

### Goals & Practices
- GET /api/goals
- POST /api/goals
- PUT /api/goals/:id
- GET /api/practices
- GET /api/practices/:id
- POST /api/practices/:id/complete

### Journals
- GET /api/journals
- POST /api/journals
- PUT /api/journals/:id
- DELETE /api/journals/:id

## Installation

```bash
# Install dependencies
npm install

# iOS
cd ios && pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android
```

## Environment Variables

Create `.env` file:
```
API_URL=http://localhost:3000/api  # Development
# API_URL=https://api.mindfuel.ai/api  # Production
```

## Dependencies

Core:
- react-native
- @react-navigation/native
- @react-navigation/native-stack
- @react-navigation/bottom-tabs
- @reduxjs/toolkit
- react-redux
- axios
- @react-native-async-storage/async-storage

UI:
- react-native-safe-area-context
- react-native-screens
- expo-linear-gradient (for gradients)

## Best Practices

1. **Type Safety**: All components and functions are fully typed
2. **Error Handling**: Try/catch blocks with user-friendly error messages
3. **Loading States**: Loading indicators for all async operations
4. **Optimistic Updates**: UI updates before API confirmation where appropriate
5. **Validation**: Form validation on both client and server
6. **Authentication**: Secure token management with refresh logic
7. **Navigation**: Type-safe navigation with proper param passing
8. **State Management**: Centralized Redux store with logical separation
9. **API Layer**: Single source of truth for API calls
10. **Reusability**: Shared components for consistent UI

## Production Considerations

- Image optimization and lazy loading
- Error boundary for crash recovery
- Analytics integration points
- Performance monitoring
- Offline support considerations
- Deep linking setup
- Push notifications infrastructure
- App store optimization
- Code splitting where applicable
- Accessibility labels (needs enhancement)

## Future Enhancements

- Offline mode with local storage
- Social sharing features
- In-app notifications
- Advanced search and filters
- Practice reminders
- Reading goals and challenges
- Community features
- Enhanced analytics dashboard
- Voice input for journaling
- PDF export for journals
- Accessibility improvements

## License
Proprietary - MindFuel AI
