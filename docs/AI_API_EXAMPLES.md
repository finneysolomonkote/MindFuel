# AI API - Request/Response Examples

## Table of Contents
1. [General Coach Mode](#general-coach-mode)
2. [Book Context Mode](#book-context-mode)
3. [Admin Operations](#admin-operations)
4. [Error Handling](#error-handling)

---

## General Coach Mode

### Scenario: User Opens AI from Home Screen

#### 1. Create Conversation

**Request**:
```http
POST /api/ai/conversations
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "context_type": "general",
  "title": "Personal Development Chat"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Personal Development Chat",
    "context_type": "general",
    "context_id": null,
    "book_id": null,
    "chapter_id": null,
    "is_active": true,
    "message_count": 0,
    "total_tokens_used": 0,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### 2. Send First Message

**Request**:
```http
POST /api/ai/messages
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "content": "I want to improve my meditation practice. Can you help me based on what I've been reading?"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "msg-123e4567-e89b-12d3-a456-426614174001",
      "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "role": "assistant",
      "content": "Based on your recent reading of 'The Power of Mindfulness' and your active goal to develop a daily meditation habit, I'd love to help!\n\nFrom Chapter 3 of 'The Power of Mindfulness', the book introduces the foundational breathing technique that's perfect for building consistency. The key is starting with just 5 minutes daily, focusing on breath awareness without judgment.\n\nThe book emphasizes three core principles:\n1. **Consistency over duration** - 5 minutes daily beats 30 minutes occasionally\n2. **Anchor to existing habit** - Meditate right after your morning coffee\n3. **Gentle return** - When your mind wanders, simply notice and return to breath\n\nWould you like me to share the specific breathing technique from page 42, or discuss how to integrate this into your morning routine?",
      "context_type": "general",
      "context_id": null,
      "tokens_used": 186,
      "model": "gpt-4-turbo-preview",
      "created_at": "2024-01-15T10:31:15Z"
    },
    "answer": "Based on your recent reading of 'The Power of Mindfulness' and your active goal to develop a daily meditation habit...",
    "mode": "general",
    "source_references": [
      {
        "book_id": "book-uuid-001",
        "book_title": "The Power of Mindfulness",
        "chapter_id": "chapter-uuid-003",
        "chapter_title": "Building Your Practice",
        "section_id": "section-uuid-001",
        "section_title": "Starting Small",
        "page_number": 42,
        "similarity": 0.92
      },
      {
        "book_id": "book-uuid-001",
        "book_title": "The Power of Mindfulness",
        "chapter_id": "chapter-uuid-001",
        "chapter_title": "Introduction to Mindfulness",
        "section_id": "section-uuid-005",
        "section_title": "Consistency is Key",
        "page_number": 12,
        "similarity": 0.87
      }
    ],
    "recommendations": [
      {
        "type": "book",
        "id": "book-uuid-001",
        "title": "The Power of Mindfulness",
        "reason": "Referenced in response with 2 relevant sections"
      }
    ],
    "usage": {
      "tokens_used": 186,
      "model": "gpt-4-turbo-preview",
      "chunks_retrieved": 5
    },
    "conversation_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

## Book Context Mode

### Scenario: User Asks Question While Reading

#### 1. Create Book-Context Conversation

**Request**:
```http
POST /api/ai/conversations
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "context_type": "book",
  "title": "Questions about Chapter 3",
  "book_id": "book-uuid-001",
  "chapter_id": "chapter-uuid-003"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "conv-book-550e8400",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Questions about Chapter 3",
    "context_type": "book",
    "context_id": null,
    "book_id": "book-uuid-001",
    "chapter_id": "chapter-uuid-003",
    "is_active": true,
    "message_count": 0,
    "total_tokens_used": 0,
    "created_at": "2024-01-15T14:20:00Z",
    "updated_at": "2024-01-15T14:20:00Z"
  }
}
```

#### 2. Ask Question About Current Page

**Request**:
```http
POST /api/ai/messages
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "conversation_id": "conv-book-550e8400",
  "content": "Can you explain the 4-7-8 breathing technique in more detail?",
  "book_id": "book-uuid-001",
  "chapter_id": "chapter-uuid-003",
  "section_id": "section-uuid-002",
  "page_number": 45
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "msg-detail-4-7-8",
      "conversation_id": "conv-book-550e8400",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "role": "assistant",
      "content": "The 4-7-8 breathing technique, as described on pages 45-46 of Chapter 3, is a powerful tool for calming the nervous system.\n\n**The Technique (from your current section):**\n\n1. **Inhale through nose - 4 counts**\n   - Place tongue against ridge behind upper teeth\n   - Breathe in quietly through nose\n   - Count slowly: 1...2...3...4\n\n2. **Hold breath - 7 counts**\n   - Keep tongue in position\n   - Hold comfortably (don't strain)\n   - Count: 1...2...3...4...5...6...7\n\n3. **Exhale through mouth - 8 counts**\n   - Make a 'whoosh' sound\n   - Exhale completely through mouth\n   - Count: 1...2...3...4...5...6...7...8\n\n4. **Repeat 4 cycles**\n\nAs the book emphasizes on page 46: 'The ratio is more important than the absolute time. If 4-7-8 feels too long, try 2-3.5-4, keeping the same proportions.'\n\nThe book also notes this technique activates the parasympathetic nervous system, which is why it's particularly effective before sleep or during stress.\n\nWould you like to know about common mistakes to avoid, or how to integrate this into your daily routine?",
      "context_type": "book",
      "context_id": null,
      "tokens_used": 298,
      "model": "gpt-4-turbo-preview",
      "created_at": "2024-01-15T14:21:30Z"
    },
    "answer": "The 4-7-8 breathing technique, as described on pages 45-46...",
    "mode": "book",
    "source_references": [
      {
        "book_id": "book-uuid-001",
        "book_title": "The Power of Mindfulness",
        "chapter_id": "chapter-uuid-003",
        "chapter_title": "Breathing Techniques",
        "section_id": "section-uuid-002",
        "section_title": "The 4-7-8 Method",
        "page_number": 45,
        "similarity": 0.96
      },
      {
        "book_id": "book-uuid-001",
        "book_title": "The Power of Mindfulness",
        "chapter_id": "chapter-uuid-003",
        "chapter_title": "Breathing Techniques",
        "section_id": "section-uuid-002",
        "section_title": "The 4-7-8 Method",
        "page_number": 46,
        "similarity": 0.94
      },
      {
        "book_id": "book-uuid-001",
        "book_title": "The Power of Mindfulness",
        "chapter_id": "chapter-uuid-003",
        "chapter_title": "Breathing Techniques",
        "section_id": "section-uuid-003",
        "section_title": "Common Mistakes",
        "page_number": 48,
        "similarity": 0.82
      }
    ],
    "recommendations": null,
    "usage": {
      "tokens_used": 298,
      "model": "gpt-4-turbo-preview",
      "chunks_retrieved": 5
    },
    "conversation_id": "conv-book-550e8400"
  }
}
```

#### 3. Follow-Up Question in Same Context

**Request**:
```http
POST /api/ai/messages
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "conversation_id": "conv-book-550e8400",
  "content": "What are the common mistakes to avoid?",
  "book_id": "book-uuid-001",
  "chapter_id": "chapter-uuid-003",
  "section_id": "section-uuid-002",
  "page_number": 45
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "msg-follow-up-mistakes",
      "conversation_id": "conv-book-550e8400",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "role": "assistant",
      "content": "Great question! The book addresses common mistakes on pages 48-49. Here are the key ones to avoid:\n\n**1. Forcing the Breath**\n'Never strain during the hold phase. If 7 counts feels too long, reduce to 3.5 counts while maintaining the 4-7-8 ratio.' - Page 48\n\n**2. Breathing Too Fast**\nThe book emphasizes: 'Count slowly and deliberately. Each count should be about one second. Rushing defeats the calming purpose.'\n\n**3. Skipping the Tongue Position**\n'The tongue placement against the upper palate is crucial - it creates the right airflow pattern and engages the parasympathetic response.' - Page 49\n\n**4. Doing Too Many Cycles Initially**\nStart with just 4 cycles. The book warns: 'More is not better initially. You might feel lightheaded if you do more than 4 cycles when starting out.'\n\n**5. Inconsistent Ratio**\n'The magic is in the ratio - 4:7:8. Don't change it to 4:5:8 or other variations. If it's too challenging, scale everything down proportionally.'\n\nSince you're on page 45 learning the technique, I'd suggest focusing on just getting the basic rhythm first, then perfecting the form over the next few practice sessions.",
      "context_type": "book",
      "context_id": null,
      "tokens_used": 276,
      "model": "gpt-4-turbo-preview",
      "created_at": "2024-01-15T14:23:15Z"
    },
    "answer": "Great question! The book addresses common mistakes on pages 48-49...",
    "mode": "book",
    "source_references": [
      {
        "book_id": "book-uuid-001",
        "book_title": "The Power of Mindfulness",
        "chapter_id": "chapter-uuid-003",
        "chapter_title": "Breathing Techniques",
        "section_id": "section-uuid-003",
        "section_title": "Common Mistakes",
        "page_number": 48,
        "similarity": 0.93
      },
      {
        "book_id": "book-uuid-001",
        "book_title": "The Power of Mindfulness",
        "chapter_id": "chapter-uuid-003",
        "chapter_title": "Breathing Techniques",
        "section_id": "section-uuid-003",
        "section_title": "Common Mistakes",
        "page_number": 49,
        "similarity": 0.91
      }
    ],
    "recommendations": null,
    "usage": {
      "tokens_used": 276,
      "model": "gpt-4-turbo-preview",
      "chunks_retrieved": 5
    },
    "conversation_id": "conv-book-550e8400"
  }
}
```

---

## Admin Operations

### Prompt Template Management

#### Create Prompt Template

**Request**:
```http
POST /api/ai/prompts
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "name": "Enhanced Book Context Coach",
  "context_type": "book",
  "system_prompt": "You are an expert MindFuel coach helping users deeply understand and apply the content from {book_title}.\n\nYour role:\n- Provide detailed explanations from the specific chapter and pages\n- Connect concepts to the user's personal goals\n- Offer practical, actionable advice based strictly on book content\n- Use direct quotes when helpful\n- Reference page numbers for easy lookup\n\nIMPORTANT: Only answer from the provided book content. If the user asks something not in the book, kindly explain you can only help with MindFuel content.",
  "guardrails": "STRICT RULES:\n- Never provide advice not found in the provided content\n- Never discuss topics outside personal development\n- Never give medical, legal, or financial advice\n- Always cite page numbers when making specific claims\n- If unsure, say 'I don't see that specific information in the chapter you're reading'\n- Redirect off-topic questions back to the book content",
  "variables": {
    "book_title": "string",
    "chapter_title": "string",
    "user_goal": "string"
  },
  "is_active": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "template-uuid-001",
    "name": "Enhanced Book Context Coach",
    "context_type": "book",
    "system_prompt": "You are an expert MindFuel coach...",
    "guardrails": "STRICT RULES:\n- Never provide...",
    "variables": {
      "book_title": "string",
      "chapter_title": "string",
      "user_goal": "string"
    },
    "is_active": true,
    "created_at": "2024-01-15T09:00:00Z",
    "updated_at": "2024-01-15T09:00:00Z"
  }
}
```

### Model Configuration

#### Create Model Config

**Request**:
```http
POST /api/ai/models
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "name": "GPT-4 Precise",
  "model_name": "gpt-4-turbo-preview",
  "temperature": 0.5,
  "max_tokens": 800,
  "top_p": 0.95,
  "frequency_penalty": 0.2,
  "presence_penalty": 0.1,
  "is_active": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "model-config-uuid-002",
    "name": "GPT-4 Precise",
    "model_name": "gpt-4-turbo-preview",
    "temperature": 0.5,
    "max_tokens": 800,
    "top_p": 0.95,
    "frequency_penalty": 0.2,
    "presence_penalty": 0.1,
    "is_active": false,
    "created_at": "2024-01-15T09:15:00Z"
  }
}
```

### Content Ingestion

#### Ingest Book

**Request**:
```http
POST /api/admin/ingestion/books/book-uuid-001
Authorization: Bearer {admin-token}
```

**Response**:
```json
{
  "success": true,
  "message": "Book ingestion started",
  "data": {
    "book_id": "book-uuid-001",
    "book_title": "The Power of Mindfulness"
  }
}
```

#### Get Ingestion Status

**Request**:
```http
GET /api/admin/ingestion/status
Authorization: Bearer {admin-token}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "total_books": 15,
    "total_chunks": 8542,
    "status_counts": {
      "completed": 12,
      "processing": 1,
      "failed": 0,
      "not_started": 2
    },
    "books": [
      {
        "id": "book-uuid-001",
        "title": "The Power of Mindfulness",
        "embedding_status": "completed",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-02T15:30:00Z"
      },
      {
        "id": "book-uuid-002",
        "title": "Mastering Your Mind",
        "embedding_status": "processing",
        "created_at": "2024-01-05T00:00:00Z",
        "updated_at": "2024-01-15T14:20:00Z"
      }
    ]
  }
}
```

### AI Usage Analytics

**Request**:
```http
GET /api/ai/usage?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer {admin-token}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "total_tokens": 425680,
    "total_messages": 1842,
    "unique_users": 127,
    "by_model": {
      "gpt-4-turbo-preview": {
        "count": 1650,
        "tokens": 380000
      },
      "gpt-3.5-turbo": {
        "count": 192,
        "tokens": 45680
      }
    },
    "by_context_type": {
      "book": {
        "count": 980,
        "tokens": 245000
      },
      "general": {
        "count": 654,
        "tokens": 142000
      },
      "goal": {
        "count": 158,
        "tokens": 28680
      },
      "journal": {
        "count": 50,
        "tokens": 10000
      }
    },
    "estimated_cost": 4.26,
    "recent_logs": [
      {
        "id": "log-uuid-001",
        "user_id": "user-uuid-001",
        "conversation_id": "conv-uuid-001",
        "message_id": "msg-uuid-001",
        "model": "gpt-4-turbo-preview",
        "tokens_used": 186,
        "context_type": "general",
        "retrieval_count": 5,
        "created_at": "2024-01-31T23:45:00Z"
      }
    ]
  }
}
```

---

## Error Handling

### Inappropriate Content

**Request**:
```http
POST /api/ai/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "conversation_id": "conv-uuid",
  "content": "Can you tell me how to hack into someone's account?"
}
```

**Response**:
```json
{
  "success": false,
  "error": "Message contains inappropriate content. Please rephrase your question."
}
```

### No Access to Content

**Request**:
```http
POST /api/ai/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "conversation_id": "conv-uuid",
  "content": "Tell me about chapter 5",
  "book_id": "premium-book-uuid"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": {
      "role": "assistant",
      "content": "I notice you don't have access to this book yet. To unlock all chapters and get personalized AI coaching on this content, you can purchase it from the shop. Would you like me to help with content from books you already own?",
      "tokens_used": 45
    },
    "answer": "I notice you don't have access to this book yet...",
    "mode": "general",
    "source_references": [],
    "recommendations": [
      {
        "type": "product",
        "id": "product-uuid-for-book",
        "title": "The Premium Guide - Full Access",
        "reason": "Unlock all chapters and AI coaching"
      }
    ],
    "usage": {
      "tokens_used": 45,
      "model": "gpt-4-turbo-preview",
      "chunks_retrieved": 0
    }
  }
}
```

### Conversation Not Found

**Request**:
```http
POST /api/ai/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "conversation_id": "invalid-uuid",
  "content": "Hello"
}
```

**Response**:
```json
{
  "success": false,
  "error": "Conversation not found"
}
```

### Rate Limit Exceeded

**Response**:
```json
{
  "success": false,
  "error": "Too many requests, please try again later",
  "retry_after": 1800
}
```

---

## Client Integration Patterns

### React Native Example

```typescript
import { useState, useEffect } from 'react';
import api from './api';

const AIChat = ({ bookId, chapterId, sectionId, pageNumber }) => {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Create or resume conversation
  useEffect(() => {
    const initConversation = async () => {
      const response = await api.post('/ai/conversations', {
        context_type: bookId ? 'book' : 'general',
        book_id: bookId,
        chapter_id: chapterId,
        title: bookId ? `Questions about this book` : 'Personal Development Chat'
      });
      setConversation(response.data);
    };

    initConversation();
  }, [bookId, chapterId]);

  const sendMessage = async (content) => {
    setLoading(true);
    try {
      const response = await api.post('/ai/messages', {
        conversation_id: conversation.id,
        content,
        book_id: bookId,
        chapter_id: chapterId,
        section_id: sectionId,
        page_number: pageNumber
      });

      setMessages([...messages,
        { role: 'user', content },
        { role: 'assistant', ...response.data }
      ]);

      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChatUI
      messages={messages}
      onSend={sendMessage}
      loading={loading}
      showSources={true}
    />
  );
};
```

---

This document provides comprehensive examples for integrating with the MindFuel AI system across all major use cases.
