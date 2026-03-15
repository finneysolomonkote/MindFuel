# MindFuel AI - RAG-Powered Coaching System

## Overview

A production-ready AI coaching system that answers ONLY from MindFuel workbook content using Retrieval Augmented Generation (RAG). This is NOT a generic chatbot - it's a context-aware personal development coach powered by your curated content.

## Core Principles

### Critical Business Rules

1. **Content-Only Responses**: The AI answers exclusively from:
   - MindFuel workbook content
   - Admin-configured prompt templates
   - Allowed platform content

2. **No Generic ChatGPT Behavior**: The system has strict guardrails preventing:
   - General knowledge responses outside platform content
   - Medical, legal, or financial advice
   - Political or controversial topics
   - Role-playing as anything other than MindFuel coach

3. **Access Control**: Users can only query content they own or have access to through:
   - Purchased books
   - Entitlements
   - Free tier content

## AI Modes

### 1. General Coach Mode
**Triggered**: User opens AI from home screen

**Context Includes**:
- User profile and preferences
- Active goals
- Owned books
- Recent reading progress
- Recent journal summaries
- Past conversation history

**Use Case**: "How can I improve my meditation practice?"

### 2. Book Context Mode
**Triggered**: User asks AI from inside a book page

**Client Must Send**:
```json
{
  "book_id": "uuid",
  "chapter_id": "uuid",
  "section_id": "uuid",
  "page_number": 42
}
```

**Retrieval Priority**:
1. Active section content (highest priority)
2. Active chapter content
3. Nearby pages (±5 pages)
4. Rest of the book
5. Other owned books (lower relevance)

**Use Case**: "Can you explain this breathing technique in more detail?"

### 3. Chapter Mode
**Triggered**: Specific chapter focus

**Context**: Deep understanding of single chapter

### 4. Goal Mode
**Triggered**: Goal-specific coaching

**Context**: User goal + relevant content

### 5. Journal Mode
**Triggered**: Reflection on journal entry

**Context**: Journal entry + relevant insights from books

## Architecture

### Service Layer

```
services/api/src/lib/ai/
├── embedding.service.ts      # OpenAI embeddings generation
├── retrieval.service.ts       # Vector similarity search
├── prompt.service.ts          # Context-aware prompt building
├── chat.service.ts            # OpenAI chat completions
└── ingestion.service.ts       # Content processing pipeline
```

### Key Services

#### 1. Embedding Service
Generates 1536-dimensional embeddings using OpenAI `text-embedding-3-small`

```typescript
const { embedding, tokens } = await generateEmbedding(text);
```

#### 2. Retrieval Service
Performs semantic search with access control

```typescript
const chunks = await retrieveRelevantContent({
  userId,
  query,
  bookId,        // Optional: focus on specific book
  chapterId,     // Optional: focus on specific chapter
  sectionId,     // Optional: focus on specific section
  limit: 5,
  similarityThreshold: 0.7,
});
```

#### 3. Prompt Service
Builds context-aware prompts with guardrails

```typescript
const builtPrompt = await buildSystemPrompt({
  mode: 'book',  // or 'general', 'chapter', 'goal', 'journal'
  userId,
  userProfile,
  userGoals,
  recentProgress,
  conversationSummary,
  retrievedChunks,
  bookContext: {
    bookId,
    chapterId,
    sectionId,
    pageNumber
  }
});
```

#### 4. Chat Service
Generates responses with moderation

```typescript
const completion = await generateChatCompletion(
  chatMessages,
  builtPrompt,
  modelConfig
);
```

#### 5. Ingestion Service
Processes book content into searchable chunks

```typescript
await ingestBookContent(bookId);  // Full pipeline
await reindexBook(bookId);        // Regenerate embeddings
```

## RAG Pipeline

### Ingestion Flow

1. **Content Extraction**
   - Fetch book chapters and sections from database
   - Extract text content

2. **Chunking**
   - Split text into ~500-word chunks
   - 50-word overlap between chunks
   - Preserve semantic boundaries

3. **Metadata Attachment**
   - Book/chapter/section IDs
   - Page numbers
   - Titles and context

4. **Embedding Generation**
   - Batch process chunks (20 at a time)
   - Generate OpenAI embeddings
   - Store in PostgreSQL with pgvector

5. **Indexing**
   - Create IVFFlat indexes
   - Enable fast similarity search

