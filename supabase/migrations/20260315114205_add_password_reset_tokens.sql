/*
  # Add Password Reset Tokens Table

  ## Summary
  Creates table for managing password reset tokens with expiration and usage tracking.

  ## Tables Created
  1. `password_reset_tokens` - Stores password reset tokens with expiration

  ## Security
  - RLS enabled
  - Only system can create/read tokens
  - Tokens expire after use or timeout
*/

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  token text UNIQUE NOT NULL,
  is_used boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage password reset tokens"
  ON password_reset_tokens FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
