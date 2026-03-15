# MindFuel AI - Complete API Endpoints Reference

Base URL: `http://localhost:3001/api`

## 🔐 Authentication Required
All endpoints except `/auth/register` and `/auth/login` require authentication.

**Header:**
```
Authorization: Bearer <access_token>
```

---

## 📋 Table of Contents
- [Authentication](#authentication)
- [Users](#users)
- [Books/Workbooks](#booksworkbooks)
- [Library](#library)
- [AI Chat](#ai-chat)
- [Shop](#shop)
- [Orders](#orders)
- [Goals](#goals)
- [Practices](#practices)
- [Journals](#journals)
- [Quotes](#quotes)
- [Analytics](#analytics)
- [Admin](#admin)
- [Uploads](#uploads)

---

## Authentication

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone_number": "+1234567890"
}

Response: 201
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "user@example.com", ... },
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "user@example.com", "role": "user" },
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "refresh_token"
}

Response: 200
{
  "success": true,
  "data": {
    "access_token": "new_jwt_token"
  }
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response: 200
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

## Users

### Get User Profile
```http
GET /users/profile
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone_number": "+1234567890",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Update Profile
```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "John Smith",
  "phone_number": "+1987654321"
}

Response: 200
{
  "success": true,
  "data": { ... }
}
```

### Get User Dashboard
```http
GET /users/dashboard
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": {
    "daily_quote": { "text": "...", "author": "..." },
    "continue_reading": { "book_id": "uuid", "title": "...", "progress": 45 },
    "stats": { "books_completed": 5, "reading_streak": 7, ... },
    "recommended_practice": { ... },
    "featured_products": [ ... ]
  }
}
```

### List Users (Admin)
```http
GET /users?page=1&limit=25&search=john
Authorization: Bearer <admin_token>

Response: 200
{
  "success": true,
  "data": {
    "users": [ ... ],
    "total": 100,
    "page": 1,
    "limit": 25
  }
}
```

### Update User Status (Admin)
```http
PATCH /users/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "active" // or "suspended"
}

Response: 200
{
  "success": true,
  "message": "User status updated"
}
```

---

## Books/Workbooks

### List Books
```http
GET /workbooks?page=1&limit=25&search=mindfulness
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": {
    "books": [
      {
        "id": "uuid",
        "title": "Mindful Living",
        "author": "John Doe",
        "cover_image_url": "https://...",
        "price": 19.99,
        "is_published": true,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 50
  }
}
```

### Get Book Details
```http
GET /workbooks/:id
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Mindful Living",
    "subtitle": "A guide to...",
    "description": "Full description...",
    "author": "John Doe",
    "cover_image_url": "https://...",
    "price": 19.99,
    "chapters_count": 12,
    "is_published": true
  }
}
```

### Create Book (Admin)
```http
POST /workbooks
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "New Book",
  "subtitle": "Subtitle here",
  "description": "Description...",
  "author": "Author Name",
  "cover_image_url": "https://...",
  "price": 29.99,
  "is_published": false
}

Response: 201
{
  "success": true,
  "data": { ... }
}
```

### Update Book (Admin)
```http
PUT /workbooks/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "is_published": true
}

Response: 200
{
  "success": true,
  "data": { ... }
}
```

### Delete Book (Admin)
```http
DELETE /workbooks/:id
Authorization: Bearer <admin_token>

Response: 200
{
  "success": true,
  "message": "Book deleted successfully"
}
```

### Get Book Chapters
```http
GET /workbooks/:id/chapters
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "book_id": "uuid",
      "chapter_number": 1,
      "title": "Introduction",
      "summary": "..."
    }
  ]
}
```

### Get Chapter Content
```http
GET /workbooks/:bookId/chapters/:chapterId
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Introduction",
    "chapter_number": 1,
    "sections": [
      {
        "id": "uuid",
        "section_number": 1,
        "title": "Getting Started",
        "content": "Full content here..."
      }
    ]
  }
}
```

---

## Library

### Get User Library
```http
GET /library?filter=all
Authorization: Bearer <token>

Query params:
- filter: all | reading | completed

