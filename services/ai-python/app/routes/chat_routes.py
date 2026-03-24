"""API routes for chat operations."""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, Dict
from app.services.chat_service import chat_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None
    conversation_id: Optional[str] = None
    use_rag: bool = True
    filters: Optional[Dict] = None


class SuggestionRequest(BaseModel):
    user_id: str
    suggestion_type: str = "general"


@router.post("/")
async def chat(request: ChatRequest):
    """Generate AI chat response."""
    try:
        response = await chat_service.chat(
            message=request.message,
            user_id=request.user_id,
            conversation_id=request.conversation_id,
            use_rag=request.use_rag,
            filters=request.filters
        )
        return response
    except Exception as e:
        logger.error(f"Error in chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    """Generate streaming AI chat response."""
    try:
        async def generate():
            try:
                async for chunk in chat_service.chat_stream(
                    message=request.message,
                    user_id=request.user_id,
                    conversation_id=request.conversation_id,
                    use_rag=request.use_rag,
                    filters=request.filters
                ):
                    yield chunk
            except Exception as e:
                logger.error(f"Error in streaming chat: {e}")
                yield f"Error: {str(e)}"

        return StreamingResponse(generate(), media_type="text/plain")
    except Exception as e:
        logger.error(f"Error setting up streaming chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/suggestions")
async def generate_suggestions(request: SuggestionRequest):
    """Generate contextual suggestions for user."""
    try:
        suggestions = await chat_service.generate_suggestions(
            user_id=request.user_id,
            suggestion_type=request.suggestion_type
        )
        return {
            "user_id": request.user_id,
            "suggestion_type": request.suggestion_type,
            "suggestions": suggestions
        }
    except Exception as e:
        logger.error(f"Error generating suggestions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Check chat service health."""
    return {
        "status": "healthy",
        "service": "chat"
    }
