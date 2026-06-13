-- ── PRIME: pg_cron schedule for streak reminders ────────────────────────────
-- Calls the send-streak-reminders Edge Function every day at 20:00 UTC (8pm).
-- Requires the pg_cron and pg_net extensions (both enabled by default on
-- Supabase Pro; enable them in Dashboard → Database → Extensions if needed).
--
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run

-- Enable extensions if not already on
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove existing jobs if re-running this migration
SELECT cron.unschedule(jobname) FROM cron.job WHERE jobname LIKE 'prime-streak-reminders%';

-- Schedule: 07:00, 17:00, 20:00 UTC every day
DO $$
DECLARE
  _sql TEXT := $q$
    SELECT net.http_post(
      url     := 'https://kswftzonddsthleqwghb.supabase.co/functions/v1/send-streak-reminders',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body    := '{}'::jsonb
    ) AS request_id;
  $q$;
BEGIN
  PERFORM cron.schedule('prime-streak-reminders-7am', '0  7 * * *', _sql);
  PERFORM cron.schedule('prime-streak-reminders-5pm', '0 17 * * *', _sql);
  PERFORM cron.schedule('prime-streak-reminders-8pm', '0 20 * * *', _sql);
END;
$$;
