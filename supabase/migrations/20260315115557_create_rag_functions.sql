/*
  # Create RAG Vector Search Functions

  ## Summary
  Creates PostgreSQL functions for semantic search with vector embeddings

  ## Functions Created
  1. `match_book_chunks` - Search within specific book/chapter/section
  2. `match_user_chunks` - Search across user's accessible books
  
  ## Features
  - Vector similarity search using cosine distance
  - Book/chapter/section filtering
  - Access control integration
  - Relevance scoring
*/

-- Function to match chunks within a specific book context
CREATE OR REPLACE FUNCTION match_book_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  filter_book_id uuid DEFAULT NULL,
  filter_chapter_id uuid DEFAULT NULL,
  filter_section_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  chunk_text text,
  book_id uuid,
  chapter_id uuid,
  section_id uuid,
  page_number int,
  similarity float,
  book_title text,
  chapter_title text,
  section_title text,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cc.id,
    cc.chunk_text,
    cc.book_id,
    cc.chapter_id,
    cc.section_id,
    cc.page_number,
    1 - (cc.embedding <=> query_embedding) AS similarity,
    b.title AS book_title,
    bc.title AS chapter_title,
    bs.title AS section_title,
    cc.metadata
  FROM content_chunks cc
  LEFT JOIN books b ON cc.book_id = b.id
  LEFT JOIN book_chapters bc ON cc.chapter_id = bc.id
  LEFT JOIN book_sections bs ON cc.section_id = bs.id
  WHERE
    (filter_book_id IS NULL OR cc.book_id = filter_book_id)
    AND (filter_chapter_id IS NULL OR cc.chapter_id = filter_chapter_id)
    AND (filter_section_id IS NULL OR cc.section_id = filter_section_id)
    AND 1 - (cc.embedding <=> query_embedding) > match_threshold
  ORDER BY cc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to match chunks across user's accessible books
CREATE OR REPLACE FUNCTION match_user_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  accessible_book_ids uuid[] DEFAULT ARRAY[]::uuid[]
)
RETURNS TABLE (
  id uuid,
  chunk_text text,
  book_id uuid,
  chapter_id uuid,
  section_id uuid,
  page_number int,
  similarity float,
  book_title text,
  chapter_title text,
  section_title text,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cc.id,
    cc.chunk_text,
    cc.book_id,
    cc.chapter_id,
    cc.section_id,
    cc.page_number,
    1 - (cc.embedding <=> query_embedding) AS similarity,
    b.title AS book_title,
    bc.title AS chapter_title,
    bs.title AS section_title,
    cc.metadata
  FROM content_chunks cc
  LEFT JOIN books b ON cc.book_id = b.id
  LEFT JOIN book_chapters bc ON cc.chapter_id = bc.id
  LEFT JOIN book_sections bs ON cc.section_id = bs.id
  WHERE
    cc.book_id = ANY(accessible_book_ids)
    AND 1 - (cc.embedding <=> query_embedding) > match_threshold
  ORDER BY cc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