### Retrieval Flow

1. **Query Embedding**
   - Convert user question to embedding

2. **Access Check**
   - Verify user owns/has access to queried content
   - Filter to accessible books only

3. **Similarity Search**
   - Use PostgreSQL functions:
     - `match_book_chunks()` - For book-specific queries
     - `match_user_chunks()` - For general queries
   - Return top-k most similar chunks (k=5 default)

4. **Context Boosting**
   - Boost results from active book/chapter
   - Prioritize nearby pages in book mode

5. **Source Tracking**
   - Log retrieved chunks
   - Track citation metadata

### Response Generation Flow

1. **Context Assembly**
   ```
   [System Prompt]
   + [Guardrails]
   + [User Profile]
   + [User Goals]
   + [Recent Progress]
   + [Retrieved Content with Citations]
   + [Conversation History]
   + [Active Book Context]
   ```

2. **Completion Generation**
   - Send to OpenAI GPT-4
   - Apply model configuration (temperature, max_tokens, etc.)

3. **Response Enhancement**
   - Extract book recommendations
   - Attach source references
   - Generate citation metadata

4. **Usage Logging**
   - Log tokens used
   - Track retrieval quality
   - Record model and context type

## API Endpoints

### User Endpoints

#### Create Conversation
```http
POST /api/ai/conversations
Authorization: Bearer {token}

{
  "context_type": "book",
  "context_id": "optional-uuid",
  "title": "Understanding Chapter 3",
  "book_id": "book-uuid",
  "chapter_id": "chapter-uuid"
}
```

#### Send Message
```http
POST /api/ai/messages
Authorization: Bearer {token}

{
  "conversation_id": "conv-uuid",
  "content": "Can you explain the breathing technique from page 42?",
  "book_id": "book-uuid",
  "chapter_id": "chapter-uuid",
  "section_id": "section-uuid",
  "page_number": 42
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "msg-uuid",
      "role": "assistant",
      "content": "Based on the content from 'Mindful Breathing' (Chapter 3, Section 2)...",
      "tokens_used": 342,
      "model": "gpt-4-turbo-preview"
    },
    "answer": "Full response text...",
    "mode": "book",
    "source_references": [
      {
        "book_id": "book-uuid",
        "book_title": "The Power of Mindfulness",
        "chapter_id": "chapter-uuid",
        "chapter_title": "Mindful Breathing",
        "section_id": "section-uuid",
        "section_title": "Basic Techniques",
        "page_number": 42,
        "similarity": 0.89
      }
    ],
    "recommendations": [
      {
        "type": "book",
        "id": "book-uuid",
        "title": "The Power of Mindfulness",
        "reason": "Referenced in response with 3 relevant sections"
      }
    ],
    "usage": {
      "tokens_used": 342,
      "model": "gpt-4-turbo-preview",
      "chunks_retrieved": 5
    },
    "conversation_id": "conv-uuid"
  }
}
```

#### List Conversations
```http
GET /api/ai/conversations
Authorization: Bearer {token}
```

#### Get Conversation with Messages
```http
GET /api/ai/conversations/{id}
Authorization: Bearer {token}
```

#### Delete Conversation
```http
DELETE /api/ai/conversations/{id}
Authorization: Bearer {token}
```

### Admin Endpoints

#### Prompt Template Management

**List Templates**:
```http
GET /api/ai/prompts
Authorization: Bearer {admin-token}
```

**Create Template**:
```http
POST /api/ai/prompts
Authorization: Bearer {admin-token}

{
  "name": "Book Context Coach",
  "context_type": "book",
  "system_prompt": "You are a MindFuel coach helping with {book_title}...",
  "guardrails": "Do not provide advice outside the book content...",
  "is_active": true
}
```

**Update Template**:
```http
PUT /api/ai/prompts/{id}
Authorization: Bearer {admin-token}
```

**Delete Template**:
```http
DELETE /api/ai/prompts/{id}
Authorization: Bearer {admin-token}
```

#### Model Configuration

**List Configs**:
```http
GET /api/ai/models
Authorization: Bearer {admin-token}
```

**Create Config**:
```http
POST /api/ai/models
Authorization: Bearer {admin-token}

{
  "name": "GPT-4 Balanced",
  "model_name": "gpt-4-turbo-preview",
  "temperature": 0.7,
  "max_tokens": 1000,
  "top_p": 1.0,
  "frequency_penalty": 0.0,
  "presence_penalty": 0.0,
  "is_active": true
}
```

