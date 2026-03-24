# Content Taxonomy & AI System Implementation

## Overview

This document describes the complete implementation of the content taxonomy system and Python-based AI service for MindFuel AI.

## 1. Content Taxonomy System

### Architecture

The new taxonomy system replaces loose text fields (`category`, `subcategory`) with a robust, scalable relational structure that supports:

- **Multi-classification**: Content can belong to multiple categories, subcategories, and tags
- **Reusability**: Same taxonomy across workbooks, books, products, and AI content
- **Admin control**: Sort order, activation status, metadata
- **Future-ready**: Supports i18n, SEO, personalization

### Database Schema

#### Core Tables

**`content_categories`** - Main classification buckets
- Mindset, Productivity, Communication, Leadership, Sales, Wellness
- Fields: `id`, `name`, `slug`, `description`, `icon`, `color`, `sort_order`, `is_active`, `metadata`

**`content_subcategories`** - Nested classifications
- Confidence, Focus, Negotiation, Public Speaking, etc.
- Fields: `id`, `category_id`, `name`, `slug`, `description`, `sort_order`, `is_active`, `metadata`

**`content_tags`** - Flexible cross-cutting labels
- Beginner, AI-Enabled, Habit-Building, Quick Win, etc.
- Fields: `id`, `name`, `slug`, `type` (level/feature/theme/skill), `color`, `is_active`, `metadata`

#### Mapping Tables (Many-to-Many)

- `workbook_category_map` / `workbook_subcategory_map` / `workbook_content_tags`
- `book_category_map` / `book_subcategory_map` / `book_content_tags`
- `product_category_map` / `product_content_tags`

### API Endpoints

#### Categories
- `GET /api/taxonomy/categories` - List all categories
- `GET /api/taxonomy/categories/:id` - Get category with subcategories
- `POST /api/taxonomy/categories` - Create category (admin only)
- `PUT /api/taxonomy/categories/:id` - Update category
- `DELETE /api/taxonomy/categories/:id` - Delete category
- `PUT /api/taxonomy/categories/:id/reorder` - Change sort order

#### Subcategories
- `GET /api/taxonomy/subcategories` - List all subcategories
- `GET /api/taxonomy/categories/:categoryId/subcategories` - Get by parent
- `POST /api/taxonomy/subcategories` - Create subcategory
- `PUT /api/taxonomy/subcategories/:id` - Update subcategory
- `DELETE /api/taxonomy/subcategories/:id` - Delete subcategory

#### Tags
- `GET /api/taxonomy/tags` - List all tags
- `GET /api/taxonomy/tags/type/:type` - Filter by type (level/feature/theme/skill)
- `POST /api/taxonomy/tags` - Create tag
- `PUT /api/taxonomy/tags/:id` - Update tag
- `DELETE /api/taxonomy/tags/:id` - Delete tag

#### Content Mappings
- `GET /api/taxonomy/workbooks/:workbookId/taxonomy` - Get all taxonomy for workbook
- `POST /api/taxonomy/workbooks/:workbookId/categories` - Add category to workbook
- `DELETE /api/taxonomy/workbooks/:workbookId/categories/:categoryId` - Remove category
- Similar endpoints for subcategories and tags
- Similar pattern for books and products

#### Browse by Taxonomy
- `GET /api/taxonomy/browse/category/:slug` - Get all content in category
- `GET /api/taxonomy/browse/subcategory/:slug` - Get all content in subcategory
- `GET /api/taxonomy/browse/tag/:slug` - Get all content with tag

### Mobile App UX Enhancements

With the new taxonomy system, the mobile app can now provide:

1. **Home Screen Category Carousels**
   ```typescript
   GET /api/taxonomy/categories?active=true
   // Returns categories with icons and colors
   // Display as horizontal scrollable categories
   ```

2. **Subcategory Tabs**
   ```typescript
   GET /api/taxonomy/categories/:categoryId/subcategories
   // Show as tabs when user selects a category
   ```

3. **Tag-based Filtering**
   ```typescript
   GET /api/taxonomy/tags?type=level
   // Show difficulty level filter: Beginner, Intermediate, Advanced
   ```

4. **Browse Content by Classification**
   ```typescript
   GET /api/taxonomy/browse/category/mindset
   // Returns all workbooks, books, products in "Mindset" category
   ```

### Sample Data Seeded

**Categories:**
- Mindset (purple)
- Productivity (blue)
- Communication (green)
- Leadership (orange)
- Sales (red)
- Wellness (pink)

**Subcategories:**
- Mindset: Confidence, Resilience, Growth Mindset
- Productivity: Focus, Time Management, Habits
- Communication: Public Speaking, Negotiation, Active Listening

