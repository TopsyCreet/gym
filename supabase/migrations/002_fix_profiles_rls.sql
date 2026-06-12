-- Fix: "Members can view gymmates" policy caused infinite recursion because it
-- queried profiles from within a profiles RLS USING clause. PostgreSQL detects
-- this and raises "infinite recursion detected in policy for relation profiles".
--
-- Solution: wrap the self-referential lookup in a SECURITY DEFINER function so
-- it runs with elevated privileges and bypasses RLS on that inner SELECT.

CREATE OR REPLACE FUNCTION public.get_my_gym_id()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT gym_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Replace the recursive policy with the safe version
DROP POLICY IF EXISTS "Members can view gymmates" ON profiles;

CREATE POLICY "Members can view gymmates" ON profiles
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND gym_id = get_my_gym_id()
  );