Response: 200
{
  "success": true,
  "data": [
    {
      "book_id": "uuid",
      "title": "Mindful Living",
      "cover_image_url": "https://...",
      "progress_percentage": 45,
      "last_accessed": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Get Book Progress
```http
GET /library/progress/:bookId
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": {
    "book_id": "uuid",
    "current_chapter_id": "uuid",
    "current_section_id": "uuid",
    "page_number": 42,
    "progress_percentage": 45,
    "completed_chapters": ["uuid1", "uuid2"]
  }
}
```

### Update Reading Progress
```http
POST /library/progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "book_id": "uuid",
  "chapter_id": "uuid",
  "section_id": "uuid",
  "page_number": 42
}

Response: 200
{
  "success": true,
  "message": "Progress updated"
}
```

---

## AI Chat

### List Conversations
```http
GET /ai/conversations
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Chat about mindfulness",
      "last_message": "That's a great insight...",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Create Conversation
```http
POST /ai/conversations
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New conversation"
}

Response: 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "New conversation",
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

### Get Conversation Messages
```http
GET /ai/conversations/:id
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Chat about mindfulness",
    "messages": [
      {
        "id": "uuid",
        "role": "user",
        "content": "Tell me about mindfulness",
        "created_at": "2024-01-15T10:00:00Z"
      },
      {
        "id": "uuid",
        "role": "assistant",
        "content": "Mindfulness is...",
        "citations": [
          {
            "book_id": "uuid",
            "chapter_id": "uuid",
            "snippet": "..."
          }
        ],
        "created_at": "2024-01-15T10:00:15Z"
      }
    ]
  }
}
```

### Send Message
```http
POST /ai/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversation_id": "uuid",
  "message": "Tell me more about meditation",
  "context": {
    "book_id": "uuid",
    "chapter_id": "uuid",
    "section_id": "uuid",
    "page_number": 42
  }
}

Response: 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "role": "assistant",
    "content": "Meditation is a practice...",
    "citations": [ ... ],
    "recommendations": [ ... ]
  }
}
```

### Delete Conversation
```http
DELETE /ai/conversations/:id
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "message": "Conversation deleted"
}
```

### List Prompt Templates (Admin)
```http
GET /ai/prompts
Authorization: Bearer <admin_token>

Response: 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "General Chat",
      "context_type": "general",
      "system_prompt": "You are a mindfulness coach...",
      "is_active": true
    }
  ]
}
```

### Create Prompt Template (Admin)
```http
POST /ai/prompts
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Book Context Chat",
  "context_type": "book",
  "system_prompt": "You are helping users understand...",
  "guardrails": "Do not provide medical advice",
  "is_active": true
}

Response: 201
{
  "success": true,
  "data": { ... }
}
```

### List Model Configs (Admin)
```http
GET /ai/models
Authorization: Bearer <admin_token>

Response: 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "model_name": "gpt-4",
      "temperature": 0.7,
      "max_tokens": 1000,
      "is_active": true
    }
  ]
}
```

### Get AI Usage Stats (Admin)
```http
GET /ai/usage?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer <admin_token>

Response: 200
{
  "success": true,
  "data": {
    "total_queries": 1500,
    "total_tokens": 500000,
    "total_cost": 25.50,
    "daily_stats": [
      {
        "date": "2024-01-15",
        "queries": 50,
        "tokens": 15000,
        "cost": 0.75
      }
    ]
  }
}
```

---

## Shop

### List Products
```http
GET /products?page=1&limit=20&category=meditation&search=cushion
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Meditation Cushion",
        "description": "Comfortable cushion...",
        "price": 49.99,
        "category_id": "uuid",
        "image_url": "https://...",
        "stock_quantity": 50,
        "is_active": true
      }
    ],
    "total": 100
  }
}
```

### Get Product Details
```http
GET /products/:id
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Meditation Cushion",
    "description": "Full description...",
    "price": 49.99,
    "image_url": "https://...",
    "stock_quantity": 50,
    "category": { "id": "uuid", "name": "Meditation" }
  }
}
```

### Create Product (Admin)
```http
POST /products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "New Product",
  "description": "Description...",
  "price": 29.99,
  "category_id": "uuid",
  "image_url": "https://...",
  "stock_quantity": 100,
  "is_active": true
}

Response: 201
{
  "success": true,
  "data": { ... }
}
```

### List Categories
```http
GET /shop/categories
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Meditation",
      "description": "Meditation products",
      "product_count": 25
    }
  ]
}
```

### Get Cart
```http
GET /shop/cart
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "product_name": "Meditation Cushion",
        "price": 49.99,
        "quantity": 2,
        "subtotal": 99.98
      }
    ],
    "subtotal": 99.98,
    "tax": 8.00,
    "total": 107.98
  }
}
```

### Add to Cart
```http
POST /shop/cart/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "product_id": "uuid",
  "quantity": 2
}

Response: 201
{
  "success": true,
  "data": { ... }
}
```

### Update Cart Item
```http
PUT /shop/cart/items/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 3
}

Response: 200
{
  "success": true,
  "data": { ... }
}
```

### Remove from Cart
```http
DELETE /shop/cart/items/:id
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "message": "Item removed from cart"
}
```

---

## Orders

### Create Order
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "shipping_address": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94102",
    "country": "USA"
  },
  "payment_method": "razorpay",
  "coupon_code": "SAVE10"
}

