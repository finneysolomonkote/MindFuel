"""RAG (Retrieval Augmented Generation) service."""
from app.services.embedding_service import embedding_service
from app.database import supabase_client
from app.config import settings
import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)


class RAGService:
    """Service for retrieval-augmented generation."""

    def __init__(self):
        self.embedding_service = embedding_service
        self.db = supabase_client
        logger.info("RAG service initialized")

    async def retrieve_relevant_content(
        self,
        query: str,
        top_k: int = None,
        filters: Dict = None
    ) -> List[Dict]:
        """
        Retrieve relevant content chunks based on query.

        Args:
            query: The search query
            top_k: Number of results to return
            filters: Additional filters (book_id, chapter_id, etc.)

        Returns:
            List of relevant content chunks with metadata
        """
        try:
            top_k = top_k or settings.top_k_results

            # Generate embedding for query
            query_embedding = await self.embedding_service.generate_embedding(query)

            # Search for similar content
            results = await self.db.search_similar_content(query_embedding, top_k)

            # Apply additional filters if provided
            if filters:
                results = [
                    r for r in results
                    if all(r.get(k) == v for k, v in filters.items())
                ]

            logger.info(f"Retrieved {len(results)} relevant chunks for query")
            return results

        except Exception as e:
            logger.error(f"Error retrieving relevant content: {e}")
            raise

    async def build_context(
        self,
        query: str,
        user_id: Optional[str] = None,
        top_k: int = None,
        filters: Dict = None
    ) -> Dict:
        """
        Build comprehensive context for LLM generation.

        Args:
            query: The user query
            user_id: Optional user ID for personalization
            top_k: Number of content chunks to retrieve
            filters: Additional filters

        Returns:
            Dictionary containing context information
        """
        try:
            # Retrieve relevant content
            relevant_chunks = await self.retrieve_relevant_content(query, top_k, filters)

            context = {
                "query": query,
                "relevant_content": relevant_chunks,
                "sources": []
            }

            # Add source information
            seen_sources = set()
            for chunk in relevant_chunks:
                source_key = (
                    chunk.get("metadata", {}).get("book_title"),
                    chunk.get("metadata", {}).get("chapter_title")
                )
                if source_key not in seen_sources:
                    context["sources"].append({
                        "book_title": chunk.get("metadata", {}).get("book_title"),
                        "chapter_title": chunk.get("metadata", {}).get("chapter_title"),
                        "chapter_number": chunk.get("metadata", {}).get("chapter_number")
                    })
                    seen_sources.add(source_key)

            # Add user context if user_id provided
            if user_id:
                user_context = await self.db.get_user_context(user_id)
                context["user_context"] = user_context

            logger.info(f"Built context with {len(relevant_chunks)} chunks from {len(context['sources'])} sources")
            return context

        except Exception as e:
            logger.error(f"Error building context: {e}")
            raise

    def format_context_for_llm(self, context: Dict) -> str:
        """
        Format context into a string suitable for LLM prompting.

        Args:
            context: The context dictionary

        Returns:
            Formatted context string
        """
        formatted_parts = []

        # Add relevant content
        if context.get("relevant_content"):
            formatted_parts.append("# Relevant Content from MindFuel Library:\n")
            for i, chunk in enumerate(context["relevant_content"], 1):
                metadata = chunk.get("metadata", {})
                source = f"{metadata.get('book_title', 'Unknown')} - {metadata.get('chapter_title', 'Unknown')}"
                formatted_parts.append(f"\n## Source {i}: {source}\n")
                formatted_parts.append(chunk.get("chunk_text", ""))
                formatted_parts.append("\n")

        # Add user context if available
        if context.get("user_context"):
            user_ctx = context["user_context"]

            if user_ctx.get("goals"):
                formatted_parts.append("\n# User's Current Goals:\n")
                for goal in user_ctx["goals"]:
                    formatted_parts.append(f"- {goal.get('title')}: {goal.get('description')}\n")

            if user_ctx.get("journals"):
                formatted_parts.append("\n# Recent Journal Reflections:\n")
                for journal in user_ctx["journals"][:3]:
                    formatted_parts.append(f"- {journal.get('content', '')[:200]}...\n")

        return "\n".join(formatted_parts)

    async def ingest_book(self, book_id: str) -> Dict:
        """
        Ingest a complete book into the RAG system.

        Args:
            book_id: The ID of the book to ingest

        Returns:
            Dictionary with ingestion results
        """
        try:
            logger.info(f"Starting ingestion for book: {book_id}")

            # Get book content
            book_data = await self.db.get_book_content(book_id)

            if not book_data:
                raise ValueError(f"Book not found: {book_id}")

            # Process and generate embeddings
            chunks = await self.embedding_service.process_book_content(book_data)

            # Store embeddings in database
            await self.db.store_embeddings(book_id, chunks)

            result = {
                "book_id": book_id,
                "book_title": book_data["book"]["title"],
                "total_chunks": len(chunks),
                "total_tokens": sum(c["token_count"] for c in chunks),
                "status": "success"
            }

            logger.info(f"Successfully ingested book: {result}")
            return result

        except Exception as e:
            logger.error(f"Error ingesting book: {e}")
            raise


rag_service = RAGService()
