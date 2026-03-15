/*
  # Create Notification and Media Domains

  ## Summary
  Comprehensive notification system and media asset management.

  ## Tables Created
  1. `push_tokens` - FCM device tokens
  2. `notifications_new` - User notifications
  3. `notification_templates` - Notification templates
  4. `notification_logs` - Delivery logs
  5. `notification_campaigns` - Marketing campaigns
  6. `campaign_recipients` - Campaign recipient tracking
  7. `media_assets` - Media file metadata
  8. `upload_jobs` - Background upload tracking

  ## Security
  - All tables have RLS enabled
  - Users can only access their own notifications and tokens
*/

-- Push tokens
CREATE TABLE IF NOT EXISTS push_tokens (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  token text UNIQUE NOT NULL,
  device_id text,
  device_type text CHECK (device_type IN ('ios', 'android', 'web')),
  is_active boolean DEFAULT true,
  last_used_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'reminder', 'achievement')),
  title text NOT NULL,
  message text NOT NULL,
  action_type text,
  action_data jsonb,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read boolean DEFAULT false,
  is_sent boolean DEFAULT false,
  sent_at timestamptz,
  read_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Notification templates
CREATE TABLE IF NOT EXISTS notification_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  type text NOT NULL,
  title_template text NOT NULL,
  message_template text NOT NULL,
  action_type text,
  variables jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES users(id)
);

-- Notification logs
CREATE TABLE IF NOT EXISTS notification_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_id uuid REFERENCES notifications_new(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  delivery_method text NOT NULL CHECK (delivery_method IN ('push', 'email', 'sms', 'in_app')),
  status text NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
  provider text,
  provider_message_id text,
  failure_reason text,
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Notification campaigns
CREATE TABLE IF NOT EXISTS notification_campaigns (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  template_id uuid REFERENCES notification_templates(id),
  target_audience jsonb NOT NULL,
  schedule_type text CHECK (schedule_type IN ('immediate', 'scheduled', 'recurring')),
  scheduled_at timestamptz,
  recurrence_rule text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'completed', 'cancelled')),
  total_recipients int DEFAULT 0,
  total_sent int DEFAULT 0,
  total_delivered int DEFAULT 0,
  total_failed int DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES users(id)
);

-- Campaign recipients
CREATE TABLE IF NOT EXISTS campaign_recipients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id uuid REFERENCES notification_campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  notification_id uuid REFERENCES notifications_new(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  sent_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Media assets
CREATE TABLE IF NOT EXISTS media_assets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size_bytes bigint NOT NULL,
  mime_type text NOT NULL,
  storage_provider text DEFAULT 's3',
  storage_url text NOT NULL,
  storage_key text NOT NULL,
  thumbnail_url text,
  width int,
  height int,
  duration_seconds int,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Upload jobs
CREATE TABLE IF NOT EXISTS upload_jobs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_size_bytes bigint NOT NULL,
  mime_type text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress_percentage int DEFAULT 0,
  media_asset_id uuid REFERENCES media_assets(id) ON DELETE SET NULL,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own tokens"
  ON push_tokens FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own notifications"
  ON notifications_new FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications_new FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own notification logs"
  ON notification_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own media assets"
  ON media_assets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can manage own media assets"
  ON media_assets FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own upload jobs"
  ON upload_jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own upload jobs"
  ON upload_jobs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_active ON push_tokens(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications_new(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications_new(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications_new(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_templates_slug ON notification_templates(slug);
CREATE INDEX IF NOT EXISTS idx_notification_logs_notification ON notification_logs(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_campaigns_status ON notification_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign ON campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_user ON campaign_recipients(user_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_user ON media_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_public ON media_assets(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_upload_jobs_user ON upload_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_upload_jobs_status ON upload_jobs(status);

-- Triggers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_push_tokens_updated_at') THEN
    CREATE TRIGGER update_push_tokens_updated_at
      BEFORE UPDATE ON push_tokens
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_notification_templates_updated_at') THEN
    CREATE TRIGGER update_notification_templates_updated_at
      BEFORE UPDATE ON notification_templates
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_notification_campaigns_updated_at') THEN
    CREATE TRIGGER update_notification_campaigns_updated_at
      BEFORE UPDATE ON notification_campaigns
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_upload_jobs_updated_at') THEN
    CREATE TRIGGER update_upload_jobs_updated_at
      BEFORE UPDATE ON upload_jobs
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
