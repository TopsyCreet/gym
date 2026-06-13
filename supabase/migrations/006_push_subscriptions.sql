-- ── PRIME: push_subscriptions ────────────────────────────────────────────────
-- Stores Web Push subscription endpoints so the backend can send streak
-- reminders. Each user can have multiple subscriptions (one per device).
--
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  endpoint     TEXT        NOT NULL,
  p256dh       TEXT        NOT NULL,
  auth         TEXT        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, endpoint)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own subscriptions" ON push_subscriptions;
CREATE POLICY "Users manage own subscriptions" ON push_subscriptions
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS push_subs_user_idx ON push_subscriptions (user_id);
