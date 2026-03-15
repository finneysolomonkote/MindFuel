# API Documentation

## Base URL

```
http://localhost:3001/api
```

## Authentication

All endpoints (except auth endpoints) require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

All responses follow this format:

```json
{
  "success": true,
  "data": {},
  "error": "error message if any",
  "message": "optional message"
}
```

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Endpoints

### Authentication

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone_number": "+1234567890"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_in": 604800
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Users

#### Get Profile
```http
GET /users/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PATCH /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "Jane Doe",
  "phone_number": "+1234567890"
}
```

### Workbooks

#### List Workbooks
```http
GET /workbooks
Authorization: Bearer <token>
```

#### Get Workbook
```http
GET /workbooks/:id
Authorization: Bearer <token>
```

#### Create Workbook (Admin)
```http
POST /workbooks
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Workbook Title",
  "description": "Description",
  "author": "Author Name",
  "cover_image_url": "https://example.com/image.jpg",
  "category": "Self-Improvement",
  "tags": ["motivation", "growth"],
  "is_free": false
}
```

### Products

#### List Products
```http
GET /products
Authorization: Bearer <token>
```

#### Create Product (Admin)
```http
POST /products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Description",
  "product_type": "workbook",
  "workbook_id": "uuid",
  "price": 999,
  "currency": "INR",
  "features": ["Feature 1", "Feature 2"]
}
```

### Orders

#### Create Order
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "product_id": "uuid"
}
```

Response includes Razorpay order details for payment.

#### Verify Payment
```http
POST /orders/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "order_id": "uuid",
  "razorpay_order_id": "order_xyz",
  "razorpay_payment_id": "pay_xyz",
  "razorpay_signature": "signature"
}
```

### Goals

#### List Goals
```http
GET /goals
Authorization: Bearer <token>
```

#### Create Goal
```http
POST /goals
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Goal Title",
  "description": "Goal description",
  "category": "personal",
  "target_date": "2024-12-31T00:00:00Z"
}
```

#### Add Progress
```http
POST /goals/:id/progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "goal_id": "uuid",
  "note": "Progress note",
  "progress_percentage": 50
}
```

### Journals

#### List Journals
```http
GET /journals
Authorization: Bearer <token>
```

#### Create Journal
```http
POST /journals
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Journal Title",
  "content": "Journal content",
  "mood": "good",
  "tags": ["reflection", "growth"]
}
```

### AI

#### Create Conversation
```http
POST /ai/conversations
Authorization: Bearer <token>
Content-Type: application/json

{
  "context_type": "general",
  "context_id": "optional_uuid",
  "title": "Optional title"
}
```

#### Send Message
```http
POST /ai/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversation_id": "uuid",
  "content": "How can I improve my productivity?"
}
```

Response includes AI-generated response.

### Notifications

#### List Notifications
```http
GET /notifications
Authorization: Bearer <token>
```

#### Register Device
```http
POST /notifications/devices
Authorization: Bearer <token>
Content-Type: application/json

{
  "device_token": "firebase_token",
  "device_type": "ios"
}
```

### Analytics (Admin)

#### Dashboard Stats
```http
GET /analytics/dashboard
Authorization: Bearer <admin_token>
```

Response:
```json
{
  "success": true,
  "data": {
    "total_users": 1000,
    "active_users_30d": 500,
    "total_workbooks": 50,
    "total_orders": 200,
    "revenue_total": 50000,
    "revenue_30d": 10000
  }
}
```

## Rate Limiting

(To be implemented)
- 100 requests per minute per IP
- 1000 requests per hour per user

## Webhooks

### Razorpay Payment Webhook
```http
POST /webhooks/razorpay
Content-Type: application/json
X-Razorpay-Signature: signature

{
  "event": "payment.captured",
  "payload": { ... }
}
```

## Pagination

List endpoints support pagination with query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `sortBy` - Field to sort by
- `sortOrder` - "asc" or "desc"

Example:
```http
GET /workbooks?page=1&limit=10&sortBy=created_at&sortOrder=desc
```

## Filtering

List endpoints support filtering with query parameters based on fields.

Example:
```http
GET /workbooks?category=Self-Improvement&is_free=true
```
