import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowRight, X, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useGymStore } from '../store/gymStore';
import { useStreak } from '../hooks/useStreak';
import XPBar from '../components/XPBar';
import AttendanceCalendar from '../components/AttendanceCalendar';
import ChallengeCard from '../components/ChallengeCard';
import CheckInModal from '../components/CheckInModal';
import RankBadge from '../components/RankBadge';

const STREAK_COLORS: [number, string][] = [
  [60, '#E5C158'],
  [30, '#D4AF37'],
  [14, '#2ECC71'],
  [7,  '#4A90D9'],
  [3,  '#CD853F'],
  [0,  '#2A2A2A'],
];

function getStreakColor(streak: number) {
  return STREAK_COLORS.find(([min]) => streak >= min)?.[1] ?? '#2A2A2A';
}

const MOTTOS = [
  '"Every day you return, you become harder to defeat."',
  '"Consistency is status."',
  '"The standard is set by what you repeat."',
  '"Discipline outlasts motivation."',
  '"Small actions become powerful identities."',
  '"Proof is built one session at a time."',
  '"Your future self is watching."',
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const user = useAuthStore((state) => state.getUser());
  const openCheckInModal = useGymStore((state) => state.openCheckInModal);
  const [toast, setToast] = useState<string | null>(null);
  const { streak, level, nextMilestone, scheduleToday } = useStreak();

  const today = new Date().toISOString().slice(0, 10);
  const checkedInToday = user?.lastCheckInDate === today;
  const streakColor = getStreakColor(streak);
  const motto = MOTTOS[Math.floor(Date.now() / 86_400_000) % MOTTOS.length];
  const firstName = user?.name.split(' ')[0] ?? '';

  useEffect(() => {
    if (!user) return;
    if (scheduleToday && !checkedInToday) {
      setToast('Today is a scheduled day — your streak is at risk.');
    }
  }, [user, scheduleToday, checkedInToday]);

  const weeklyStats = useMemo(() => {
    if (!user) return { attended: 0, active: 0 };
    const now = new Date();
    let attended = 0; let active = 0;
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const name = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
      if (user.schedule.includes(name)) active++;
      if (user.attendanceHistory[key]) attended++;
    }
    return { attended, active };
  }, [user]);

  if (!user) return null;

  const completedCount = user.dailyChallenges.filter((c) => c.completed).length;

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-5 sm:px-6">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3"
            style={{ background: 'rgba(243,156,18,0.06)', border: '1px solid rgba(243,156,18,0.18)' }}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={13} style={{ color: '#F39C12' }} />
              <p className="text-sm font-medium" style={{ color: '#F39C12' }}>{toast}</p>
            </div>
            <button type="button" onClick={() => setToast(null)} style={{ color: '#3A3A3A' }}>
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero Identity Card ─────────────────────────────────── */}
      <div className="card-hero p-7 sm:p-9">
        {/* Greeting + avatar row */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium" style={{ color: '#5A5A5A' }}>
              {getGreeting()},
            </p>
            <h1 className="mt-0.5 truncate text-4xl font-black leading-none tracking-tight text-white sm:text-5xl">
              {firstName}
            </h1>
          </div>
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-14 w-14 shrink-0 rounded-2xl object-cover"
              style={{ border: '1px solid rgba(212,175,55,0.22)' }}
            />
          ) : (
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-black text-black"
              style={{ background: 'linear-gradient(145deg, #E5C158, #D4AF37)' }}
            >
              {firstName.charAt(0)}
            </div>
          )}
        </div>

        {/* Rank badge */}
        <div className="mt-4">
          <RankBadge title={user.rankTitle} />
        </div>

        {/* Divider */}
        <div className="my-6 divider" />

        {/* Streak — the hero number */}
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <motion.p
              key={streak}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 20 }}
              className="text-hero tabular-nums leading-none"
              style={{ color: streak > 0 ? streakColor : '#2A2A2A' }}
            >
              {streak}
            </motion.p>
            <p
              className="mt-2.5 text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: streak > 0 ? `${streakColor}cc` : '#2A2A2A' }}
            >
              {streak > 0 ? 'Days Unbroken' : 'Begin Your Streak'}
            </p>
          </div>

          {/* Streak symbol + CTA stacked on right */}
          <div className="flex shrink-0 flex-col items-end gap-4">
            <motion.div
              animate={streak > 2 ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                background: streak > 0 ? `${streakColor}0d` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${streakColor}22`,
                boxShadow: streak > 2 ? `0 0 28px ${streakColor}25` : 'none',
              }}
            >
              <span className="text-2xl font-black" style={{ color: streak > 0 ? streakColor : '#222' }}>
                {streak >= 60 ? '◆' : streak >= 30 ? '◆' : streak >= 14 ? '▲' : streak >= 7 ? '▸' : streak >= 3 ? '◇' : '○'}
              </span>
            </motion.div>
          </div>
        </div>

        {/* Quote */}
        <p className="mt-5 max-w-xs text-sm italic leading-relaxed" style={{ color: '#3A3A3A' }}>
          {motto}
        </p>

        {/* CTA */}
        <div className="mt-6">
          {checkedInToday ? (
            <div
              className="inline-flex items-center gap-2.5 rounded-full px-5 py-2.5"
              style={{ background: 'rgba(46,204,113,0.07)', border: '1px solid rgba(46,204,113,0.18)' }}
            >
              <CheckCircle size={14} style={{ color: '#2ECC71' }} />
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: '#2ECC71' }}>
                Committed Today
              </span>
            </div>
          ) : (
            <button type="button" onClick={openCheckInModal} className="btn-primary">
              Prove Today
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── XP Progress ─────────────────────────────────── */}
      <XPBar xp={user.xp} />

      {/* ── Today's Commitments ─────────────────────────────────── */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="label tracking-[0.24em]">Today's Commitments</p>
            <h2 className="mt-1 text-xl font-black text-white">
              {completedCount === 3 ? 'All Cleared' : `${completedCount} of 3 Cleared`}
            </h2>
          </div>
          {completedCount === 3 ? (
            <span className="badge badge-success">Complete</span>
          ) : (
            <span
              className="rounded-full px-3 py-1 text-xs font-bold tabular-nums"
              style={{
                background: 'rgba(212,175,55,0.07)',
                border: '1px solid rgba(212,175,55,0.15)',
                color: '#D4AF37',
              }}
            >
              {completedCount}/3
            </span>
          )}
        </div>

        {user.dailyChallenges.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-3">
            {user.dailyChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} id={challenge.id} completed={challenge.completed} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl py-10 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <p className="text-sm font-semibold text-white">Discipline is built one action at a time.</p>
            <p className="mt-1.5 text-xs" style={{ color: '#3A3A3A' }}>
              Check in first to unlock your daily commitments.
            </p>
          </div>
        )}
      </div>

      {/* ── Calendar + Advancement ─────────────────────────────────── */}
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <AttendanceCalendar />

        {/* Advancement card */}
        <div className="card p-5">
          <p className="label tracking-[0.24em]">Advancement</p>
          <p className="mt-2 text-4xl font-black text-white">Level {level}</p>
          <p className="mt-1 text-sm" style={{ color: '#4A4A4A' }}>
            Next milestone in{' '}
            <span className="font-bold text-white">{nextMilestone} day{nextMilestone !== 1 ? 's' : ''}</span>
          </p>

          <div className="divider my-4" />

          <p className="label mb-4 tracking-[0.2em]">This Week</p>
          <div className="space-y-3.5">
            {[
              { label: 'Sessions proved', value: weeklyStats.attended, max: weeklyStats.active || 1,  color: '#D4AF37' },
              { label: 'Streak days',     value: Math.min(streak, 7),  max: 7,                        color: '#2ECC71' },
              { label: 'Commitments',     value: completedCount,        max: 3,                        color: '#4A90D9' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span style={{ color: '#4A4A4A' }}>{item.label}</span>
                  <span className="font-bold" style={{ color: '#6B6B6B' }}>
                    {item.value}/{item.max}
                  </span>
                </div>
                <div className="mt-1.5 h-px overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / item.max) * 100}%` }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full"
                    style={{ background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="divider my-4" />

          <div
            className="rounded-2xl p-4 text-center"
            style={{ background: 'rgba(212,175,55,0.03)', border: '1px solid rgba(212,175,55,0.07)' }}
          >
            <p className="text-xs italic leading-relaxed" style={{ color: '#3A3A3A' }}>
              "Every day you return, you become harder to defeat."
            </p>
          </div>
        </div>
      </div>

      <CheckInModal />
    </div>
  );
}
