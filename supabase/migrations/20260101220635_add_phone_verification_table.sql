/*
  # Add phone verification and notification tracking

  1. New Tables
    - `phone_verifications` - Track OTP codes for phone verification
    - `notification_logs` - Track all SMS and email notifications sent

  2. Security
    - Enable RLS on all tables
    - Policies allow users to verify their own phone
    - Admin can view notification logs
*/

CREATE TABLE IF NOT EXISTS phone_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text NOT NULL,
  otp_code text NOT NULL,
  verified boolean DEFAULT false,
  attempts integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '15 minutes'),
  UNIQUE(user_id, phone)
);

CREATE TABLE IF NOT EXISTS notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('sms', 'email')),
  phone_or_email text NOT NULL,
  subject text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message text,
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz
);

ALTER TABLE phone_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can verify own phone"
  ON phone_verifications FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own notification logs"
  ON notification_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_phone_verifications_user_id ON phone_verifications(user_id);
CREATE INDEX idx_phone_verifications_expires_at ON phone_verifications(expires_at);
CREATE INDEX idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX idx_notification_logs_created_at ON notification_logs(created_at);
