"""API routes for RAG operations."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
from app.services.rag_service import rag_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/rag", tags=["rag"])


class SearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = None
    filters: Optional[Dict] = None


class IngestBookRequest(BaseModel):
    book_id: str


@router.post("/search")
async def search_content(request: SearchRequest):
    """Search for relevant content using RAG."""
    try:
        results = await rag_service.retrieve_relevant_content(
            query=request.query,
            top_k=request.top_k,
            filters=request.filters
        )
        return {
            "query": request.query,
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        logger.error(f"Error searching content: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/build-context")
async def build_context(
    query: str,
    user_id: Optional[str] = None,
    top_k: Optional[int] = None,
    filters: Optional[Dict] = None
):
    """Build comprehensive context for LLM generation."""
    try:
        context = await rag_service.build_context(
            query=query,
            user_id=user_id,
            top_k=top_k,
            filters=filters
        )
        return context
    except Exception as e:
        logger.error(f"Error building context: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ingest-book")
async def ingest_book(request: IngestBookRequest):
    """Ingest a complete book into the RAG system."""
    try:
        result = await rag_service.ingest_book(request.book_id)
        return result
    except Exception as e:
        logger.error(f"Error ingesting book: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Check RAG service health."""
    return {
        "status": "healthy",
        "service": "rag"
    }