**Tags:**
- Levels: Beginner, Intermediate, Advanced
- Features: AI-Enabled, Interactive
- Themes: Habit-Building, Quick Win, Deep Work, Daily Practice

---

## 2. Python AI Service

### Architecture

A standalone Python FastAPI service providing:
- **Embeddings**: Text-to-vector using OpenAI
- **RAG**: Retrieval-Augmented Generation
- **Chat**: Intelligent conversational AI with personalization

### Service Structure

```
services/ai-python/
├── requirements.txt
├── Dockerfile
├── .env.example
├── README.md
└── app/
    ├── __init__.py
    ├── config.py          # Settings management
    ├── database.py        # Supabase client
    ├── main.py            # FastAPI app
    ├── services/
    │   ├── embedding_service.py   # Generate embeddings
    │   ├── rag_service.py         # RAG pipeline
    │   └── chat_service.py        # AI chat
    └── routes/
        ├── embedding_routes.py
        ├── rag_routes.py
        └── chat_routes.py
```

### Key Features

#### 1. Embedding Service

**Text Chunking with Overlap**
- Intelligent chunking preserving context
- Configurable chunk size (default: 1000 tokens)
- Configurable overlap (default: 200 tokens)
- Token counting with tiktoken

**Batch Processing**
- Generate multiple embeddings in single API call
- Efficient for large content ingestion

**Book Ingestion**
```python
POST /embeddings/ingest-book/{book_id}
# Processes entire book: chapters + sections
# Chunks content, generates embeddings, stores in DB
```

#### 2. RAG Service

**Semantic Search**
```python
POST /rag/search
{
  "query": "How can I improve my focus?",
  "top_k": 5,
  "filters": {"book_id": "specific-book"}
}
# Returns most relevant content chunks using vector similarity
```

**Context Building**
```python
POST /rag/build-context
# Builds comprehensive context including:
# - Relevant content from library (via semantic search)
# - User's current goals
# - Recent journal entries
# - Reading progress
```

**Book Ingestion**
```python
POST /rag/ingest-book
{
  "book_id": "uuid"
}
# Full pipeline: fetch → chunk → embed → store
```

#### 3. Chat Service

**Intelligent Responses**
```python
POST /chat/
{
  "message": "How do I build better habits?",
  "user_id": "user-uuid",
  "use_rag": true,
  "conversation_id": "conv-uuid"  // optional for continuity
}
```

**Streaming Responses**
```python
POST /chat/stream
# Returns Server-Sent Events stream
# For real-time response generation
```

**Personalized Suggestions**
```python
POST /chat/suggestions
{
  "user_id": "user-uuid",
  "suggestion_type": "goal"  // general, goal, practice, reading
}
# Generates contextual suggestions based on user journey
```

### Tech Stack

- **FastAPI**: Modern async web framework
- **OpenAI**: GPT-4 Turbo & text-embedding-3-small
- **Supabase**: PostgreSQL with pgvector
- **Tiktoken**: Token counting
- **Pydantic**: Data validation

### Configuration

Environment variables (`.env`):

```bash
# OpenAI
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Supabase
SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key

# Tuning
MAX_TOKENS=4096
TEMPERATURE=0.7
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
TOP_K_RESULTS=5
```

### Deployment

**Standalone**
```bash
cd services/ai-python
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Docker**
```bash
docker build -t mindfuel-ai-python .
docker run -p 8000:8000 --env-file .env mindfuel-ai-python
```

**Docker Compose** (with Node.js API)
```yaml
services:
  api:
    build: ./services/api
    ports:
      - "3000:3000"
    environment:
      AI_PYTHON_URL: http://ai-python:8000

  ai-python:
    build: ./services/ai-python
    ports:
      - "8000:8000"
    env_file: ./services/ai-python/.env
```

### Integration with Node.js API

The Node.js API can proxy requests to the Python service:

```typescript
// services/api/src/lib/ai-client.ts
import fetch from 'node-fetch';

const AI_SERVICE_URL = process.env.AI_PYTHON_URL || 'http://localhost:8000';

export async function chat(message: string, userId: string, useRag: boolean = true) {
  const response = await fetch(`${AI_SERVICE_URL}/chat/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      user_id: userId,
      use_rag: useRag
    })
  });

  return response.json();
}

export async function ingestBook(bookId: string) {
  const response = await fetch(`${AI_SERVICE_URL}/rag/ingest-book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ book_id: bookId })
  });

  return response.json();
}
```

---

## 3. Admin Workflow

### Content Upload & Processing

**Option 1: Manual Entry**
1. Admin creates book via `POST /api/books`
2. Admin adds chapters via `POST /api/books/:id/chapters`
3. Admin adds sections with content
4. Admin assigns taxonomy via `/api/taxonomy/books/:bookId/categories`
5. Admin triggers ingestion via `POST http://ai-python:8000/rag/ingest-book`

