import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const generateNonce = () => crypto.randomUUID();

serve(async (req) => {
  try {
    const auth = req.headers.get('authorization') || '';
    if (!auth.startsWith('Bearer ')) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
    const token = auth.replace('Bearer ', '');

    const body = await req.json();
    const { lat, lng, gymId } = body;
    if (typeof lat !== 'number' || typeof lng !== 'number' || !gymId) {
      return new Response(JSON.stringify({ error: 'lat,lng,gymId required' }), { status: 400 });
    }

    // Use supabase auth to get user metadata from JWT
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) return new Response(JSON.stringify({ error: 'invalid token' }), { status: 401 });
    const userId = userData.user.id;

    const nonce = generateNonce();
    const { error } = await supabase.from('checkins').insert([{ user_id: userId, gym_id: gymId, start_at: new Date().toISOString(), start_lat: lat, start_lng: lng, nonce }]);
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

    return new Response(JSON.stringify({ nonce }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
