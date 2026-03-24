/*
  # Enable PostgreSQL Extensions

  1. Extensions
    - `uuid-ossp` - UUID generation
    - `pgcrypto` - Cryptographic functions
    - `vector` - pgvector for AI embeddings (1536 dimensions for OpenAI)

  2. Notes
    - These are required before creating any tables
    - pgvector extension enables semantic search capabilities
*/

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable vector extension for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;
