import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const haversine = (lat1:number, lon1:number, lat2:number, lon2:number) => {
  const toRad = (v:number) => (v * Math.PI) / 180;
  const R = 6371e3; // metres
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const MIN_MINUTES = 5; // configurable minimum duration
const MAX_DISTANCE_METERS = 150; // allowed movement

serve(async (req) => {
  try {
    const auth = req.headers.get('authorization') || '';
    if (!auth.startsWith('Bearer ')) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
    const token = auth.replace('Bearer ', '');

    const body = await req.json();
    const { checkinId, lat, lng, nonce } = body;
    if (!checkinId || typeof lat !== 'number' || typeof lng !== 'number' || !nonce) {
      return new Response(JSON.stringify({ error: 'checkinId, lat, lng, nonce required' }), { status: 400 });
    }

    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) return new Response(JSON.stringify({ error: 'invalid token' }), { status: 401 });
    const userId = userData.user.id;

    const { data: checkins, error: fetchErr } = await supabase.from('checkins').select('*').eq('id', checkinId).single();
    if (fetchErr || !checkins) return new Response(JSON.stringify({ error: 'checkin not found' }), { status: 404 });

    if (checkins.user_id !== userId) return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403 });
    if (checkins.nonce !== nonce) return new Response(JSON.stringify({ error: 'invalid nonce' }), { status: 400 });
    if (checkins.verified) return new Response(JSON.stringify({ error: 'already verified' }), { status: 400 });

    const startAt = new Date(checkins.start_at);
    const now = new Date();
    const minutes = (now.getTime() - startAt.getTime()) / 1000 / 60;
    if (minutes < MIN_MINUTES) {
      return new Response(JSON.stringify({ error: 'minimum duration not met', minutes }), { status: 400 });
    }

    const distance = haversine(checkins.start_lat, checkins.start_lng, lat, lng);
    if (distance > MAX_DISTANCE_METERS) {
      return new Response(JSON.stringify({ error: 'too far from start point', distance }), { status: 400 });
    }

    const { error: updateErr } = await supabase.from('checkins').update({ complete_at: now.toISOString(), complete_lat: lat, complete_lng: lng, verified: true }).eq('id', checkinId);
    if (updateErr) return new Response(JSON.stringify({ error: updateErr.message }), { status: 500 });

    // Optionally update profile counters (xp, check_ins, streak). Keep simple here.
    return new Response(JSON.stringify({ verified: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
