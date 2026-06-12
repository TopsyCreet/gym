-- ─────────────────────────────────────────────────────────────────────────────
-- PRIME — Gym Features Migration
-- Run this once in: Supabase Dashboard → SQL Editor → New Query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. profiles: allow gym-scoped reads (needed for live leaderboard) ─────────
-- Users can already read their own profile.
-- This lets members read other profiles that share the same gym_id.
DROP POLICY IF EXISTS "Members can view gymmates" ON profiles;
CREATE POLICY "Members can view gymmates" ON profiles
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND gym_id = (
      SELECT gym_id FROM profiles WHERE id = auth.uid() LIMIT 1
    )
  );

-- ── 2. gym_feed — community activity stream ───────────────────────────────────
CREATE TABLE IF NOT EXISTS gym_feed (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id        TEXT        NOT NULL,
  user_id       UUID        REFERENCES profiles(id) ON DELETE CASCADE,
  user_name     TEXT        NOT NULL DEFAULT '',
  user_initials TEXT        NOT NULL DEFAULT '',
  event_type    TEXT        NOT NULL DEFAULT 'check_in',
  event_text    TEXT        NOT NULL DEFAULT '',
  kudos_count   INT         NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE gym_feed ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gym members read feed" ON gym_feed;
CREATE POLICY "Gym members read feed" ON gym_feed
  FOR SELECT USING (
    gym_id = (
      SELECT gym_id FROM profiles WHERE id = auth.uid() LIMIT 1
    )
  );

DROP POLICY IF EXISTS "Users insert own feed events" ON gym_feed;
CREATE POLICY "Users insert own feed events" ON gym_feed
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS gym_feed_gym_created_idx
  ON gym_feed (gym_id, created_at DESC);

-- Enable Supabase Realtime so GymFeedCard gets instant updates
ALTER PUBLICATION supabase_realtime ADD TABLE gym_feed;

-- ── 3. gym_transfer_requests ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gym_transfer_requests (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  from_gym_id TEXT NOT NULL,
  to_gym_id   TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE gym_transfer_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own requests" ON gym_transfer_requests;
CREATE POLICY "Users view own requests" ON gym_transfer_requests
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own requests" ON gym_transfer_requests;
CREATE POLICY "Users insert own requests" ON gym_transfer_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS gym_transfer_user_idx
  ON gym_transfer_requests (user_id, created_at DESC);
