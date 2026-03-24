"""Embedding generation service using OpenAI."""
from openai import OpenAI
from app.config import settings
import tiktoken
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Service for generating and managing embeddings."""

    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_embedding_model
        self.encoding = tiktoken.encoding_for_model("gpt-3.5-turbo")
        logger.info(f"Embedding service initialized with model: {self.model}")

    def count_tokens(self, text: str) -> int:
        """Count the number of tokens in a text string."""
        return len(self.encoding.encode(text))

    def chunk_text(
        self,
        text: str,
        chunk_size: int = None,
        chunk_overlap: int = None
    ) -> List[Dict]:
        """
        Split text into chunks with overlap for better context preservation.

        Args:
            text: The text to chunk
            chunk_size: Maximum tokens per chunk
            chunk_overlap: Number of overlapping tokens between chunks

        Returns:
            List of chunk dictionaries with text, index, and token count
        """
        chunk_size = chunk_size or settings.chunk_size
        chunk_overlap = chunk_overlap or settings.chunk_overlap

        tokens = self.encoding.encode(text)
        chunks = []
        start = 0
        index = 0

        while start < len(tokens):
            end = start + chunk_size
            chunk_tokens = tokens[start:end]
            chunk_text = self.encoding.decode(chunk_tokens)

            chunks.append({
                "text": chunk_text,
                "index": index,
                "token_count": len(chunk_tokens),
                "start_char": len(self.encoding.decode(tokens[:start])),
                "end_char": len(self.encoding.decode(tokens[:end]))
            })

            start += chunk_size - chunk_overlap
            index += 1

        logger.info(f"Created {len(chunks)} chunks from text of {len(tokens)} tokens")
        return chunks

    async def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for a single text string."""
        try:
            response = self.client.embeddings.create(
                input=text,
                model=self.model
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise

    async def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts in batch."""
        try:
            response = self.client.embeddings.create(
                input=texts,
                model=self.model
            )
            return [item.embedding for item in response.data]
        except Exception as e:
            logger.error(f"Error generating batch embeddings: {e}")
            raise

    async def process_content(
        self,
        content: str,
        metadata: Dict = None,
        chunk_size: int = None,
        chunk_overlap: int = None
    ) -> List[Dict]:
        """
        Process content: chunk it and generate embeddings.

        Args:
            content: The content to process
            metadata: Additional metadata to attach to chunks
            chunk_size: Maximum tokens per chunk
            chunk_overlap: Number of overlapping tokens

        Returns:
            List of chunks with embeddings
        """
        try:
            # Chunk the content
            chunks = self.chunk_text(content, chunk_size, chunk_overlap)

            # Extract text from chunks for batch embedding
            texts = [chunk["text"] for chunk in chunks]

            # Generate embeddings in batch
            embeddings = await self.generate_embeddings_batch(texts)

            # Combine chunks with embeddings
            for i, chunk in enumerate(chunks):
                chunk["embedding"] = embeddings[i]
                chunk["metadata"] = metadata or {}

            logger.info(f"Processed {len(chunks)} chunks with embeddings")
            return chunks

        except Exception as e:
            logger.error(f"Error processing content: {e}")
            raise

    async def process_book_content(self, book_data: Dict) -> List[Dict]:
        """
        Process entire book content including all chapters and sections.

        Args:
            book_data: Dictionary containing book and chapters data

        Returns:
            List of all chunks with embeddings
        """
        all_chunks = []
        book = book_data["book"]
        chapters = book_data["chapters"]

        logger.info(f"Processing book: {book['title']} with {len(chapters)} chapters")

        for chapter in chapters:
            chapter_metadata = {
                "book_id": book["id"],
                "book_title": book["title"],
                "chapter_id": chapter["id"],
                "chapter_number": chapter["chapter_number"],
                "chapter_title": chapter["title"]
            }

            # Process chapter content if available
            if chapter.get("content"):
                chunks = await self.process_content(
                    chapter["content"],
                    metadata=chapter_metadata
                )
                for chunk in chunks:
                    chunk["chapter_id"] = chapter["id"]
                all_chunks.extend(chunks)

            # Process sections
            for section in chapter.get("book_sections", []):
                section_metadata = {
                    **chapter_metadata,
                    "section_id": section["id"],
                    "section_number": section["section_number"],
                    "section_title": section["title"]
                }

                chunks = await self.process_content(
                    section["content"],
                    metadata=section_metadata
                )
                for chunk in chunks:
                    chunk["chapter_id"] = chapter["id"]
                    chunk["section_id"] = section["id"]
                all_chunks.extend(chunks)

        logger.info(f"Processed book with total {len(all_chunks)} chunks")
        return all_chunks


embedding_service = EmbeddingService()