Response: 201
{
  "success": true,
  "data": {
    "order_id": "uuid",
    "order_number": "ORD-2024-001",
    "total_amount": 107.98,
    "payment_url": "https://razorpay.com/pay/..."
  }
}
```

### List Orders
```http
GET /orders?page=1&limit=10&status=completed
Authorization: Bearer <token>

Query params:
- status: pending | processing | completed | cancelled
- payment_status: pending | paid | failed | refunded
- start_date: 2024-01-01
- end_date: 2024-01-31

Response: 200
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "uuid",
        "order_number": "ORD-2024-001",
        "total_amount": 107.98,
        "status": "completed",
        "payment_status": "paid",
        "created_at": "2024-01-15T10:00:00Z"
      }
    ],
    "total": 50
  }
}
```

### Get Order Details
```http
GET /orders/:id
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "order_number": "ORD-2024-001",
    "status": "completed",
    "payment_status": "paid",
    "items": [
      {
        "product_name": "Meditation Cushion",
        "quantity": 2,
        "price": 49.99,
        "subtotal": 99.98
      }
    ],
    "subtotal": 99.98,
    "tax": 8.00,
    "total_amount": 107.98,
    "shipping_address": { ... },
    "payment_details": { ... }
  }
}
```

### Update Order Status (Admin)
```http
PATCH /orders/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "processing",
  "payment_status": "paid"
}

Response: 200
{
  "success": true,
  "data": { ... }
}
```

---

## Goals

### List Goals
```http
GET /goals
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Meditate daily",
      "description": "Practice meditation every day",
      "category": "mindfulness",
      "target_date": "2024-12-31",
      "progress_percentage": 60,
      "is_completed": false
    }
  ]
}
```

### Create Goal
```http
POST /goals
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Read 12 books",
  "description": "Read one book per month",
  "category": "learning",
  "target_date": "2024-12-31",
  "milestones": [
    { "title": "Read 3 books", "target_date": "2024-03-31" }
  ]
}

Response: 201
{
  "success": true,
  "data": { ... }
}
```

### Update Goal
```http
PUT /goals/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "progress_percentage": 75,
  "is_completed": false
}

Response: 200
{
  "success": true,
  "data": { ... }
}
```

### Delete Goal
```http
DELETE /goals/:id
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "message": "Goal deleted successfully"
}
```

---

## Practices

### List Practices
```http
GET /practices?category=meditation
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "5-Minute Breathing Exercise",
      "description": "A quick breathing practice",
      "category": "meditation",
      "duration_minutes": 5,
      "difficulty": "beginner"
    }
  ]
}
```

### Get Practice Details
```http
GET /practices/:id
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "5-Minute Breathing Exercise",
    "description": "Full description...",
    "category": "meditation",
    "duration_minutes": 5,
    "steps": [
      {
        "step_number": 1,
        "title": "Find a comfortable position",
        "instruction": "Sit comfortably with your back straight...",
        "duration_seconds": 30
      }
    ]
  }
}
```

### Mark Practice Complete
```http
POST /practices/:id/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "duration_minutes": 5,
  "notes": "Felt very relaxed"
}

Response: 200
{
  "success": true,
  "message": "Practice completed",
  "data": {
    "streak": 7,
    "total_completed": 42
  }
}
```

---

## Journals

### List Journals
```http
GET /journals?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Morning Reflection",
      "content_preview": "Today I feel grateful...",
      "mood": "happy",
      "created_at": "2024-01-15T08:00:00Z"
    }
  ]
}
```

### Create Journal
```http
POST /journals
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Evening Reflection",
  "content": "Full journal entry...",
  "mood": "calm",
  "tags": ["gratitude", "reflection"]
}

