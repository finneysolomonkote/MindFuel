/*
  # Enable Required Extensions

  ## Summary
  Enables PostgreSQL extensions required for MindFuel AI platform.

  ## Extensions
  1. `uuid-ossp` - UUID generation
  2. `vector` - pgvector for semantic search and embeddings
  3. `pg_trgm` - Trigram similarity for text search

  ## Notes
  - uuid-ossp provides uuid_generate_v4() function
  - vector enables vector data type and similarity operations
  - pg_trgm enables fuzzy text matching and GIN indexes
*/

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