**Update Config**:
```http
PUT /api/ai/models/{id}
Authorization: Bearer {admin-token}
```

#### Content Ingestion

**Get Ingestion Status**:
```http
GET /api/admin/ingestion/status
Authorization: Bearer {admin-token}
```

Response:
```json
{
  "success": true,
  "data": {
    "total_books": 25,
    "total_chunks": 15420,
    "status_counts": {
      "completed": 20,
      "processing": 2,
      "failed": 1,
      "not_started": 2
    },
    "books": [...]
  }
}
```

**Ingest Book**:
```http
POST /api/admin/ingestion/books/{bookId}
Authorization: Bearer {admin-token}
```

**Reindex Book**:
```http
POST /api/admin/ingestion/books/{bookId}/reindex
Authorization: Bearer {admin-token}
```

**Delete Book Index**:
```http
DELETE /api/admin/ingestion/books/{bookId}
Authorization: Bearer {admin-token}
```

#### AI Usage Analytics

```http
GET /api/ai/usage?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer {admin-token}
```

Response:
```json
{
  "success": true,
  "data": {
    "total_tokens": 1250000,
    "total_messages": 3542,
    "unique_users": 245,
    "by_model": {
      "gpt-4-turbo-preview": {
        "count": 3200,
        "tokens": 1100000
      },
      "gpt-3.5-turbo": {
        "count": 342,
        "tokens": 150000
      }
    },
    "by_context_type": {
      "book": { "count": 2100, "tokens": 750000 },
      "general": { "count": 1200, "tokens": 400000 },
      "goal": { "count": 242, "tokens": 100000 }
    },
    "estimated_cost": 12.50,
    "recent_logs": [...]
  }
}
```

## Database Schema

### AI-Specific Tables

```sql
-- Conversations
ai_conversations (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users,
  title text,
  context_type conversation_context,
  context_id uuid,
  book_id uuid REFERENCES books,
  chapter_id uuid REFERENCES book_chapters,
  is_active boolean DEFAULT true,
  message_count int DEFAULT 0,
  total_tokens_used int DEFAULT 0,
  created_at timestamptz,
  updated_at timestamptz
)

-- Messages
ai_messages (
  id uuid PRIMARY KEY,
  conversation_id uuid REFERENCES ai_conversations,
  user_id uuid REFERENCES users,
  role text CHECK (role IN ('user', 'assistant', 'system')),
  content text,
  context_type conversation_context,
  context_id uuid,
  tokens_used int,
  model text,
  created_at timestamptz
)

-- Prompt Templates
ai_prompt_templates (
  id uuid PRIMARY KEY,
  name text,
  context_type conversation_context,
  system_prompt text,
  guardrails text,
  variables jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz,
  updated_at timestamptz
)

-- Model Configurations
ai_model_configs (
  id uuid PRIMARY KEY,
  name text,
  model_name text,
  temperature numeric,
  max_tokens int,
  top_p numeric,
  frequency_penalty numeric,
  presence_penalty numeric,
  is_active boolean DEFAULT true,
  created_at timestamptz
)

-- Usage Logs
ai_usage_logs (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users,
  conversation_id uuid REFERENCES ai_conversations,
  message_id uuid REFERENCES ai_messages,
  model text,
  tokens_used int,
  context_type conversation_context,
  retrieval_count int,
  created_at timestamptz
)

-- Retrieval Logs
retrieval_logs (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users,
  conversation_id uuid REFERENCES ai_conversations,
  query text,
  chunks_retrieved int,
  tokens_used int,
  chunk_ids uuid[],
  avg_similarity numeric,
  created_at timestamptz
)

-- Content Chunks
content_chunks (
  id uuid PRIMARY KEY,
  book_id uuid REFERENCES books,
  chapter_id uuid REFERENCES book_chapters,
  section_id uuid REFERENCES book_sections,
  chunk_text text,
  chunk_index int,
  token_count int,
  page_number int,
  embedding vector(1536),
  metadata jsonb,
  created_at timestamptz
)
```

### Vector Search Functions

```sql
-- Search within specific book/chapter
match_book_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  filter_book_id uuid DEFAULT NULL,
  filter_chapter_id uuid DEFAULT NULL,
  filter_section_id uuid DEFAULT NULL
) RETURNS TABLE (...)

-- Search across user's accessible books
match_user_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  accessible_book_ids uuid[]
) RETURNS TABLE (...)
```

