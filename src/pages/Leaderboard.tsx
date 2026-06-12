/**
 * BACKEND GAP: live gym board requires a gym-scoped members query in Supabase
 * (SELECT * FROM profiles WHERE gym_id = current_user_gym_id, ordered by check-ins/streak).
 * Showing mock data until that view exists.
 */

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, TrendingUp, Calendar } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase, supabaseConfigured } from '../lib/supabaseClient';

type MockMember = {
  id: string;
  name: string;
  initials: string;
  rankTitle: string;
  sessionsThisMonth: number;
  streak: number;
  kudos: number;
};

const MOCK_MEMBERS: MockMember[] = [
  { id: 'mock-1', name: 'Emeka O.',  initials: 'EO', rankTitle: 'Elite',    sessionsThisMonth: 18, streak: 14, kudos: 5 },
  { id: 'mock-2', name: 'Kemi A.',   initials: 'KA', rankTitle: 'Vanguard', sessionsThisMonth: 15, streak: 12, kudos: 8 },
  { id: 'mock-3', name: 'Tunde B.',  initials: 'TB', rankTitle: 'Vanguard', sessionsThisMonth: 14, streak: 10, kudos: 3 },
  { id: 'mock-4', name: 'Ada N.',    initials: 'AN', rankTitle: 'Forged',   sessionsThisMonth: 12, streak: 8,  kudos: 6 },
  { id: 'mock-5', name: 'Chidi O.',  initials: 'CO', rankTitle: 'Forged',   sessionsThisMonth: 10, streak: 7,  kudos: 2 },
  { id: 'mock-6', name: 'Bisi A.',   initials: 'BA', rankTitle: 'Initiate', sessionsThisMonth: 7,  streak: 4,  kudos: 1 },
];

const INITIALS_COLORS: Record<string, string> = {
  A:'#CD853F', B:'#8A9BA8', C:'#D4A017', D:'#D4A017', E:'#A085E0',
  F:'#CD853F', G:'#8A9BA8', H:'#D4A017', I:'#D4A017', J:'#A085E0',
  K:'#CD853F', L:'#8A9BA8', M:'#D4A017', N:'#D4A017', O:'#A085E0',
  P:'#CD853F', Q:'#8A9BA8', R:'#D4A017', S:'#D4A017', T:'#A085E0',
  U:'#CD853F', V:'#8A9BA8', W:'#D4A017', X:'#D4A017', Y:'#A085E0',
  Z:'#CD853F',
};
const getInitialsColor = (s: string) => INITIALS_COLORS[s[0]?.toUpperCase()] ?? 'var(--gold)';

const PODIUM: Record<number, { bg: string; text: string; border: string }> = {
  0: { bg: 'rgba(212,160,23,0.12)',  text: '#D4A017', border: 'rgba(212,160,23,0.25)' },
  1: { bg: 'rgba(161,161,170,0.08)', text: '#A1A1AA', border: 'rgba(161,161,170,0.2)' },
  2: { bg: 'rgba(205,133,63,0.08)',  text: '#CD853F', border: 'rgba(205,133,63,0.2)'  },
};

function plural(n: number, word: string) { return `${n} ${word}${n !== 1 ? 's' : ''}`; }

type Tab = 'sessions' | 'streak';