Response: 201
{
  "success": true,
  "data": { ... }
}
```

### Get Journal
```http
GET /journals/:id
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Evening Reflection",
    "content": "Full content...",
    "mood": "calm",
    "tags": ["gratitude"],
    "created_at": "2024-01-15T20:00:00Z"
  }
}
```

### Update Journal
```http
PUT /journals/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content..."
}

Response: 200
{
  "success": true,
  "data": { ... }
}
```

### Delete Journal
```http
DELETE /journals/:id
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "message": "Journal deleted successfully"
}
```

---

## Quotes

### List Quotes
```http
GET /quotes?page=1&limit=25&search=peace
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": {
    "quotes": [
      {
        "id": "uuid",
        "text": "Peace comes from within...",
        "author": "Buddha",
        "source_book_id": "uuid",
        "is_active": true,
        "created_at": "2024-01-15T00:00:00Z"
      }
    ],
    "total": 100
  }
}
```

### Get Daily Quote
```http
GET /quotes/daily
Authorization: Bearer <token>

Response: 200
{
  "success": true,
  "data": {
    "text": "Peace comes from within...",
    "author": "Buddha"
  }
}
```

### Create Quote (Admin)
```http
POST /quotes
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "text": "Mindfulness is the aware...",
  "author": "Jon Kabat-Zinn",
  "source_book_id": "uuid",
  "is_active": true
}

Response: 201
{
  "success": true,
  "data": { ... }
}
```

### Update Quote (Admin)
```http
PUT /quotes/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "is_active": false
}

Response: 200
{
  "success": true,
  "data": { ... }
}
```

### Delete Quote (Admin)
```http
DELETE /quotes/:id
Authorization: Bearer <admin_token>

Response: 200
{
  "success": true,
  "message": "Quote deleted successfully"
}
```

---

## Analytics

### Dashboard Stats (Admin)
```http
GET /analytics/dashboard
Authorization: Bearer <admin_token>

Response: 200
{
  "success": true,
  "data": {
    "total_users": 1500,
    "active_users_30d": 800,
    "total_books": 50,
    "total_orders": 300,
    "total_revenue": 15000.00,
    "ai_queries_count": 5000,
    "token_usage": 2000000,
    "token_cost": 100.00,
    "top_books": [
      { "title": "Mindful Living", "sales": 120 }
    ],
    "recent_orders": [ ... ],
    "ai_usage_chart": [
      { "date": "2024-01-15", "queries": 150, "tokens": 50000 }
    ]
  }
}
```

---

## Admin

### List Ingestion Status
```http
GET /admin/ingestion/books
Authorization: Bearer <admin_token>

Response: 200
{
  "success": true,
  "data": [
    {
      "book_id": "uuid",
      "title": "Mindful Living",
      "embedding_status": "completed",
      "chunk_count": 250,
      "last_ingestion_date": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### Trigger Book Ingestion
```http
POST /admin/ingestion/books/:id
Authorization: Bearer <admin_token>

Response: 200
{
  "success": true,
  "message": "Ingestion started",
  "job_id": "uuid"
}
```

---

## Uploads

### Upload File
```http
POST /uploads
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary>
folder: "book-covers" | "product-images" | "avatars"

Response: 200
{
  "success": true,
  "data": {
    "url": "https://s3.amazonaws.com/bucket/file.jpg",
    "key": "book-covers/uuid.jpg"
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

- **General endpoints**: 100 requests per minute per user
- **AI endpoints**: 20 requests per minute per user
- **Authentication**: 10 requests per minute per IP

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705320000
```

---

## Pagination

All list endpoints support pagination:

Query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 25, max: 100)

Response format:
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "total": 150,
    "page": 1,
    "limit": 25,
    "total_pages": 6
  }
}
```

---

## Filtering & Sorting

Common query parameters:
- `search`: Full-text search
- `sort_by`: Field to sort by
- `sort_order`: `asc` or `desc`
- `filter`: Apply filters (endpoint-specific)
- `start_date`: Filter by date range start
- `end_date`: Filter by date range end

Example:
```http
GET /products?search=meditation&sort_by=price&sort_order=asc&filter=active
```

---

This API documentation covers all endpoints in the MindFuel AI platform. For more details, see the full implementation in the codebase.
