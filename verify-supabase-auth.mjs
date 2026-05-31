import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf8')
  .split(/\r?\n/)
  .filter((line) => line.trim() && !line.trim().startsWith('#'))
  .reduce((acc, line) => {
    const [key, ...rest] = line.split('=');
    acc[key.trim()] = rest.join('=').trim();
    return acc;
  }, {});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase.auth.signInWithPassword({ email: 'copilot-test-2@irongate.app', password: 'Test1234!' });
  console.log('signIn error:', error);
  console.log('signIn data:', JSON.stringify(data, null, 2));
}

main().catch((err) => {
  console.error('unexpected', err);
  process.exit(1);
});