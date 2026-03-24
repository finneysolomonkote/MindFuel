"""Main FastAPI application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import embedding_routes, rag_routes, chat_routes
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="MindFuel AI Service",
    description="Python-based AI/ML service for embeddings, RAG, and chat",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(embedding_routes.router)
app.include_router(rag_routes.router)
app.include_router(chat_routes.router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "MindFuel AI Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "embeddings": "/embeddings",
            "rag": "/rag",
            "chat": "/chat",
            "docs": "/docs"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "mindfuel-ai",
        "environment": settings.environment
    }


@app.on_event("startup")
async def startup_event():
    """Run on application startup."""
    logger.info("=" * 50)
    logger.info("MindFuel AI Service Starting")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"OpenAI Model: {settings.openai_model}")
    logger.info(f"Embedding Model: {settings.openai_embedding_model}")
    logger.info("=" * 50)


@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown."""
    logger.info("MindFuel AI Service Shutting Down")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.environment == "development"
    )
