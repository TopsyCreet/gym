/**
 * Seed 60 days of realistic check-in history for a given Supabase user.
 *
 * Usage:
 *   npx tsx scripts/seed-demo.ts <USER_ID>
 *
 * Required env vars (read from .env.local automatically):
 *   SUPABASE_URL            — your project URL
 *   SUPABASE_SERVICE_ROLE_KEY — service-role key (bypasses RLS)
 *
 * The service-role key is only required for this script (never ship it to the client).
 * Find it in: Supabase Dashboard → Project Settings → API → service_role secret.
 *
 * Example:
 *   SUPABASE_URL=https://xyz.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... \
 *   npx tsx scripts/seed-demo.ts abc123-user-id
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// ── Load .env.local (best-effort) ─────────────────────────────────────────
function loadEnvFile(path: string) {
  if (!existsSync(path)) return;
  const lines = readFileSync(path, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvFile(resolve(process.cwd(), '.env.local'));
loadEnvFile(resolve(process.cwd(), '.env'));

// ── Args + env ────────────────────────────────────────────────────────────
const userId = process.argv[2];
if (!userId) {
  console.error('Usage: npx tsx scripts/seed-demo.ts <USER_ID>');
  process.exit(1);
}

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    'Missing env vars. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.\n' +
    'See the usage comment at the top of this file.'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Date helpers ──────────────────────────────────────────────────────────
function isoDate(d: Date): string { return d.toISOString().slice(0, 10); }
function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

// ── Generate 60-day history ───────────────────────────────────────────────
// Pattern: 4-5 sessions/week, occasional light weeks, one shield-used gap.
// [Mon, Tue, Wed, Thu, Fri, Sat, Sun]  1 = trained, 0 = rest
function generateHistory(): Record<string, boolean> {
  const weekPatterns: number[][] = [
    [1, 1, 0, 1, 0, 1, 0], // week 0 (current)   — 4 sessions
    [1, 1, 1, 1, 0, 1, 0], // week 1              — 5 sessions (strong)
    [1, 0, 0, 1, 0, 1, 0], // week 2              — 3 sessions (hard week)
    [1, 1, 0, 1, 0, 1, 0], // week 3              — 4 sessions
    [1, 1, 1, 1, 0, 1, 0], // week 4              — 5 sessions (strong)
    [1, 0, 0, 0, 0, 1, 0], // week 5              — 2 sessions (life got busy)
    [1, 1, 0, 1, 0, 1, 0], // week 6              — 4 sessions
    [1, 1, 1, 1, 0, 1, 0], // week 7              — 5 sessions (strong)
    [1, 1, 0, 1, 0, 0, 0], // week 8 (oldest)     — 3 sessions (partial)
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayOfWeek       = today.getDay();
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  const startOfThisWeek = addDays(today, -daysSinceMonday);

  const history: Record<string, boolean> = {};

  for (let w = 0; w < weekPatterns.length; w++) {
    const weekStart = addDays(startOfThisWeek, -w * 7);
    for (let d = 0; d < 7; d++) {
      const day     = addDays(weekStart, d);
      const daysAgo = Math.round((today.getTime() - day.getTime()) / 86_400_000);
      if (day > today || daysAgo > 63) continue;
      if (weekPatterns[w][d] === 1) history[isoDate(day)] = true;
    }
  }

  return history;
}

// ── Streak calculation ────────────────────────────────────────────────────
function calcStreaks(history: Record<string, boolean>): { streak: number; longestStreak: number } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Current streak: walk backwards from today
  let streak = 0;
  let d = new Date(today);
  while (history[isoDate(d)]) { streak++; d = addDays(d, -1); }

  // Longest streak: scan sorted keys
  const dates = Object.keys(history).sort();
  let longest = 0, run = 0;
  let prev: Date | null = null;

  for (const ds of dates) {
    const cur  = new Date(ds);
    const diff = prev ? Math.round((cur.getTime() - prev.getTime()) / 86_400_000) : 0;
    run = (!prev || diff === 1) ? run + 1 : 1;
    if (run > longest) longest = run;
    prev = cur;
  }

  return { streak, longestStreak: Math.max(streak, longest) };
}

// ── Rank from check-in count ──────────────────────────────────────────────
function rankTitle(checkIns: number): string {
  if (checkIns >= 200) return 'Monarch';
  if (checkIns >= 100) return 'Prime';
  if (checkIns >= 50)  return 'Elite';
  if (checkIns >= 25)  return 'Vanguard';
  if (checkIns >= 10)  return 'Forged';
  return 'Initiate';
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🔧  Seeding demo history for user: ${userId}\n`);

  const attendanceHistory = generateHistory();
  const checkIns          = Object.keys(attendanceHistory).length;
  const { streak, longestStreak } = calcStreaks(attendanceHistory);
  const rank              = rankTitle(checkIns);
  const sortedDates       = Object.keys(attendanceHistory).sort();

  console.log(`  Sessions:        ${checkIns}`);
  console.log(`  Current streak:  ${streak} days`);
  console.log(`  Longest streak:  ${longestStreak} days`);
  console.log(`  Rank:            ${rank}`);
  console.log(`  Date range:      ${sortedDates[0]} → ${sortedDates.at(-1)}`);
  console.log(`  Freeze tokens:   1 (one shield earned)`);

  const { error } = await supabase
    .from('profiles')
    .update({
      attendance_history:   attendanceHistory,
      check_ins:            checkIns,
      streak:               streak,
      longest_streak:       longestStreak,
      rank_title:           rank,
      schedule:             ['Mon', 'Tue', 'Thu', 'Sat'],
      freeze_tokens:        1,
      challenges_completed: Math.floor(checkIns * 0.65),
    })
    .eq('id', userId);

  if (error) {
    console.error('\n❌  Supabase error:', error.message);
    process.exit(1);
  }

  console.log('\n✅  Done. Reload the app to experience the week-12 state.');
}

main();
