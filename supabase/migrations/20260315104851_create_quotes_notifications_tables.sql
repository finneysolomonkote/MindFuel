/*
  # Create Quotes and Notifications Tables

  ## Summary
  Creates tables for quotes, daily quotes, notifications, and user devices.

  ## Tables Created
  1. `quotes` - Inspirational quotes
  2. `daily_quotes` - Daily quote assignments
  3. `notifications` - User notifications
  4. `user_devices` - User device tokens for push notifications

  ## Security
  - Enable RLS on all tables
  - Users can read active quotes
  - Admins can manage quotes
  - Users can access their own notifications and devices
*/

CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  text text NOT NULL,
  author text NOT NULL,
  category text,
  tags text[] DEFAULT ARRAY[]::text[],
  status text DEFAULT 'active' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS daily_quotes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id uuid REFERENCES quotes(id) NOT NULL,
  date date NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  type text NOT NULL,
  data jsonb,
  is_read boolean DEFAULT false NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS user_devices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  device_token text NOT NULL,
  device_type text NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, device_token)
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read active quotes"
  ON quotes FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Admins can manage quotes"
  ON quotes FOR ALL
  TO authenticated
  USING (auth.jwt()->>'role' IN ('admin', 'super_admin'))
  WITH CHECK (auth.jwt()->>'role' IN ('admin', 'super_admin'));

CREATE POLICY "Users can read daily quotes"
  ON daily_quotes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own devices"
  ON user_devices FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own devices"
  ON user_devices FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own devices"
  ON user_devices FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_daily_quotes_date ON daily_quotes(date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON user_devices(user_id);