## Security & Cost Control

### Backend-Only Operations
- All API keys (OpenAI, etc.) stored server-side only
- Never exposed to client applications
- Model calls exclusively from backend

### Token Usage Tracking
- Every API call logged
- User-level usage metrics
- Cost estimation and alerting
- Per-conversation token limits

### Rate Limiting
- User-level: 20 messages per hour
- Global: 1000 requests per minute
- Burst protection with Redis

### Content Moderation
- Input: OpenAI moderation API checks user messages
- Output: Guardrails prevent inappropriate responses
- Audit: All flagged content logged

### Caching Strategy
- Conversation summaries cached
- Frequently retrieved chunks cached (Redis)
- Embeddings cached permanently (PostgreSQL)

## Performance Optimization

### Embedding Generation
- Batch processing (20 texts at a time)
- Async job processing for large books
- Progress tracking and resumption

### Vector Search
- IVFFlat indexes for fast similarity search
- Configurable similarity thresholds
- Limit results to top-k (default k=5)

### Prompt Compression
- Conversation summarization after 10+ messages
- Old messages compressed to summaries
- Reduces token usage by ~60%

## Admin Management

### Prompt Engineering
Admins can create custom prompts for each mode:

- **General Coach**: Broad personal development
- **Book Context**: Deep book-specific coaching
- **Chapter Focus**: Chapter comprehension
- **Goal Support**: Goal-oriented guidance
- **Journal Reflection**: Reflective insights

### A/B Testing
- Multiple prompt templates per mode
- Track performance metrics
- Gradually roll out improvements

### Quality Monitoring
- Review random sample of conversations
- Flag low-quality responses
- Refine prompts based on feedback

### Cost Management
- Set monthly token budgets
- Alert on unusual usage
- Model switching for cost optimization
- Automatic fallback to cheaper models

## Integration Examples

### Mobile App Integration

```typescript
// Create conversation when opening AI
const conversation = await api.post('/ai/conversations', {
  context_type: 'book',
  book_id: currentBookId,
  chapter_id: currentChapterId,
});

// Send message with full context
const response = await api.post('/ai/messages', {
  conversation_id: conversation.id,
  content: userMessage,
  book_id: currentBookId,
  chapter_id: currentChapterId,
  section_id: currentSectionId,
  page_number: currentPage,
});

// Display response with citations
displayMessage(response.data.answer);
displaySources(response.data.source_references);
displayRecommendations(response.data.recommendations);
```

### Admin Dashboard Integration

```typescript
// Monitor ingestion status
const status = await adminApi.get('/admin/ingestion/status');

// Trigger book ingestion
await adminApi.post(`/admin/ingestion/books/${bookId}`);

// View usage analytics
const usage = await adminApi.get('/ai/usage', {
  params: {
    start_date: '2024-01-01',
    end_date: '2024-01-31'
  }
});

// Update prompt template
await adminApi.put(`/ai/prompts/${templateId}`, {
  system_prompt: newPrompt,
  guardrails: newGuardrails,
});
```

## Testing

### Unit Tests
```bash
npm test services/api/src/lib/ai/*.service.test.ts
```

### Integration Tests
- Test full RAG pipeline
- Verify access control
- Check response quality

### Load Tests
- 100 concurrent users
- 1000 messages per minute
- Monitor latency and costs

## Monitoring

### Key Metrics
- Average response time
- Token usage per user/day
- Retrieval accuracy (similarity scores)
- User satisfaction (ratings)
- Cost per conversation
- Error rates

### Alerts
- High token usage (>100k/hour)
- Low retrieval quality (similarity <0.6)
- API failures
- Moderation flags

## Future Enhancements

- Fine-tuned models on MindFuel content
- Multi-modal support (images, audio)
- Voice-to-text conversation
- Personalized model selection per user
- Automatic prompt optimization
- Citation highlighting in book reader
- Conversation export/sharing
- AI-generated summaries
- Proactive coaching suggestions

## Summary

The MindFuel AI coaching system provides intelligent, context-aware personal development support powered exclusively by curated content. With RAG, strict guardrails, and comprehensive admin controls, it delivers high-quality coaching while maintaining full control over responses and costs.
