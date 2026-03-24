"""API routes for embedding operations."""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict
from app.services.embedding_service import embedding_service
from app.database import supabase_client
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/embeddings", tags=["embeddings"])


class EmbeddingRequest(BaseModel):
    text: str


class BatchEmbeddingRequest(BaseModel):
    texts: List[str]


class ContentProcessRequest(BaseModel):
    content: str
    metadata: Optional[Dict] = None
    chunk_size: Optional[int] = None
    chunk_overlap: Optional[int] = None


@router.post("/generate")
async def generate_embedding(request: EmbeddingRequest):
    """Generate embedding for a single text."""
    try:
        embedding = await embedding_service.generate_embedding(request.text)
        return {
            "embedding": embedding,
            "dimensions": len(embedding)
        }
    except Exception as e:
        logger.error(f"Error generating embedding: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-batch")
async def generate_batch_embeddings(request: BatchEmbeddingRequest):
    """Generate embeddings for multiple texts."""
    try:
        embeddings = await embedding_service.generate_embeddings_batch(request.texts)
        return {
            "embeddings": embeddings,
            "count": len(embeddings),
            "dimensions": len(embeddings[0]) if embeddings else 0
        }
    except Exception as e:
        logger.error(f"Error generating batch embeddings: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/process-content")
async def process_content(request: ContentProcessRequest):
    """Process content: chunk and generate embeddings."""
    try:
        chunks = await embedding_service.process_content(
            request.content,
            metadata=request.metadata,
            chunk_size=request.chunk_size,
            chunk_overlap=request.chunk_overlap
        )
        return {
            "chunks": chunks,
            "total_chunks": len(chunks),
            "total_tokens": sum(c["token_count"] for c in chunks)
        }
    except Exception as e:
        logger.error(f"Error processing content: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ingest-book/{book_id}")
async def ingest_book(book_id: str, background_tasks: BackgroundTasks):
    """Ingest a book into the embedding system (async background task)."""
    try:
        # Add to background tasks for async processing
        async def process_book():
            book_data = await supabase_client.get_book_content(book_id)
            if not book_data:
                raise ValueError(f"Book not found: {book_id}")

            chunks = await embedding_service.process_book_content(book_data)
            await supabase_client.store_embeddings(book_id, chunks)
            logger.info(f"Successfully ingested book {book_id}")

        background_tasks.add_task(process_book)

        return {
            "message": "Book ingestion started",
            "book_id": book_id,
            "status": "processing"
        }
    except Exception as e:
        logger.error(f"Error starting book ingestion: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/token-count")
async def count_tokens(text: str):
    """Count tokens in a text string."""
    try:
        count = embedding_service.count_tokens(text)
        return {"text_length": len(text), "token_count": count}
    except Exception as e:
        logger.error(f"Error counting tokens: {e}")
        raise HTTPException(status_code=500, detail=str(e))