**Option 2: PDF Upload** (future enhancement)
1. Admin uploads PDF via `POST /api/uploads/file`
2. Background worker extracts text and structure
3. Auto-creates book/chapters/sections
4. Auto-ingests into RAG system
5. Admin reviews and assigns taxonomy

### Taxonomy Management

1. **Create Categories**
   - `POST /api/taxonomy/categories`
   - Set name, slug, icon, color, sort order

2. **Create Subcategories**
   - `POST /api/taxonomy/subcategories`
   - Link to parent category

3. **Create Tags**
   - `POST /api/taxonomy/tags`
   - Specify type (level/feature/theme/skill)

4. **Assign to Content**
   - For each piece of content (workbook/book/product)
   - `POST /api/taxonomy/workbooks/:id/categories`
   - `POST /api/taxonomy/workbooks/:id/subcategories`
   - `POST /api/taxonomy/workbooks/:id/tags`

---

## 4. Mobile App Updates Needed

### Fetch Taxonomy on App Load

```typescript
// src/store/slices/taxonomySlice.ts
export const fetchTaxonomy = createAsyncThunk(
  'taxonomy/fetchAll',
  async () => {
    const [categories, tags] = await Promise.all([
      api.get('/taxonomy/categories?active=true'),
      api.get('/taxonomy/tags?active=true')
    ]);
    return { categories, tags };
  }
);
```

### Home Screen with Category Carousels

```tsx
// src/screens/home/HomeScreen.tsx
const categories = useSelector(state => state.taxonomy.categories);

<ScrollView horizontal>
  {categories.map(category => (
    <CategoryCard
      key={category.id}
      name={category.name}
      icon={category.icon}
      color={category.color}
      onPress={() => navigation.navigate('Browse', { categorySlug: category.slug })}
    />
  ))}
</ScrollView>
```

### Browse Screen with Filters

```tsx
// src/screens/browse/BrowseScreen.tsx
const [selectedCategory, setSelectedCategory] = useState(null);
const [selectedTags, setSelectedTags] = useState([]);

// Fetch content
const { data } = useQuery({
  queryKey: ['browse', selectedCategory, selectedTags],
  queryFn: () => api.get(`/taxonomy/browse/category/${selectedCategory}`)
});

// Show tag filters
<TagFilter
  tags={levelTags}
  selected={selectedTags}
  onSelect={setSelectedTags}
/>
```

### Workbook/Book Detail with Taxonomy

```tsx
// Display taxonomy badges
<View style={styles.taxonomyContainer}>
  {item.categories.map(cat => (
    <Badge key={cat.id} color={cat.color}>{cat.name}</Badge>
  ))}
  {item.tags.map(tag => (
    <Badge key={tag.id} color={tag.color}>{tag.name}</Badge>
  ))}
</View>
```

---

## 5. Benefits of New System

### For Users
- **Better Discovery**: Find content by category, difficulty level, features
- **Personalized Recommendations**: AI can suggest content based on taxonomy + user context
- **Clear Organization**: Understand content structure at a glance
- **Progress Tracking**: Track progress by category or skill area

### For Admins
- **Consistent Classification**: Same system across all content types
- **Flexible Organization**: Multiple categories/tags per item
- **Easy Management**: Reorder, activate/deactivate, add metadata
- **Scalable**: Add new classifications without code changes

### For Development
- **SEO**: Structured data for search engines
- **Analytics**: Track engagement by category/tag
- **Recommendations**: Build ML models using taxonomy signals
- **i18n Ready**: Metadata field supports translations

---

## 6. Next Steps

1. **Complete mobile app integration** - Update screens to use new taxonomy API
2. **Build admin UI** - Create admin panel for managing categories/tags
3. **PDF Processing** - Implement automated PDF → book conversion
4. **AI Enhancements** - Fine-tune prompts, add more personalization
5. **Analytics** - Track which categories/tags drive engagement
6. **Testing** - Comprehensive tests for taxonomy system and AI service

---

## 7. Migration Path

### Existing Data
- Old `category` and `subcategory` text fields remain in database for backward compatibility
- Run backfill script to:
  1. Map existing categories to new `content_categories`
  2. Create mappings in bridge tables
  3. Eventually drop old text columns

### API Versioning
- Current API continues to work
- New `/api/taxonomy/*` endpoints for new features
- Mobile app updates gradually adopt new system

---

## Conclusion

The new content taxonomy and Python AI system provide a solid foundation for scalable, intelligent content organization and personalized user experiences. The separation of concerns (Node.js for CRUD, Python for ML) allows each service to excel at its strengths while maintaining clean integration points.
