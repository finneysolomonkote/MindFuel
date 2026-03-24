# MindFuel AI Python Service

Python-based AI/ML service providing embeddings, RAG (Retrieval-Augmented Generation), and intelligent chat capabilities for the MindFuel AI platform.

## Features

- **Embeddings Generation**: Generate text embeddings using OpenAI's latest models
- **Content Processing**: Intelligent text chunking with overlap for optimal context preservation
- **RAG System**: Retrieval-augmented generation for context-aware responses
- **AI Chat**: Intelligent conversational AI with personalization
- **Book Ingestion**: Automated processing of books/workbooks into the knowledge base
- **Vector Search**: Semantic search across all content using pgvector

## Tech Stack

- **FastAPI**: Modern, fast web framework
- **OpenAI**: GPT-4 and text-embedding-3-small
- **Supabase**: PostgreSQL with pgvector extension
- **Tiktoken**: Token counting and management
- **Pydantic**: Data validation and settings

## Setup

### Prerequisites

- Python 3.11+
- OpenAI API key
- Supabase project with pgvector enabled

### Installation

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. Run the service:
```bash
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

### Embeddings

- `POST /embeddings/generate` - Generate single embedding
- `POST /embeddings/generate-batch` - Generate batch embeddings
- `POST /embeddings/process-content` - Chunk and embed content
- `POST /embeddings/ingest-book/{book_id}` - Ingest complete book
- `GET /embeddings/token-count` - Count tokens in text

### RAG (Retrieval-Augmented Generation)

- `POST /rag/search` - Semantic search for relevant content
- `POST /rag/build-context` - Build comprehensive context for LLM
- `POST /rag/ingest-book` - Ingest book with full processing
- `GET /rag/health` - Health check

### Chat

- `POST /chat/` - Generate AI response
- `POST /chat/stream` - Generate streaming AI response
- `POST /chat/suggestions` - Generate personalized suggestions
- `GET /chat/health` - Health check

## Usage Examples

### Generate Embeddings

```python
import requests

response = requests.post("http://localhost:8000/embeddings/generate", json={
    "text": "Personal development is a lifelong journey"
})
embedding = response.json()["embedding"]
```

### Ingest a Book

```python
response = requests.post("http://localhost:8000/rag/ingest-book", json={
    "book_id": "book-uuid-here"
})
print(response.json())
```

### Chat with AI

```python
response = requests.post("http://localhost:8000/chat/", json={
    "message": "How can I improve my productivity?",
    "user_id": "user-uuid-here",
    "use_rag": True
})
print(response.json()["message"])
```

### Streaming Chat

```python
import httpx

with httpx.stream("POST", "http://localhost:8000/chat/stream", json={
    "message": "Tell me about growth mindset",
    "use_rag": True
}) as response:
    for chunk in response.iter_text():
        print(chunk, end="", flush=True)
```

## Architecture

### Embedding Pipeline

1. **Text Chunking**: Split content into optimal chunks with overlap
2. **Token Counting**: Count tokens for accurate API usage
3. **Batch Processing**: Generate embeddings in batches for efficiency
4. **Storage**: Store in Supabase with pgvector for similarity search

### RAG Pipeline

1. **Query Processing**: Generate embedding for user query
2. **Vector Search**: Find most relevant content chunks
3. **Context Building**: Aggregate relevant chunks with metadata
4. **User Personalization**: Add user context (goals, progress, journals)
5. **LLM Generation**: Generate response with enriched context

### Chat Pipeline

1. **Context Retrieval**: Get conversation history and user context
2. **RAG Integration**: Retrieve relevant content if enabled
3. **Prompt Engineering**: Build comprehensive system prompt
4. **Generation**: Use GPT-4 to generate response
5. **Storage**: Save conversation for continuity

## Configuration

Key settings in `.env`:

- `OPENAI_MODEL`: GPT model for chat (default: gpt-4-turbo-preview)
- `OPENAI_EMBEDDING_MODEL`: Embedding model (default: text-embedding-3-small)
- `CHUNK_SIZE`: Maximum tokens per chunk (default: 1000)
- `CHUNK_OVERLAP`: Overlap between chunks (default: 200)
- `TOP_K_RESULTS`: Number of results in RAG retrieval (default: 5)
- `MAX_TOKENS`: Maximum tokens in chat response (default: 4096)
- `TEMPERATURE`: Creativity level (default: 0.7)

## Docker Deployment

Build and run with Docker:

```bash
docker build -t mindfuel-ai-python .
docker run -p 8000:8000 --env-file .env mindfuel-ai-python
```

## Integration with Node.js API

The Python service works alongside the Node.js API. The Node.js API can proxy requests to this service:

```typescript
// In Node.js API
const aiResponse = await fetch('http://ai-python:8000/chat/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userMessage,
    user_id: userId,
    use_rag: true
  })
});
```

## Performance Optimization

- Use batch operations for multiple embeddings
- Implement caching with Redis for frequent queries
- Use background tasks for long-running operations (book ingestion)
- Optimize chunk size based on content type
- Implement rate limiting for API calls

## Monitoring

- Health check endpoints at `/health`, `/rag/health`, `/chat/health`
- Structured logging for all operations
- Token usage tracking
- Error reporting and handling

## Development

Run tests:
```bash
pytest tests/
```

Format code:
```bash
black app/
```

Type checking:
```bash
mypy app/
```

## API Documentation

Interactive API documentation available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
