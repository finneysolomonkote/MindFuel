"""Database connection and operations."""
from supabase import create_client, Client
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class SupabaseClient:
    """Wrapper for Supabase client operations."""

    def __init__(self):
        self.client: Client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key
        )
        logger.info("Supabase client initialized")

    async def get_book_content(self, book_id: str):
        """Retrieve book content with chapters and sections."""
        try:
            # Get book details
            book_response = self.client.table("books").select("*").eq("id", book_id).single().execute()

            if not book_response.data:
                return None

            # Get chapters with sections
            chapters_response = (
                self.client.table("book_chapters")
                .select("*, book_sections(*)")
                .eq("book_id", book_id)
                .order("chapter_number")
                .execute()
            )

            return {
                "book": book_response.data,
                "chapters": chapters_response.data
            }
        except Exception as e:
            logger.error(f"Error retrieving book content: {e}")
            raise

    async def store_embeddings(self, book_id: str, chunks: list):
        """Store content chunks with embeddings."""
        try:
            data_to_insert = []
            for chunk in chunks:
                data_to_insert.append({
                    "book_id": book_id,
                    "chapter_id": chunk.get("chapter_id"),
                    "section_id": chunk.get("section_id"),
                    "chunk_text": chunk["text"],
                    "chunk_index": chunk["index"],
                    "token_count": chunk["token_count"],
                    "embedding": chunk["embedding"],
                    "metadata": chunk.get("metadata", {})
                })

            response = self.client.table("content_chunks").insert(data_to_insert).execute()
            logger.info(f"Stored {len(data_to_insert)} embeddings for book {book_id}")
            return response.data
        except Exception as e:
            logger.error(f"Error storing embeddings: {e}")
            raise

    async def search_similar_content(self, query_embedding: list, top_k: int = 5):
        """Search for similar content using vector similarity."""
        try:
            response = self.client.rpc(
                "match_content_chunks",
                {
                    "query_embedding": query_embedding,
                    "match_threshold": 0.7,
                    "match_count": top_k
                }
            ).execute()

            return response.data
        except Exception as e:
            logger.error(f"Error searching similar content: {e}")
            raise

    async def get_user_context(self, user_id: str):
        """Retrieve user context for personalization."""
        try:
            # Get user progress
            progress = (
                self.client.table("user_reading_progress")
                .select("*")
                .eq("user_id", user_id)
                .execute()
            )

            # Get user goals
            goals = (
                self.client.table("user_goals")
                .select("*")
                .eq("user_id", user_id)
                .eq("status", "in_progress")
                .execute()
            )

            # Get user journal entries (recent)
            journals = (
                self.client.table("journal_entries")
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .limit(5)
                .execute()
            )

            return {
                "progress": progress.data,
                "goals": goals.data,
                "journals": journals.data
            }
        except Exception as e:
            logger.error(f"Error retrieving user context: {e}")
            raise

    async def store_conversation(self, user_id: str, conversation_data: dict):
        """Store AI conversation history."""
        try:
            response = self.client.table("ai_conversations").insert({
                "user_id": user_id,
                "messages": conversation_data["messages"],
                "context": conversation_data.get("context", {}),
                "metadata": conversation_data.get("metadata", {})
            }).execute()

            return response.data
        except Exception as e:
            logger.error(f"Error storing conversation: {e}")
            raise

    async def get_conversation_history(self, user_id: str, conversation_id: str = None):
        """Retrieve conversation history."""
        try:
            query = self.client.table("ai_conversations").select("*").eq("user_id", user_id)

            if conversation_id:
                query = query.eq("id", conversation_id)
            else:
                query = query.order("created_at", desc=True).limit(10)

            response = query.execute()
            return response.data
        except Exception as e:
            logger.error(f"Error retrieving conversation history: {e}")
            raise


supabase_client = SupabaseClient()
