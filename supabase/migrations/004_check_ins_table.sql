-- ── PRIME: check_ins audit table ────────────────────────────────────────────
-- One row per gym session. Gives a proper audit trail separate from the
-- profiles.attendance_history JSON blob, and enables cross-device integrity:
-- if a profile upsert races or fails, the individual row still exists.
--
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run

CREATE TABLE IF NOT EXISTS check_ins (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  gym_id     TEXT        NOT NULL DEFAULT '',
  checked_in DATE        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, checked_in)
);

ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users insert own check-ins" ON check_ins;
CREATE POLICY "Users insert own check-ins" ON check_ins
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users read own check-ins" ON check_ins;
CREATE POLICY "Users read own check-ins" ON check_ins
  FOR SELECT USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS check_ins_user_date_idx
  ON check_ins (user_id, checked_in DESC);