// ── Respect button (Mechanic 4: one kudos per member per session)
function RespectButton({ initial }: { initial: number }) {
  const [count, setCount] = useState(initial);
  const [tapped, setTapped] = useState(false);

  const handle = () => {
    if (tapped) return;
    setTapped(true);
    setCount((n) => n + 1);
  };

  return (
    <motion.button
      type="button"
      onClick={handle}
      aria-label={tapped ? `${count} respects given` : `Give respect (${count})`}
      aria-pressed={tapped}
      whileTap={{ scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      className="shrink-0 flex items-center gap-1.5 rounded-xl px-2.5"
      style={{
        background: tapped ? 'rgba(212,160,23,0.08)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${tapped ? 'rgba(212,160,23,0.28)' : 'rgba(255,255,255,0.07)'}`,
        minHeight: 34,
        minWidth: 44,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ y: -5, opacity: 0, scale: 0.75 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 5, opacity: 0, scale: 0.75 }}
          transition={{ duration: 0.12 }}
          className="text-xs font-bold tabular-nums"
          style={{ color: tapped ? 'var(--gold)' : 'var(--text-secondary)' }}
        >
          {count}
        </motion.span>
      </AnimatePresence>
      <Heart
        size={11}
        style={{ color: tapped ? 'var(--gold)' : 'var(--text-faint)' }}
        fill={tapped ? 'var(--gold)' : 'none'}
        aria-hidden="true"
      />
    </motion.button>
  );
}

export default function Leaderboard() {
  const user     = useAuthStore((state) => state.getUser());
  const demoMode = useAuthStore((state) => state.demoMode);
  const [tab, setTab] = useState<Tab>('sessions');
  const [liveMembers, setLiveMembers] = useState<(MockMember & { isMe: boolean })[] | null>(null);
  const channelRef = useRef<any>(null);

  const buildMembers = useCallback((rows: any[], userId: string) => {
    const now = new Date();
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const seen = new Set<string>();
    return rows
      .filter((p: any) => {
        if (!p.name?.trim()) return false; // skip blank placeholder rows from failed logins
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      })
      .map((p: any) => {
        const history: Record<string, boolean> = p.attendance_history ?? {};
        const monthSessions = Object.entries(history)
          .filter(([d, v]) => d.startsWith(monthPrefix) && v === true).length;
        return {
          id: p.id,
          name: p.name ?? '',
          initials: (p.name ?? '').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
          rankTitle: p.rank_title ?? 'Initiate',
          sessionsThisMonth: monthSessions,
          streak: p.streak ?? 0,
          kudos: 0,
          isMe: p.id === userId,
        };
      });
  }, []);

  useEffect(() => {
    if (!supabaseConfigured || !supabase || demoMode || !user?.gymId || !user?.id) return;
    const gymId  = user.gymId;
    const userId = user.id;

    // Initial fetch
    supabase
      .from('profiles')
      .select('id, name, rank_title, streak, check_ins, attendance_history')
      .eq('gym_id', gymId)
      .then(({ data, error }) => {
        if (error) { console.error('[Leaderboard] query failed:', error.message); return; }
        if (data?.length) setLiveMembers(buildMembers(data, userId));
        else console.warn('[Leaderboard] no profiles for gym_id:', gymId);
      });

    // Real-time: re-fetch the full list whenever any gymmate's profile changes
    const channel = supabase
      .channel(`leaderboard-${gymId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `gym_id=eq.${gymId}` },
        () => {
          supabase!
            .from('profiles')
            .select('id, name, rank_title, streak, check_ins, attendance_history')
            .eq('gym_id', gymId)
            .then(({ data }) => { if (data?.length) setLiveMembers(buildMembers(data, userId)); });
        }
      )
      .subscribe();
    channelRef.current = channel;

    return () => {
      if (channelRef.current && supabase) supabase.removeChannel(channelRef.current);
    };
  }, [user?.gymId, user?.id, demoMode, buildMembers]);

  const sessionsThisMonth = useMemo(() => {
    if (!user) return 0;
    const now = new Date();
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return Object.keys(user.attendanceHistory ?? {}).filter((d) => d.startsWith(prefix)).length;
  }, [user]);

  const allMembers = useMemo(() => {
    if (liveMembers) {
      const list = liveMembers.map((m) =>
        m.isMe
          ? { ...m, streak: user?.streak ?? m.streak, sessionsThisMonth: sessionsThisMonth || m.sessionsThisMonth }
          : m
      );
      return tab === 'sessions'
        ? [...list].sort((a, b) => b.sessionsThisMonth - a.sessionsThisMonth)
        : [...list].sort((a, b) => b.streak - a.streak);
    }
    const mocks = MOCK_MEMBERS.map((m) => ({ ...m, isMe: false }));
    if (!user) {
      return tab === 'sessions'
        ? [...mocks].sort((a, b) => b.sessionsThisMonth - a.sessionsThisMonth)
        : [...mocks].sort((a, b) => b.streak - a.streak);
    }
    const me = {
      id: user.id,
      name: user.name,
      initials: user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
      rankTitle: user.rankTitle,
      sessionsThisMonth,
      streak: user.streak,
      isMe: true,
      kudos: 0,
    };
    const combined = [...mocks, me];
    return tab === 'sessions'
      ? combined.sort((a, b) => b.sessionsThisMonth - a.sessionsThisMonth)
      : combined.sort((a, b) => b.streak - a.streak);
  }, [liveMembers, user, tab, sessionsThisMonth]);

  if (!user) return null;

  const TABS: { key: Tab; label: string; icon: typeof Calendar }[] = [
    { key: 'sessions', label: 'Sessions', icon: Calendar },
    { key: 'streak',   label: 'Streak',   icon: TrendingUp },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-5 sm:px-6">

      {/* ── Hero */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="card-hero relative overflow-hidden p-8 sm:p-10"
      >
        <div
          className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 select-none font-black leading-none"
          style={{ fontSize: 'clamp(6rem, 20vw, 11rem)', color: 'rgba(212,160,23,0.025)', letterSpacing: '-0.05em' }}
        >
          01
        </div>

        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="badge badge-gold">Your Gym</span>
            {import.meta.env.DEV && !liveMembers && (
              <span
                className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                style={{
                  background: 'rgba(243,156,18,0.1)',
                  border: '1px solid rgba(243,156,18,0.2)',
                  color: 'var(--warning)',
                }}
                title="Showing mock data — check console for query errors"
              >
                Mock
              </span>
            )}
          </div>
        </div>

        <h1 className="text-display text-white">Gym Ranks</h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Monthly consistency within Prime Performance Center. Who actually shows up — month after month.
        </p>

        <div className="mt-6 flex flex-wrap gap-2.5">
          {[
            { label: 'Sessions', desc: 'Check-ins this month',  color: '#8A9BA8' },
            { label: 'Streak',   desc: 'Consecutive days',       color: '#D4A017' },
          ].map((t) => (
            <div
              key={t.label}
              className="rounded-2xl px-4 py-2.5"
              style={{ background: 'var(--bg-overlay-1)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.color }} />
                <p className="text-xs font-black uppercase tracking-wider text-white">{t.label}</p>
              </div>
              <p className="mt-0.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Board */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="card overflow-hidden p-0"
      >
        {/* Board header + tab switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 pb-4">
          <div>
            <p className="label tracking-[0.25em]">Prime Performance Center</p>
            <h2 className="mt-1 text-xl font-black text-white">Monthly Board</h2>
          </div>
          <div
            className="flex gap-1 rounded-2xl p-1"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.055)' }}
          >
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className="relative rounded-xl px-4 py-1.5 text-xs font-semibold transition-colors"
                style={{ color: tab === t.key ? '#fff' : 'var(--text-muted)' }}
              >
                {tab === t.key && (
                  <motion.span
                    layoutId="ranks-tab-bg"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.2)' }}
                    transition={{ type: 'spring', stiffness: 480, damping: 34 }}
                  />
                )}
                <span className="relative">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* Member rows */}
        <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
          {allMembers.map((member, index) => {
            const podium = PODIUM[index];
            const accentColor = getInitialsColor(member.initials);
            const score = tab === 'sessions'
              ? plural(member.sessionsThisMonth, 'session')
              : plural(member.streak, 'day');

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                className="flex items-center gap-3 px-5 py-3.5"
                style={{ background: member.isMe ? 'rgba(212,160,23,0.03)' : 'transparent' }}
              >
                {/* Position */}
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black"
                  style={
                    podium
                      ? { background: podium.bg, color: podium.text, border: `1px solid ${podium.border}` }
                      : { background: 'rgba(255,255,255,0.025)', color: 'var(--text-faint)', border: '1px solid rgba(255,255,255,0.05)' }
                  }
                >
                  {index + 1}
                </div>

                {/* Avatar */}
                <div
                  className="shrink-0 flex items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    width: 36, height: 36,
                    background: `${accentColor}18`,
                    border: `1px solid ${member.isMe ? 'rgba(212,160,23,0.3)' : `${accentColor}28`}`,
                    color: accentColor,
                  }}
                >
                  {member.initials}
                </div>

                {/* Name + rank */}
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-semibold ${member.isMe ? 'text-white' : 'text-zinc-300'}`}>
                    {member.name}
                    {member.isMe && (
                      <span
                        className="ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                        style={{ background: 'rgba(212,160,23,0.1)', color: 'var(--gold)' }}
                      >
                        You
                      </span>
                    )}
                  </p>
                  <p className="label mt-0.5">{member.rankTitle}</p>
                </div>

                {/* Score */}
                <span
                  className="shrink-0 rounded-full px-3 py-1 text-xs font-black tabular-nums"
                  style={{
                    background: member.isMe ? 'rgba(212,160,23,0.1)' : 'rgba(255,255,255,0.04)',
                    color: member.isMe ? 'var(--gold)' : 'var(--text-secondary)',
                    border: `1px solid ${member.isMe ? 'rgba(212,160,23,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  {score}
                </span>

                {/* Respect (not shown on own row) */}
                {!member.isMe ? (
                  <RespectButton initial={member.kudos} />
                ) : (
                  <div style={{ minWidth: 44 }} />
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Footer */}
      <div
        className="space-y-1 rounded-2xl p-5 text-center"
        style={{ background: 'var(--bg-overlay-1)', border: '1px solid var(--border-ghost)' }}
      >
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Resets on the 1st · Gym: Prime Performance Center
        </p>
        {import.meta.env.DEV && !liveMembers && (
          <p className="text-[10px]" style={{ color: 'var(--text-ghost)' }}>
            Showing mock data — run 002_fix_profiles_rls.sql if live members aren't loading.
          </p>
        )}
        <p className="mt-2 text-xs italic" style={{ color: 'var(--text-muted)' }}>
          "The standard is set by what you repeat."
        </p>
      </div>
    </div>
  );
}
