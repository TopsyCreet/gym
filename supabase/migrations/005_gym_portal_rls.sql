-- ── PRIME: Gym portal RLS additions ─────────────────────────────────────────
-- Allows gym admins (members of the target gym) to view incoming transfer
-- requests and approve/reject them via a SECURITY DEFINER function.
--
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run

-- 1. Policy: members can see pending transfer requests addressed TO their gym
DROP POLICY IF EXISTS "Gym members view incoming requests" ON gym_transfer_requests;
CREATE POLICY "Gym members view incoming requests" ON gym_transfer_requests
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND to_gym_id = get_my_gym_id()
  );

-- 2. Approve transfer: validates requester is in the target gym, then moves the user
CREATE OR REPLACE FUNCTION public.approve_gym_transfer(p_request_id UUID)
RETURNS void
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id   UUID;
  v_to_gym_id TEXT;
BEGIN
  SELECT user_id, to_gym_id INTO v_user_id, v_to_gym_id
  FROM gym_transfer_requests
  WHERE id = p_request_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transfer request not found or already processed';
  END IF;

  IF v_to_gym_id != get_my_gym_id() THEN
    RAISE EXCEPTION 'Unauthorized: you can only approve requests for your own gym';
  END IF;

  UPDATE gym_transfer_requests SET status = 'approved' WHERE id = p_request_id;
  UPDATE profiles SET gym_id = v_to_gym_id WHERE id = v_user_id;
END;
$$;

-- 3. Reject transfer
CREATE OR REPLACE FUNCTION public.reject_gym_transfer(p_request_id UUID)
RETURNS void
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_to_gym_id TEXT;
BEGIN
  SELECT to_gym_id INTO v_to_gym_id
  FROM gym_transfer_requests
  WHERE id = p_request_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transfer request not found or already processed';
  END IF;

  IF v_to_gym_id != get_my_gym_id() THEN
    RAISE EXCEPTION 'Unauthorized: you can only reject requests for your own gym';
  END IF;

  UPDATE gym_transfer_requests SET status = 'rejected' WHERE id = p_request_id;
END;
$$;
