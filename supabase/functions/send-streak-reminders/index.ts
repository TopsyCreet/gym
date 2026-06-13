/**
 * PRIME — send-streak-reminders Edge Function
 *
 * Runs on a cron schedule (see migration 007_cron_streak_reminders.sql).
 * For each user who:
 *   - Has today as a scheduled training day
 *   - Has NOT checked in today
 *   - Has at least one push subscription
 * …it sends a Web Push streak-reminder notification.
 *
 * Required Supabase secrets (Dashboard → Edge Functions → Secrets):
 *   VAPID_PUBLIC_KEY   = BE8Bg12GgS5qj7VccL3KUUZwT-XqiOqQzVKTN1YQgNMn0CcCDl2AW_t8rapZnT-IzgHeoY__VP595EenEduFqg0
 *   VAPID_PRIVATE_KEY  = oTZoOxmCBRUApZhHdUeYO06HJObYI8txF_G87uKKFMA
 *   VAPID_EMAIL        = mailto:abdulrash1144@gmail.com
 *   SUPABASE_URL       = (auto-set by Supabase)
 *   SUPABASE_SERVICE_ROLE_KEY = (auto-set by Supabase)
 */

import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

webpush.setVapidDetails(
  Deno.env.get('VAPID_EMAIL')!,
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
);

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

Deno.serve(async () => {
  const today      = new Date().toISOString().slice(0, 10);
  const todayDay   = DAYS[new Date().getDay()];

  // 1. Find users who train today and haven't checked in
  const { data: profiles, error: profErr } = await supabase
    .from('profiles')
    .select('id, schedule, last_checkin_date')
    .contains('schedule', [todayDay]);

  if (profErr) {
    console.error('[reminders] profiles query failed:', profErr.message);
    return new Response(JSON.stringify({ error: profErr.message }), { status: 500 });
  }

  const missed = (profiles ?? []).filter(
    (p) => p.last_checkin_date !== today
  );

  if (!missed.length) {
    return new Response(JSON.stringify({ sent: 0, reason: 'everyone checked in or no one trains today' }));
  }

  const missedIds = missed.map((p) => p.id);

  // 2. Fetch their push subscriptions
  const { data: subs, error: subErr } = await supabase
    .from('push_subscriptions')
    .select('user_id, endpoint, p256dh, auth')
    .in('user_id', missedIds);

  if (subErr) {
    console.error('[reminders] subscriptions query failed:', subErr.message);
    return new Response(JSON.stringify({ error: subErr.message }), { status: 500 });
  }

  // 3. Send a push to each subscription
  const payload = JSON.stringify({
    title: 'PRIME — Check in today.',
    body:  "Your streak is on the line. Don't break the chain.",
    url:   '/dashboard',
  });

  let sent = 0;
  const stale: string[] = []; // endpoints that returned 410 Gone

  await Promise.allSettled(
    (subs ?? []).map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
          { TTL: 3600 }
        );
        sent++;
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          stale.push(sub.endpoint);
        } else {
          console.warn('[reminders] push failed:', err.message);
        }
      }
    })
  );

  // 4. Clean up expired subscriptions (410 Gone)
  if (stale.length) {
    await supabase.from('push_subscriptions').delete().in('endpoint', stale);
  }

  console.log(`[reminders] sent=${sent} stale_removed=${stale.length}`);
  return new Response(JSON.stringify({ sent, stale_removed: stale.length, candidates: missed.length }));
});
