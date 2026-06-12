-- 1. Allow any authenticated gym member to increment kudos on feed items
CREATE POLICY "Gym members can update feed kudos" ON gym_feed
  FOR UPDATE USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- 2. Atomic increment — avoids race conditions when multiple people tap at once
CREATE OR REPLACE FUNCTION public.increment_kudos(feed_id UUID)
RETURNS void
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE gym_feed SET kudos_count = kudos_count + 1 WHERE id = feed_id;
$$;

-- 3. Enable realtime on profiles so the leaderboard updates live when someone checks in
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
