# MindFuel AI API - Quick Reference

Quick reference guide for all API endpoints.

**Base URL:** `http://localhost:3000/api`

**Authentication:** Bearer token in Authorization header

---

## Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | User login |
| POST | `/auth/refresh` | No | Refresh access token |
| POST | `/auth/logout` | No | User logout |
| POST | `/auth/forgot-password` | No | Request password reset |
| POST | `/auth/reset-password` | No | Reset password with token |

---

## User Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/profile` | Yes | Get current user profile |
| PATCH | `/users/profile` | Yes | Update user profile |
| GET | `/users/workbooks` | Yes | Get user's workbooks |

---

## Content Taxonomy (Public)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/taxonomy/categories` | No | Get all categories |
| GET | `/taxonomy/subcategories` | No | Get all subcategories |
| GET | `/taxonomy/tags` | No | Get all tags |
| GET | `/taxonomy/browse/category/:slug` | No | Browse by category |
| GET | `/taxonomy/browse/subcategory/:slug` | No | Browse by subcategory |
| GET | `/taxonomy/browse/tag/:slug` | No | Browse by tag |

---

## Workbooks

| Method | Endpoint | Auth | Admin | Description |
|--------|----------|------|-------|-------------|
| GET | `/workbooks` | Yes | - | List workbooks |
| GET | `/workbooks/:id` | Yes | - | Get workbook details |
| POST | `/workbooks` | Yes | ✓ | Create workbook |
| PATCH | `/workbooks/:id` | Yes | ✓ | Update workbook |
| DELETE | `/workbooks/:id` | Yes | ✓ | Delete workbook |
| GET | `/workbooks/:id/chapters` | Yes | - | Get chapters |
| POST | `/workbooks/:id/chapters` | Yes | ✓ | Create chapter |

---

## Books & Library

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/books` | Yes | Get all books |
| GET | `/books/:id` | Yes | Get book by ID |
| GET | `/books/:bookId/chapters` | Yes | Get book chapters |
| GET | `/books/chapters/:chapterId/content` | Yes | Get chapter content |
| GET | `/library` | Yes | Get user's library |
| POST | `/library/add` | Yes | Add book to library |
| POST | `/library/progress` | Yes | Update reading progress |
| POST | `/library/bookmarks` | Yes | Create bookmark |
| POST | `/library/highlights` | Yes | Create highlight |
| POST | `/library/notes` | Yes | Create note |

---

## Products & Shop

| Method | Endpoint | Auth | Admin | Description |
|--------|----------|------|-------|-------------|
| GET | `/products` | Yes | - | List products |
| GET | `/products/:id` | Yes | - | Get product details |
| POST | `/products` | Yes | ✓ | Create product |
| PATCH | `/products/:id` | Yes | ✓ | Update product |
| DELETE | `/products/:id` | Yes | ✓ | Delete product |
| GET | `/shop/cart` | Yes | - | Get user cart |
| POST | `/shop/cart` | Yes | - | Add to cart |
| PUT | `/shop/cart/:itemId` | Yes | - | Update cart item |
| DELETE | `/shop/cart/:itemId` | Yes | - | Remove from cart |
| POST | `/shop/cart/coupon` | Yes | - | Apply coupon |

---

## Orders

| Method | Endpoint | Auth | Admin | Description |
|--------|----------|------|-------|-------------|
| GET | `/orders` | Yes | - | List user orders |
| GET | `/orders/:id` | Yes | - | Get order by ID |
| POST | `/orders` | Yes | - | Create order |
| POST | `/orders/verify` | Yes | - | Verify payment |
| GET | `/orders/admin/all` | Yes | ✓ | List all orders |

---

## Goals

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/goals` | Yes | List goals |
| GET | `/goals/:id` | Yes | Get goal by ID |
| POST | `/goals` | Yes | Create goal |
| PATCH | `/goals/:id` | Yes | Update goal |
| DELETE | `/goals/:id` | Yes | Delete goal |
| POST | `/goals/:id/progress` | Yes | Add goal progress |

---

