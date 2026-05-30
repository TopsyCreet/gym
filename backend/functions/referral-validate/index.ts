import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    const body = await req.json();
    const code = (body.code || '').toString().trim().toUpperCase();
    if (!code) return new Response(JSON.stringify({ error: 'code required' }), { status: 400 });

    const { data, error } = await supabase.from('gyms').select('id,name,location,description').eq('referral_code', code).single();
    if (error) return new Response(JSON.stringify({ error: 'not found' }), { status: 404 });

    return new Response(JSON.stringify({ gymId: data.id, name: data.name, location: data.location, description: data.description }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
