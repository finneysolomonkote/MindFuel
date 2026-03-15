/*
  # Create Users Table

  ## Summary
  Creates the users table for managing user accounts in the MindFuel AI platform.

  ## Tables Created
  1. `users`
    - `id` (uuid, primary key) - Unique user identifier
    - `email` (text, unique, not null) - User email address
    - `password_hash` (text, not null) - Hashed password
    - `full_name` (text, not null) - User full name
    - `phone_number` (text) - Optional phone number
    - `role` (text, not null) - User role (user, admin, super_admin)
    - `status` (text, not null) - Account status (active, inactive, pending, deleted)
    - `profile_image_url` (text) - Profile image URL
    - `last_login_at` (timestamptz) - Last login timestamp
    - `created_at` (timestamptz, not null) - Account creation timestamp
    - `updated_at` (timestamptz, not null) - Last update timestamp

  ## Security
  - Enable RLS on `users` table
  - Users can read their own profile data
  - Users can update their own profile data
  - Only admins can read all users
*/

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  phone_number text,
  role text NOT NULL DEFAULT 'user',
  status text NOT NULL DEFAULT 'active',
  profile_image_url text,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
