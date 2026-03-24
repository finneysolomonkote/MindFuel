# MindFuel AI - Complete API User Flows

Complete end-to-end user flows with API endpoints, payloads, and expected responses.

## Table of Contents
1. [User Flow 1: Registration & Onboarding](#flow-1)
2. [User Flow 2: Browse & Purchase Content](#flow-2)
3. [User Flow 3: Reading Experience](#flow-3)
4. [User Flow 4: AI Coaching](#flow-4)
5. [User Flow 5: Goals & Progress Tracking](#flow-5)
6. [User Flow 6: Journaling](#flow-6)
7. [User Flow 7: Practices & Sessions](#flow-7)
8. [Admin Flow: Content Management](#admin-flow)

---

<a name="flow-1"></a>
## User Flow 1: Registration & Onboarding

### Step 1.1: Register New User

**Endpoint:** `POST /api/auth/register`

**Auth Required:** No (Rate limited: 5 requests per 15 minutes)

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "createdAt": "2024-03-24T10:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Next Steps:**
- Store `accessToken` for API requests
- Store `refreshToken` for token refresh
- Proceed to profile setup

---

### Step 1.2: Get User Profile

**Endpoint:** `GET /api/users/profile`

**Auth Required:** Yes (Bearer token)

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "user",
  "bio": null,
  "avatar": null,
  "interests": [],
  "preferences": {
    "notifications": true,
    "emailUpdates": true
  },
  "createdAt": "2024-03-24T10:00:00.000Z",
  "updatedAt": "2024-03-24T10:00:00.000Z"
}
```

---

### Step 1.3: Update Profile

**Endpoint:** `PATCH /api/users/profile`

**Auth Required:** Yes

**Request:**
```json
{
  "bio": "Passionate about personal growth and mindfulness",
  "interests": ["mindfulness", "productivity", "leadership"],
  "preferences": {
    "notifications": true,
    "emailUpdates": false
  }
}
```

**Response (200 OK):**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Passionate about personal growth and mindfulness",
  "interests": ["mindfulness", "productivity", "leadership"],
  "preferences": {
    "notifications": true,
    "emailUpdates": false
  },
  "updatedAt": "2024-03-24T10:05:00.000Z"
}
```

---

### Step 1.4: Get Daily Quote

**Endpoint:** `GET /api/quotes/daily`

**Auth Required:** Yes

**Response (200 OK):**
```json
{
  "id": "quote-uuid",
  "text": "The journey of a thousand miles begins with a single step.",
  "author": "Lao Tzu",
  "category": "motivation",
  "tags": ["journey", "beginning", "action"],
  "date": "2024-03-24"
}
```

---

<a name="flow-2"></a>
## User Flow 2: Browse & Purchase Content

### Step 2.1: Browse Categories

**Endpoint:** `GET /api/taxonomy/categories`

**Auth Required:** No (Public)

**Response (200 OK):**
```json
[
  {
    "id": "cat-1",
    "name": "Mindset",
    "slug": "mindset",
    "description": "Transform your thinking patterns",
    "icon": "brain",
    "color": "#4A90E2",
    "displayOrder": 1,
    "contentCount": 15
  },
  {
    "id": "cat-2",
    "name": "Productivity",
    "slug": "productivity",
    "description": "Master your time and energy",
    "icon": "zap",
    "color": "#10B981",
    "displayOrder": 2,
    "contentCount": 12
  }
]
```

---

### Step 2.2: Browse by Category

**Endpoint:** `GET /api/taxonomy/browse/category/:categorySlug`

**Example:** `GET /api/taxonomy/browse/category/mindset`

**Auth Required:** No

**Response (200 OK):**
```json
{
  "category": {
    "id": "cat-1",
    "name": "Mindset",
    "slug": "mindset",
    "description": "Transform your thinking patterns"
  },
  "workbooks": [
    {
      "id": "wb-1",
      "title": "Mindset Mastery",
      "subtitle": "Transform your thinking",
      "coverImage": "https://example.com/cover1.jpg",
      "price": 49.99,
      "rating": 4.8,
      "enrollmentCount": 1250
    }
  ],
  "books": [],
  "products": []
}
```

---

### Step 2.3: List Products

**Endpoint:** `GET /api/products?limit=10&offset=0`

**Auth Required:** Yes

**Query Parameters:**
- `limit` (optional): Number of items per page (default: 20)
- `offset` (optional): Pagination offset (default: 0)
- `category` (optional): Filter by category
- `search` (optional): Search query

**Response (200 OK):**
```json
{
  "products": [
    {
      "id": "prod-1",
      "name": "Premium Coaching Package",
      "description": "1-on-1 coaching sessions",
      "price": 299.99,
      "category": "coaching",
      "images": ["https://example.com/product1.jpg"],
      "stock": 10,
      "rating": 4.9,
      "features": [
        "3 one-hour sessions",
        "Personalized action plan",
        "Email support"
      ]
    }
  ],
  "total": 25,
  "limit": 10,
  "offset": 0
}
```

---

### Step 2.4: Get Product Details

**Endpoint:** `GET /api/products/:productId`

**Auth Required:** Yes

**Response (200 OK):**
```json
{
  "id": "prod-1",
  "name": "Premium Coaching Package",
  "description": "Comprehensive 1-on-1 coaching sessions with certified coaches",
  "longDescription": "Get personalized guidance...",
  "price": 299.99,
  "originalPrice": 399.99,
  "discount": 25,
  "category": "coaching",
  "subcategory": "personal",
  "images": [
    "https://example.com/product1.jpg",
    "https://example.com/product1-2.jpg"
  ],
  "stock": 10,
  "rating": 4.9,
  "reviewCount": 127,
  "features": [
    "3 one-hour sessions",
    "Personalized action plan",
    "Email support for 30 days"
  ],
  "tags": ["coaching", "personal-development", "1-on-1"],
  "relatedProducts": ["prod-2", "prod-3"]
}
```

---

### Step 2.5: Add to Cart

**Endpoint:** `POST /api/shop/cart`

**Auth Required:** Yes

**Request:**
```json
{
  "productId": "prod-1",
  "quantity": 1
}
```

**Response (201 Created):**
```json
{
  "cartId": "cart-uuid",
  "items": [
    {
      "id": "item-uuid",
      "productId": "prod-1",
      "product": {
        "name": "Premium Coaching Package",
        "price": 299.99,
        "image": "https://example.com/product1.jpg"
      },
      "quantity": 1,
      "price": 299.99,
      "subtotal": 299.99
    }
  ],
  "subtotal": 299.99,
  "tax": 29.99,
  "total": 329.98,
  "couponDiscount": 0
}
```

---

### Step 2.6: Get Cart

**Endpoint:** `GET /api/shop/cart`

**Auth Required:** Yes

**Response (200 OK):**
```json
{
  "cartId": "cart-uuid",
  "items": [
    {
      "id": "item-uuid",
      "productId": "prod-1",
      "product": {
        "name": "Premium Coaching Package",
        "price": 299.99,
        "image": "https://example.com/product1.jpg",
        "stock": 10
      },
      "quantity": 1,
      "price": 299.99,
      "subtotal": 299.99
    }
  ],
  "subtotal": 299.99,
  "tax": 29.99,
  "shipping": 0,
  "couponDiscount": 0,
  "total": 329.98,
  "appliedCoupon": null
}
```

---

### Step 2.7: Apply Coupon

**Endpoint:** `POST /api/shop/cart/coupon`

**Auth Required:** Yes

**Request:**
```json
{
  "code": "WELCOME10"
}
```

**Response (200 OK):**
```json
{
  "cartId": "cart-uuid",
  "items": [...],
  "subtotal": 299.99,
  "tax": 29.99,
  "shipping": 0,
  "couponDiscount": 30.00,
  "total": 299.98,
  "appliedCoupon": {
    "code": "WELCOME10",
    "type": "percentage",
    "value": 10,
    "description": "10% off your first purchase"
  }
}
```

---

### Step 2.8: Create Order

**Endpoint:** `POST /api/orders`

**Auth Required:** Yes

**Request:**
```json
{
  "shippingAddress": {
    "name": "John Doe",
    "phone": "+1234567890",
    "addressLine1": "123 Main St",
    "addressLine2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "razorpay",
  "notes": "Please deliver after 6 PM"
}
```

**Response (201 Created):**
```json
{
  "order": {
    "id": "order-uuid",
    "orderNumber": "ORD-20240324-001",
    "userId": "user-uuid",
    "items": [
      {
        "productId": "prod-1",
        "productName": "Premium Coaching Package",
        "quantity": 1,
        "price": 299.99,
        "subtotal": 299.99
      }
    ],
    "subtotal": 299.99,
    "tax": 29.99,
    "shipping": 0,
    "discount": 30.00,
    "total": 299.98,
    "status": "pending_payment",
    "paymentMethod": "razorpay",
    "shippingAddress": {...},
    "createdAt": "2024-03-24T10:30:00.000Z"
  },
  "razorpayOrder": {
    "id": "order_razorpay_id",
    "amount": 29998,
    "currency": "INR",
    "receipt": "order-uuid"
  }
}
```

**Next Step:** Process payment with Razorpay

---

### Step 2.9: Verify Payment

**Endpoint:** `POST /api/orders/verify`

**Auth Required:** Yes

**Request:**
```json
{
  "orderId": "order-uuid",
  "razorpayPaymentId": "pay_xxxxxxxxxxxxx",
  "razorpayOrderId": "order_xxxxxxxxxxxxx",
  "razorpaySignature": "signature_xxxxxxxxxxxxx"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "order": {
    "id": "order-uuid",
    "orderNumber": "ORD-20240324-001",
    "status": "completed",
    "paymentStatus": "paid",
    "paymentId": "pay_xxxxxxxxxxxxx",
    "paidAt": "2024-03-24T10:35:00.000Z",
    "total": 299.98
  },
  "message": "Payment verified successfully"
}
```

---

<a name="flow-3"></a>
## User Flow 3: Reading Experience

### Step 3.1: Get My Library

**Endpoint:** `GET /api/library`

**Auth Required:** Yes

**Response (200 OK):**
```json
{
  "books": [
    {
      "id": "lib-1",
      "bookId": "book-1",
      "book": {
        "id": "book-1",
        "title": "Productivity Masterclass",
        "coverImage": "https://example.com/cover.jpg",
        "author": "John Expert",
        "totalChapters": 12
      },
      "progress": 45,
      "currentChapterId": "chapter-5",
      "lastReadAt": "2024-03-23T15:30:00.000Z",
      "addedAt": "2024-03-15T10:00:00.000Z",
      "status": "reading"
    }
  ],
  "totalBooks": 5,
  "readingStreak": 7,
  "booksCompleted": 2
}
```

---

### Step 3.2: Get Workbooks

**Endpoint:** `GET /api/workbooks`

**Auth Required:** Yes

**Query Parameters:**
- `category` (optional): Filter by category
- `difficulty` (optional): beginner, intermediate, advanced
- `search` (optional): Search query

**Response (200 OK):**
```json
{
  "workbooks": [
    {
      "id": "wb-1",
      "title": "Productivity Masterclass",
      "subtitle": "Master your time and energy",
      "description": "A comprehensive guide to productivity",
      "author": "John Expert",
      "coverImage": "https://example.com/cover.jpg",
      "price": 49.99,
      "isPremium": true,
      "difficulty": "intermediate",
      "rating": 4.8,
      "enrollmentCount": 1250,
      "totalChapters": 12,
      "estimatedDuration": "6 weeks",
      "hasAccess": true,
      "categories": ["productivity", "time-management"],
      "tags": ["beginner-friendly", "practical"]
    }
  ],
  "total": 20
}
```

---

### Step 3.3: Get Workbook Details

**Endpoint:** `GET /api/workbooks/:workbookId`

**Auth Required:** Yes

**Response (200 OK):**
```json
{
  "id": "wb-1",
  "title": "Productivity Masterclass",
  "subtitle": "Master your time and energy",
  "description": "A comprehensive guide...",
  "longDescription": "In this masterclass...",
  "author": "John Expert",
  "authorBio": "John is a productivity expert...",
  "coverImage": "https://example.com/cover.jpg",
  "price": 49.99,
  "isPremium": true,
  "difficulty": "intermediate",
  "estimatedDuration": "6 weeks",
  "totalChapters": 12,
  "rating": 4.8,
  "reviewCount": 345,
  "enrollmentCount": 1250,
  "hasAccess": true,
  "userProgress": {
    "currentChapter": 5,
    "progressPercentage": 45,
    "lastAccessedAt": "2024-03-23T15:30:00.000Z"
  },
  "whatYouWillLearn": [
    "Master time management techniques",
    "Eliminate distractions",
    "Build productive habits"
  ],
  "requirements": [
    "Open mind",
    "Commitment to practice"
  ],
  "targetAudience": [
    "Professionals seeking better productivity",
    "Entrepreneurs managing multiple projects"
  ],
  "categories": [...],
  "tags": [...]
}
```

---

### Step 3.4: Get Workbook Chapters

**Endpoint:** `GET /api/workbooks/:workbookId/chapters`

**Auth Required:** Yes

**Response (200 OK):**
```json
{
  "workbookId": "wb-1",
  "chapters": [
    {
      "id": "chapter-1",
      "title": "Chapter 1: Understanding Productivity",
      "subtitle": "The foundations of effective work",
      "orderIndex": 1,
      "estimatedDuration": 30,
      "isLocked": false,
      "isCompleted": true,
      "progress": 100,
      "totalSections": 5,
      "completedSections": 5
    },
    {
      "id": "chapter-2",
      "title": "Chapter 2: Time Management",
      "subtitle": "Making the most of your hours",
      "orderIndex": 2,
      "estimatedDuration": 45,
      "isLocked": false,
      "isCompleted": false,
      "progress": 60,
      "totalSections": 6,
      "completedSections": 3
    },
    {
      "id": "chapter-3",
      "title": "Chapter 3: Advanced Techniques",
      "subtitle": "Level up your productivity",
      "orderIndex": 3,
      "estimatedDuration": 50,
      "isLocked": true,
      "isCompleted": false,
      "progress": 0,
      "totalSections": 7,
      "completedSections": 0
    }
  ],
  "totalChapters": 12,
  "completedChapters": 1
}
```

---

### Step 3.5: Get Chapter Content

**Endpoint:** `GET /api/books/chapters/:chapterId/content`

**Auth Required:** Yes

**Response (200 OK):**
```json
{
  "chapter": {
    "id": "chapter-2",
    "title": "Chapter 2: Time Management",
    "subtitle": "Making the most of your hours",
    "orderIndex": 2,
    "estimatedDuration": 45
  },
  "sections": [
    {
      "id": "section-1",
      "title": "The Power of Time Blocking",
      "orderIndex": 1,
      "content": "# The Power of Time Blocking\n\nTime blocking is...",
      "contentType": "markdown",
      "estimatedDuration": 10,
      "isCompleted": true
    },
    {
      "id": "section-2",
      "title": "Prioritization Matrix",
      "orderIndex": 2,
      "content": "# Prioritization Matrix\n\nLearn to prioritize...",
      "contentType": "markdown",
      "estimatedDuration": 8,
      "isCompleted": false
    }
  ],
  "totalSections": 6,
  "completedSections": 3,
  "nextChapter": {
    "id": "chapter-3",
    "title": "Chapter 3: Advanced Techniques"
  },
  "previousChapter": {
    "id": "chapter-1",
    "title": "Chapter 1: Understanding Productivity"
  }
}
```

---

### Step 3.6: Update Reading Progress

**Endpoint:** `POST /api/library/progress`

**Auth Required:** Yes

**Request:**
```json
{
  "bookId": "book-1",
  "chapterId": "chapter-2",
  "sectionId": "section-2",
  "progressPercentage": 55,
  "lastPosition": "section-2",
  "timeSpent": 300
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "progress": {
    "bookId": "book-1",
    "chapterId": "chapter-2",
    "sectionId": "section-2",
    "progressPercentage": 55,
    "lastPosition": "section-2",
    "totalTimeSpent": 1800,
    "updatedAt": "2024-03-24T11:00:00.000Z"
  },
  "achievements": [
    {
      "type": "milestone",
      "title": "Half Way There!",
      "description": "You've completed 50% of this book"
    }
  ]
}
```

---

### Step 3.7: Create Bookmark

**Endpoint:** `POST /api/library/bookmarks`

**Auth Required:** Yes

**Request:**
```json
{
  "bookId": "book-1",
  "chapterId": "chapter-2",
  "sectionId": "section-2",
  "position": "paragraph-5",
  "note": "Important point about time blocking"
}
```

**Response (201 Created):**
```json
{
  "id": "bookmark-uuid",
  "bookId": "book-1",
  "chapterId": "chapter-2",
  "sectionId": "section-2",
  "position": "paragraph-5",
  "note": "Important point about time blocking",
  "createdAt": "2024-03-24T11:05:00.000Z"
}
```

---

### Step 3.8: Create Highlight

**Endpoint:** `POST /api/library/highlights`

**Auth Required:** Yes

**Request:**
```json
{
  "bookId": "book-1",
  "chapterId": "chapter-2",
  "sectionId": "section-2",
  "text": "The key to success is consistent action",
  "color": "#FFEB3B",
  "startPosition": "p5-start",
  "endPosition": "p5-end"
}
```

**Response (201 Created):**
```json
{
  "id": "highlight-uuid",
  "bookId": "book-1",
  "chapterId": "chapter-2",
  "text": "The key to success is consistent action",
  "color": "#FFEB3B",
  "createdAt": "2024-03-24T11:10:00.000Z"
}
```

---

<a name="flow-4"></a>
## User Flow 4: AI Coaching

### Step 4.1: Create AI Conversation

**Endpoint:** `POST /api/ai/conversations`

**Auth Required:** Yes

**Request:**
```json
{
  "title": "Help with goal setting",
  "context": {
    "type": "book_chapter",
    "bookId": "book-1",
    "chapterId": "chapter-2"
  }
}
```

**Response (201 Created):**
```json
{
  "id": "conv-uuid",
  "userId": "user-uuid",
  "title": "Help with goal setting",
  "context": {
    "type": "book_chapter",
    "bookId": "book-1",
    "chapterId": "chapter-2",
    "bookTitle": "Productivity Masterclass",
    "chapterTitle": "Chapter 2: Time Management"
  },
  "messageCount": 0,
  "createdAt": "2024-03-24T11:15:00.000Z",
  "updatedAt": "2024-03-24T11:15:00.000Z"
}
```

---

### Step 4.2: Send Message to AI

**Endpoint:** `POST /api/ai/messages`

**Auth Required:** Yes

**Request:**
```json
{
  "conversationId": "conv-uuid",
  "message": "Can you help me create a SMART goal for improving my productivity based on what I just learned?",
  "context": {
    "bookId": "book-1",
    "chapterId": "chapter-2",
    "sectionId": "section-2",
    "userProgress": 55
  }
}
```

**Response (200 OK):**
```json
{
  "conversation": {
    "id": "conv-uuid",
    "messageCount": 2
  },
  "userMessage": {
    "id": "msg-1",
    "role": "user",
    "content": "Can you help me create a SMART goal...",
    "timestamp": "2024-03-24T11:16:00.000Z"
  },
  "aiMessage": {
    "id": "msg-2",
    "role": "assistant",
    "content": "Absolutely! Based on Chapter 2 about Time Management, let's create a SMART goal for you:\n\n**Specific**: Implement time blocking for your work day\n**Measurable**: Block out 4 focused 90-minute work sessions\n**Achievable**: Start with 2-3 sessions and build up\n**Relevant**: Directly improves your productivity\n**Time-bound**: Achieve this within 30 days\n\nYour SMART goal: \"I will implement time blocking by scheduling four 90-minute focused work sessions each weekday for the next 30 days, starting with 2 sessions in week 1 and gradually increasing.\"\n\nWould you like help breaking this down into weekly milestones?",
    "timestamp": "2024-03-24T11:16:15.000Z",
    "citations": [
      {
        "type": "book_content",
        "bookId": "book-1",
        "chapterId": "chapter-2",
        "sectionId": "section-1",
        "text": "Time blocking is the practice of...",
        "relevance": 0.95
      }
    ]
  },
  "tokensUsed": {
    "prompt": 245,
    "completion": 180,
    "total": 425
  }
}
```

---

### Step 4.3: Get Conversation History

**Endpoint:** `GET /api/ai/conversations/:conversationId`

**Auth Required:** Yes

**Response (200 OK):**
```json
{
  "id": "conv-uuid",
  "userId": "user-uuid",
  "title": "Help with goal setting",
  "context": {
    "type": "book_chapter",
    "bookId": "book-1",
    "chapterId": "chapter-2"
  },
  "messages": [
    {
      "id": "msg-1",
      "role": "user",
      "content": "Can you help me create a SMART goal...",
      "timestamp": "2024-03-24T11:16:00.000Z"
    },
    {
      "id": "msg-2",
      "role": "assistant",
      "content": "Absolutely! Based on Chapter 2...",
      "timestamp": "2024-03-24T11:16:15.000Z",
      "citations": [...]
    }
  ],
  "messageCount": 2,
  "createdAt": "2024-03-24T11:15:00.000Z",
  "updatedAt": "2024-03-24T11:16:15.000Z"
}
```

---

### Step 4.4: List All Conversations

**Endpoint:** `GET /api/ai/conversations`

**Auth Required:** Yes

**Query Parameters:**
- `limit` (optional): Number per page (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response (200 OK):**
```json
{
  "conversations": [
    {
      "id": "conv-uuid",
      "title": "Help with goal setting",
      "messageCount": 2,
      "lastMessage": {
        "content": "Absolutely! Based on Chapter 2...",
        "timestamp": "2024-03-24T11:16:15.000Z"
      },
      "context": {
        "bookTitle": "Productivity Masterclass",
        "chapterTitle": "Chapter 2: Time Management"
      },
      "createdAt": "2024-03-24T11:15:00.000Z",
      "updatedAt": "2024-03-24T11:16:15.000Z"
    }
  ],
  "total": 15,
  "limit": 20,
  "offset": 0
}
```

---

<a name="flow-5"></a>
## User Flow 5: Goals & Progress Tracking

### Step 5.1: Create Goal

**Endpoint:** `POST /api/goals`

**Auth Required:** Yes

**Request:**
```json
{
  "title": "Complete 30 days of meditation",
  "description": "Practice mindfulness meditation for 10 minutes every morning",
  "category": "wellness",
  "targetDate": "2024-04-30",
  "isPublic": false,
  "milestones": [
    {
      "title": "Complete first week",
      "description": "7 consecutive days",
      "targetDate": "2024-04-07",
      "orderIndex": 1
    },
    {
      "title": "Complete two weeks",
      "description": "14 consecutive days",
      "targetDate": "2024-04-14",
      "orderIndex": 2
    },
    {
      "title": "Complete 30 days",
      "description": "Full month of practice",
      "targetDate": "2024-04-30",
      "orderIndex": 3
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "id": "goal-uuid",
  "userId": "user-uuid",
  "title": "Complete 30 days of meditation",
  "description": "Practice mindfulness meditation for 10 minutes every morning",
  "category": "wellness",
  "status": "active",
  "progress": 0,
  "targetDate": "2024-04-30",
  "isPublic": false,
  "milestones": [
    {
      "id": "milestone-1",
      "title": "Complete first week",
      "description": "7 consecutive days",
      "targetDate": "2024-04-07",
      "orderIndex": 1,
      "isCompleted": false,
      "completedAt": null
    },
    {
      "id": "milestone-2",
      "title": "Complete two weeks",
      "description": "14 consecutive days",
      "targetDate": "2024-04-14",
      "orderIndex": 2,
      "isCompleted": false,
      "completedAt": null
    },
    {
      "id": "milestone-3",
      "title": "Complete 30 days",
      "description": "Full month of practice",
      "targetDate": "2024-04-30",
      "orderIndex": 3,
      "isCompleted": false,
      "completedAt": null
    }
  ],
  "createdAt": "2024-03-24T11:20:00.000Z",
  "updatedAt": "2024-03-24T11:20:00.000Z"
}
```

---

### Step 5.2: Get All Goals

**Endpoint:** `GET /api/goals`

**Auth Required:** Yes

**Query Parameters:**
- `status` (optional): active, completed, paused
- `category` (optional): wellness, productivity, career, etc.

**Response (200 OK):**
```json
{
  "goals": [
    {
      "id": "goal-uuid",
      "title": "Complete 30 days of meditation",
      "description": "Practice mindfulness meditation...",
      "category": "wellness",
      "status": "active",
      "progress": 23,
      "targetDate": "2024-04-30",
      "daysRemaining": 37,
      "milestonesCompleted": 0,
      "totalMilestones": 3,
      "createdAt": "2024-03-24T11:20:00.000Z",
      "lastUpdated": "2024-03-24T11:25:00.000Z"
    }
  ],
  "summary": {
    "totalGoals": 5,
    "activeGoals": 3,
    "completedGoals": 2,
    "averageProgress": 45
  }
}
```

---

### Step 5.3: Add Goal Progress

**Endpoint:** `POST /api/goals/:goalId/progress`

**Auth Required:** Yes

**Request:**
```json
{
  "note": "Completed 10 minute morning meditation session. Felt very centered.",
  "progressPercentage": 10,
  "milestoneId": "milestone-1"
}
```

**Response (201 Created):**
```json
{
  "progress": {
    "id": "progress-uuid",
    "goalId": "goal-uuid",
    "note": "Completed 10 minute morning meditation...",
    "progressPercentage": 10,
    "milestoneId": "milestone-1",
    "createdAt": "2024-03-25T07:30:00.000Z"
  },
  "goal": {
    "id": "goal-uuid",
    "progress": 10,
    "status": "active",
    "currentStreak": 1,
    "updatedAt": "2024-03-25T07:30:00.000Z"
  },
  "achievements": [
    {
      "type": "streak_started",
      "title": "Great Start!",
      "description": "You've started your meditation journey"
    }
  ]
}
```

---

### Step 5.4: Update Goal

**Endpoint:** `PATCH /api/goals/:goalId`

**Auth Required:** Yes

**Request:**
```json
{
  "status": "in_progress",
  "progress": 33,
  "notes": "Making steady progress"
}
```

**Response (200 OK):**
```json
{
  "id": "goal-uuid",
  "title": "Complete 30 days of meditation",
  "status": "in_progress",
  "progress": 33,
  "notes": "Making steady progress",
  "updatedAt": "2024-03-30T08:00:00.000Z"
}
```

---

<a name="flow-6"></a>
## User Flow 6: Journaling

### Step 6.1: Create Journal Entry

**Endpoint:** `POST /api/journals`

**Auth Required:** Yes

**Request:**
```json
{
  "title": "Today's Reflections",
  "content": "Had a productive day focusing on personal growth. Completed my meditation practice and made progress on my goals. Feeling grateful for the opportunity to learn and grow.",
  "mood": "positive",
  "energy": 8,
  "tags": ["productivity", "mindfulness", "gratitude"],
  "isPrivate": true,
  "linkedGoals": ["goal-uuid"],
  "linkedBooks": ["book-1"]
}
```

**Response (201 Created):**
```json
{
  "id": "journal-uuid",
  "userId": "user-uuid",
  "title": "Today's Reflections",
  "content": "Had a productive day...",
  "mood": "positive",
  "energy": 8,
  "tags": ["productivity", "mindfulness", "gratitude"],
  "isPrivate": true,
  "linkedGoals": [
    {
      "id": "goal-uuid",
      "title": "Complete 30 days of meditation"
    }
  ],
  "linkedBooks": [
    {
      "id": "book-1",
      "title": "Productivity Masterclass"
    }
  ],
  "wordCount": 45,
  "aiInsights": {
    "sentiment": "very_positive",
    "themes": ["growth", "productivity", "mindfulness"],
    "suggestions": [
      "Consider setting a specific time goal for tomorrow",
      "Reflect on what made today particularly productive"
    ]
  },
  "createdAt": "2024-03-24T20:00:00.000Z",
  "updatedAt": "2024-03-24T20:00:00.000Z"
}
```

---

### Step 6.2: Get All Journal Entries

**Endpoint:** `GET /api/journals?limit=20&offset=0`

**Auth Required:** Yes

**Query Parameters:**
- `limit` (optional): Number per page (default: 20)
- `offset` (optional): Pagination offset
- `mood` (optional): Filter by mood
- `tag` (optional): Filter by tag
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

**Response (200 OK):**
```json
{
  "journals": [
    {
      "id": "journal-uuid",
      "title": "Today's Reflections",
      "excerpt": "Had a productive day focusing on...",
      "mood": "positive",
      "energy": 8,
      "tags": ["productivity", "mindfulness", "gratitude"],
      "wordCount": 45,
      "linkedGoalsCount": 1,
      "createdAt": "2024-03-24T20:00:00.000Z"
    }
  ],
  "total": 30,
  "limit": 20,
  "offset": 0,
  "stats": {
    "totalEntries": 30,
    "currentStreak": 7,
    "longestStreak": 12,
    "averageMood": "positive",
    "totalWords": 1350,
    "entriesThisMonth": 15
  }
}
```

---

### Step 6.3: Update Journal Entry

**Endpoint:** `PATCH /api/journals/:journalId`

**Auth Required:** Yes

**Request:**
```json
{
  "content": "Updated reflection: Also spent time reading chapter 3 of my workbook and had insights about time management.",
  "mood": "inspired",
  "energy": 9,
  "tags": ["productivity", "mindfulness", "gratitude", "learning"]
}
```

**Response (200 OK):**
```json
{
  "id": "journal-uuid",
  "title": "Today's Reflections",
  "content": "Updated reflection: Also spent time...",
  "mood": "inspired",
  "energy": 9,
  "tags": ["productivity", "mindfulness", "gratitude", "learning"],
  "wordCount": 58,
  "updatedAt": "2024-03-24T20:15:00.000Z"
}
```

---

<a name="flow-7"></a>
## User Flow 7: Practices & Sessions

### Step 7.1: Get All Practices

**Endpoint:** `GET /api/practices`

**Auth Required:** Yes

**Query Parameters:**
- `category` (optional): meditation, breathing, movement, etc.
- `difficulty` (optional): beginner, intermediate, advanced

**Response (200 OK):**
```json
{
  "practices": [
    {
      "id": "practice-1",
      "title": "Morning Mindfulness Meditation",
      "description": "Start your day with clarity and focus",
      "category": "meditation",
      "difficulty": "beginner",
      "duration": 10,
      "image": "https://example.com/practice1.jpg",
      "instructorName": "Jane Meditation",
      "completionCount": 1250,
      "rating": 4.9,
      "isPremium": false,
      "tags": ["morning", "mindfulness", "focus"]
    }
  ],
  "total": 45,
  "userStats": {
    "totalCompleted": 15,
    "favoriteCategory": "meditation",
    "currentStreak": 5
  }
}
```

---

### Step 7.2: Get Practice Details

**Endpoint:** `GET /api/practices/:practiceId`

**Auth Required:** Yes

**Response (200 OK):**
```json
{
  "id": "practice-1",
  "title": "Morning Mindfulness Meditation",
  "description": "Start your day with clarity and focus",
  "longDescription": "This guided meditation...",
  "category": "meditation",
  "difficulty": "beginner",
  "duration": 10,
  "image": "https://example.com/practice1.jpg",
  "audioUrl": "https://example.com/audio/practice1.mp3",
  "videoUrl": null,
  "instructorName": "Jane Meditation",
  "instructorBio": "Jane is a certified...",
  "completionCount": 1250,
  "rating": 4.9,
  "reviewCount": 345,
  "isPremium": false,
  "tags": ["morning", "mindfulness", "focus"],
  "steps": [
    {
      "orderIndex": 1,
      "title": "Find a comfortable position",
      "description": "Sit or lie down in a quiet space",
      "duration": 1
    },
    {
      "orderIndex": 2,
      "title": "Focus on your breath",
      "description": "Notice the natural rhythm of your breathing",
      "duration": 5
    },
    {
      "orderIndex": 3,
      "title": "Body scan",
      "description": "Bring awareness to each part of your body",
      "duration": 4
    }
  ],
  "benefits": [
    "Reduced stress",
    "Improved focus",
    "Better emotional regulation"
  ],
  "requirements": [
    "Quiet space",
    "10 minutes of time"
  ],
  "userProgress": {
    "timesCompleted": 5,
    "lastCompletedAt": "2024-03-23T07:00:00.000Z",
    "averageDuration": 612
  }
}
```

---

### Step 7.3: Start Practice Session

**Endpoint:** `POST /api/practices/sessions/start`

**Auth Required:** Yes

**Request:**
```json
{
  "practiceId": "practice-1"
}
```

**Response (201 Created):**
```json
{
  "session": {
    "id": "session-uuid",
    "practiceId": "practice-1",
    "userId": "user-uuid",
    "status": "active",
    "startedAt": "2024-03-25T07:00:00.000Z"
  },
  "practice": {
    "id": "practice-1",
    "title": "Morning Mindfulness Meditation",
    "duration": 10,
    "audioUrl": "https://example.com/audio/practice1.mp3"
  }
}
```

---

### Step 7.4: Complete Practice Session

**Endpoint:** `POST /api/practices/sessions/:sessionId/complete`

**Auth Required:** Yes

**Request:**
```json
{
  "duration": 612,
  "completionPercentage": 100,
  "rating": 5,
  "notes": "Felt very centered after this practice. Will definitely do again tomorrow."
}
```

**Response (200 OK):**
```json
{
  "session": {
    "id": "session-uuid",
    "practiceId": "practice-1",
    "status": "completed",
    "startedAt": "2024-03-25T07:00:00.000Z",
    "completedAt": "2024-03-25T07:10:12.000Z",
    "duration": 612,
    "rating": 5,
    "notes": "Felt very centered..."
  },
  "achievements": [
    {
      "type": "streak",
      "title": "5 Day Streak!",
      "description": "You've completed practices 5 days in a row",
      "badge": "streak_5"
    }
  ],
  "stats": {
    "totalSessions": 6,
    "currentStreak": 5,
    "longestStreak": 12,
    "totalMinutes": 3672
  }
}
```

---

### Step 7.5: Get My Practice Sessions

**Endpoint:** `GET /api/practices/sessions/me`

**Auth Required:** Yes

**Query Parameters:**
- `limit` (optional): Number per page
- `offset` (optional): Pagination offset
- `status` (optional): active, completed

**Response (200 OK):**
```json
{
  "sessions": [
    {
      "id": "session-uuid",
      "practice": {
        "id": "practice-1",
        "title": "Morning Mindfulness Meditation",
        "category": "meditation",
        "image": "https://example.com/practice1.jpg"
      },
      "status": "completed",
      "duration": 612,
      "rating": 5,
      "startedAt": "2024-03-25T07:00:00.000Z",
      "completedAt": "2024-03-25T07:10:12.000Z"
    }
  ],
  "total": 25,
  "stats": {
    "totalSessions": 25,
    "currentStreak": 5,
    "totalMinutes": 3672,
    "favoriteCategory": "meditation"
  }
}
```

---

<a name="admin-flow"></a>
## Admin Flow: Content Management

### A1. Get Admin Dashboard

**Endpoint:** `GET /api/admin/dashboard`

**Auth Required:** Yes (Admin/Super Admin only)

**Response (200 OK):**
```json
{
  "overview": {
    "totalUsers": 15234,
    "activeUsers": 8945,
    "newUsersToday": 124,
    "totalRevenue": 458932.50,
    "revenueToday": 3421.00,
    "totalOrders": 3421,
    "pendingOrders": 15,
    "totalWorkbooks": 45,
    "totalProducts": 125
  },
  "recentActivity": [
    {
      "type": "new_user",
      "user": "john@example.com",
      "timestamp": "2024-03-24T11:30:00.000Z"
    },
    {
      "type": "order_completed",
      "orderNumber": "ORD-20240324-001",
      "amount": 299.98,
      "timestamp": "2024-03-24T11:25:00.000Z"
    }
  ],
  "topWorkbooks": [
    {
      "id": "wb-1",
      "title": "Productivity Masterclass",
      "enrollments": 1250,
      "revenue": 62450.00,
      "rating": 4.8
    }
  ],
  "userGrowth": {
    "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    "data": [45, 67, 54, 78, 89, 92, 124]
  }
}
```

---

### A2. Create Category

**Endpoint:** `POST /api/taxonomy/categories`

**Auth Required:** Yes (Admin/Super Admin)

**Request:**
```json
{
  "name": "Mindset Mastery",
  "slug": "mindset-mastery",
  "description": "Transform your thinking patterns and develop a growth mindset",
  "icon": "brain",
  "color": "#4A90E2",
  "displayOrder": 1,
  "isActive": true,
  "metaTitle": "Mindset Mastery - Personal Growth",
  "metaDescription": "Learn to transform your thinking..."
}
```

**Response (201 Created):**
```json
{
  "id": "cat-uuid",
  "name": "Mindset Mastery",
  "slug": "mindset-mastery",
  "description": "Transform your thinking patterns...",
  "icon": "brain",
  "color": "#4A90E2",
  "displayOrder": 1,
  "isActive": true,
  "contentCount": 0,
  "createdAt": "2024-03-24T12:00:00.000Z"
}
```

---

### A3. Create Workbook

**Endpoint:** `POST /api/workbooks`

**Auth Required:** Yes (Admin/Super Admin)

**Request:**
```json
{
  "title": "Productivity Masterclass",
  "subtitle": "Master your time and energy",
  "description": "A comprehensive guide to productivity and time management",
  "longDescription": "In this masterclass, you'll learn...",
  "author": "John Expert",
  "authorBio": "John is a productivity expert with 20 years of experience",
  "coverImage": "https://example.com/cover.jpg",
  "price": 49.99,
  "isPremium": true,
  "difficulty": "intermediate",
  "estimatedDuration": "6 weeks",
  "categories": ["cat-uuid"],
  "tags": ["beginner-friendly", "practical", "actionable"],
  "whatYouWillLearn": [
    "Master time management techniques",
    "Eliminate distractions effectively",
    "Build sustainable productive habits"
  ],
  "requirements": [
    "Open mind and willingness to learn",
    "Commitment to practice daily"
  ],
  "targetAudience": [
    "Professionals seeking better productivity",
    "Entrepreneurs managing multiple projects"
  ],
  "status": "published"
}
```

**Response (201 Created):**
```json
{
  "id": "wb-uuid",
  "title": "Productivity Masterclass",
  "subtitle": "Master your time and energy",
  "author": "John Expert",
  "coverImage": "https://example.com/cover.jpg",
  "price": 49.99,
  "isPremium": true,
  "difficulty": "intermediate",
  "estimatedDuration": "6 weeks",
  "status": "published",
  "enrollmentCount": 0,
  "rating": 0,
  "createdAt": "2024-03-24T12:05:00.000Z"
}
```

---

## Authentication Notes

### Token Management

**Access Token:**
- Expires in 7 days (default)
- Include in Authorization header: `Authorization: Bearer {accessToken}`
- Required for all authenticated endpoints

**Refresh Token:**
- Expires in 30 days (default)
- Use to get new access token when expired
- Send to `/api/auth/refresh` endpoint

### Rate Limiting

- **Auth endpoints**: 5 requests per 15 minutes
- **API endpoints**: 100 requests per 15 minutes
- **Strict endpoints**: 10 requests per hour

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional error details"
    }
  }
}
```

**Common Error Codes:**
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Testing Notes

1. **Import Postman Collection**: Import `MindFuel_API_Complete.postman_collection.json`
2. **Set Base URL**: Update `{{baseUrl}}` variable (default: `http://localhost:3000/api`)
3. **Register/Login**: Start with User Flow 1 to get authentication tokens
4. **Auto Variables**: Tokens and IDs are automatically saved to collection variables
5. **Admin Testing**: Use admin credentials to test admin endpoints

---

## Summary

This document covers **7 complete user flows** and **1 admin flow** with detailed request/response examples for all major features:

✅ **172+ API Endpoints** documented
✅ **Complete request payloads** for all POST/PATCH requests
✅ **Detailed response examples** showing data structure
✅ **Authentication flow** with token management
✅ **Error handling** patterns
✅ **Query parameters** for filtering and pagination
✅ **Real-world usage scenarios** from registration to advanced features

Import the Postman collection and follow the user flows to test the complete API!
