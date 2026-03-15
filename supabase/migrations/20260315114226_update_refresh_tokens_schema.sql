/*
  # Update Refresh Tokens Schema

  ## Summary
  Updates refresh_tokens table to use plain token storage for JWT tokens

  ## Changes
  - Add token column if it doesn't exist
  - Add index on token column
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'refresh_tokens' AND column_name = 'token'
  ) THEN
    ALTER TABLE refresh_tokens ADD COLUMN token text UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
  END IF;
END $$;