## Journals

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/journals` | Yes | List journals |
| GET | `/journals/:id` | Yes | Get journal by ID |
| POST | `/journals` | Yes | Create journal |
| PATCH | `/journals/:id` | Yes | Update journal |
| DELETE | `/journals/:id` | Yes | Delete journal |

---

## Practices

| Method | Endpoint | Auth | Admin | Description |
|--------|----------|------|-------|-------------|
| GET | `/practices` | Yes | - | Get all practices |
| GET | `/practices/:id` | Yes | - | Get practice by ID |
| POST | `/practices` | Yes | ✓ | Create practice |
| POST | `/practices/sessions/start` | Yes | - | Start practice session |
| POST | `/practices/sessions/:id/complete` | Yes | - | Complete session |
| GET | `/practices/sessions/me` | Yes | - | Get user sessions |

---

## AI Coaching

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/ai/conversations` | Yes | List conversations |
| GET | `/ai/conversations/:id` | Yes | Get conversation |
| POST | `/ai/conversations` | Yes | Create conversation |
| POST | `/ai/messages` | Yes | Send message |
| DELETE | `/ai/conversations/:id` | Yes | Delete conversation |

---

## Quotes

| Method | Endpoint | Auth | Admin | Description |
|--------|----------|------|-------|-------------|
| GET | `/quotes/daily` | Yes | - | Get daily quote |
| GET | `/quotes` | Yes | ✓ | List quotes |
| POST | `/quotes` | Yes | ✓ | Create quote |
| PATCH | `/quotes/:id` | Yes | ✓ | Update quote |
| DELETE | `/quotes/:id` | Yes | ✓ | Delete quote |

---

## Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | Yes | List notifications |
| PATCH | `/notifications/:id/read` | Yes | Mark as read |
| POST | `/notifications/devices` | Yes | Register device |

---

## Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/dashboard` | Admin | Get dashboard stats |
| GET | `/admin/users` | Admin | Get all users |
| PUT | `/admin/users/:id/status` | Admin | Update user status |
| PUT | `/admin/users/:id/role` | Admin | Update user role |
| POST | `/admin/ingestion/books/:id` | Admin | Ingest book for AI |
| GET | `/admin/audit-logs` | Admin | Get audit logs |

---

## Analytics (Admin)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/analytics/dashboard` | Admin | Dashboard stats |
| GET | `/analytics/user-activity` | Admin | User activity |
| GET | `/analytics/revenue` | Admin | Revenue analytics |
| GET | `/analytics/workbooks` | Admin | Workbook analytics |

---

## File Uploads

| Method | Endpoint | Auth | Admin | Description |
|--------|----------|------|-------|-------------|
| POST | `/uploads/image` | Yes | - | Upload image |
| POST | `/uploads/file` | Yes | ✓ | Upload document |
| GET | `/uploads/:key` | Yes | - | Get file URL |

---

## Common Query Parameters

### Pagination
- `limit` - Number of items per page (default: 20, max: 100)
- `offset` - Number of items to skip (default: 0)

### Filtering
- `search` - Search query
- `category` - Filter by category
- `status` - Filter by status
- `startDate` - Filter from date (YYYY-MM-DD)
- `endDate` - Filter to date (YYYY-MM-DD)

### Sorting
- `sortBy` - Field to sort by
- `order` - Sort order (asc, desc)

---

## Response Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Request successful, no content to return |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

---

## Rate Limits

| Endpoint Type | Limit |
|--------------|-------|
| Auth endpoints | 5 requests / 15 minutes |
| API endpoints | 100 requests / 15 minutes |
| Strict endpoints | 10 requests / hour |

---

## Authentication

### Register/Login Response
```json
{
  "user": {...},
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

### Using Access Token
```
Authorization: Bearer {accessToken}
```

### Refreshing Token
```
POST /api/auth/refresh
Body: { "refreshToken": "..." }
```

---

## Postman Collection

Import the complete collection: `MindFuel_API_Complete.postman_collection.json`

**Variables to set:**
- `baseUrl` - API base URL (default: http://localhost:3000/api)
- `accessToken` - Auto-populated after login
- `refreshToken` - Auto-populated after login

---

## Complete Documentation

For detailed request/response examples and user flows, see:
- **API_USER_FLOWS.md** - Complete end-to-end user flows with examples
- **MindFuel_API_Complete.postman_collection.json** - Importable Postman collection

---

**Total Endpoints:** 172+
**Last Updated:** March 24, 2024
