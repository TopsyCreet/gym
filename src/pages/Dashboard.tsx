import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Target, BarChart2, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useGymStore } from '../store/gymStore';
import { useStreak } from '../hooks/useStreak';
import XPBar from '../components/XPBar';
import StreakCard from '../components/StreakCard';
import AttendanceCalendar from '../components/AttendanceCalendar';
import ChallengeCard from '../components/ChallengeCard';
import CheckInModal from '../components/CheckInModal';
import RankBadge from '../components/RankBadge';

const MOTIVATIONAL = [
  'Consistency compounds.',
  'Your future self is watching.',
  'Discipline outlasts motivation.',
  'The standard is set by what you repeat.',
  'Small actions become powerful identities.',
  'Return tomorrow.',
  'Every day you return, you become harder to defeat.',
  'Proof is built one session at a time.',
];

export default function Dashboard() {
  const user = useAuthStore((state) => state.getUser());
  const openCheckInModal = useGymStore((state) => state.openCheckInModal);
  const [toast, setToast] = useState<string | null>(null);
  const { streak, level, nextMilestone, scheduleToday } = useStreak();

  const checkedInToday = user?.lastCheckInDate === new Date().toISOString().slice(0, 10);
  const motto = MOTIVATIONAL[Math.floor(Date.now() / 86400000) % MOTIVATIONAL.length];

  useEffect(() => {
    if (!user) return;
    if (scheduleToday && !checkedInToday) {
      setToast('Today is a scheduled day. Your streak is at risk.');
    }
  }, [user, scheduleToday, checkedInToday]);

  const weeklyStats = useMemo(() => {
    if (!user) return { attended: 0, active: 0 };
    const today = new Date();
    let attended = 0; let active = 0;
    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const key = day.toISOString().slice(0, 10);
      const name = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][day.getDay()];
      if (user.schedule.includes(name)) active += 1;
      if (user.attendanceHistory[key]) attended += 1;
    }
    return { attended, active };
  }, [user]);

  if (!user) return null;

  const firstName = user.name.split(' ')[0];

  const quickStats = [
    { icon: CheckCircle, label: 'Commitments',   value: user.checkIns,            color: '#D4AF37' },
    { icon: TrendingUp,  label: 'Best Streak',   value: `${user.longestStreak}d`, color: '#B3B3B3' },
    { icon: Target,      label: 'Trials Cleared',value: user.challengesCompleted, color: '#2ECC71' },
    { icon: BarChart2,   label: 'Prime Points',  value: user.xp.toLocaleString(), color: '#4A90D9' },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
            style={{ background: 'rgba(243,156,18,0.08)', border: '1px solid rgba(243,156,18,0.2)' }}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={14} style={{ color: '#F39C12' }} className="shrink-0" />
              <p className="text-sm font-medium" style={{ color: '#F39C12' }}>{toast}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-zinc-600 hover:text-zinc-300">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero card ─────────────────────────────── */}
      <div className="card-elevated p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-black text-surface shadow-gold-sm"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #E5C158)' }}
            >
              {firstName.charAt(0)}
            </div>
            <div>
              <p className="label tracking-[0.2em]">Good to see you</p>
              <h1 className="mt-0.5 text-2xl font-black text-white">{firstName}</h1>
              <p className="mt-0.5 text-xs italic" style={{ color: '#3A3A3A' }}>{motto}</p>
            </div>
          </div>
          <RankBadge title={user.rankTitle} />
        </div>

        {/* Quick stats row */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickStats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-4"
              style={{ background: `${s.color}08`, border: `1px solid ${s.color}18` }}
            >
              <s.icon size={15} style={{ color: s.color }} />
              <p className="mt-2 text-xl font-black text-white">{s.value}</p>
              <p className="mt-0.5 label">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Streak + XP + Commitment CTA ─────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr_auto]">
        <div className="lg:order-1"><StreakCard streak={streak} /></div>
        <div className="lg:order-2"><XPBar xp={user.xp} /></div>

        {/* Commitment CTA — first on mobile so users can act immediately */}
        <div
          className="order-first flex flex-col items-center justify-center gap-3 rounded-2xl p-6 text-center lg:order-3 lg:min-w-[190px]"
          style={{ background: '#121212', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {checkedInToday ? (
            <>
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.2)' }}
              >
                <CheckCircle size={24} style={{ color: '#2ECC71' }} />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider" style={{ color: '#2ECC71' }}>
                Committed ✓
              </p>
              <p className="text-xs" style={{ color: '#3A3A3A' }}>Return tomorrow.</p>
            </>
          ) : (
            <>
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl animate-pulse-gold"
                style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}
              >
                <span className="text-xl font-black" style={{ color: '#D4AF37' }}>▲</span>
              </div>
              <p className="label">Today's Session</p>
              <button
                type="button"
                onClick={openCheckInModal}
                className="btn-primary w-full text-xs"
              >
                Prove Attendance
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Attendance + Trials ─────────────────────────────── */}
      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5">
          <AttendanceCalendar />

          {/* Today's Trials */}
          <div className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="label tracking-[0.2em]">Today's Trials</p>
                <h2 className="mt-1 text-xl font-black text-white">Complete All 3</h2>
                <p className="mt-0.5 text-xs" style={{ color: '#3A3A3A' }}>
                  Every trial cleared is proof of commitment.
                </p>
              </div>
              <span
                className="rounded-full px-3 py-1 text-xs font-bold"
                style={{
                  background: 'rgba(212,175,55,0.08)',
                  color: '#D4AF37',
                  border: '1px solid rgba(212,175,55,0.18)',
                }}
              >
                {user.dailyChallenges.filter((c) => c.completed).length}/3
              </span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {user.dailyChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} id={challenge.id} completed={challenge.completed} />
              ))}
              {user.dailyChallenges.length === 0 && (
                <div className="col-span-3 py-8 text-center">
                  <p className="text-sm" style={{ color: '#3A3A3A' }}>
                    Discipline is built one action at a time.
                  </p>
                  <p className="mt-1 text-xs" style={{ color: '#2A2A2A' }}>
                    Check in first to unlock your trials.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress card */}
        <div className="card p-5">
          <p className="label tracking-[0.2em]">Advancement</p>
          <p className="mt-2 text-4xl font-black text-white">Level {level}</p>
          <p className="mt-1 text-sm" style={{ color: '#4A4A4A' }}>
            Next milestone in{' '}
            <span className="font-bold text-white">{nextMilestone} day{nextMilestone !== 1 ? 's' : ''}</span>
          </p>

          <div className="divider my-5" />

          <p className="label mb-4 tracking-[0.2em]">This Week</p>
          <div className="space-y-4">
            {[
              { label: 'Sessions proved', value: weeklyStats.attended, max: weeklyStats.active || 1, color: '#D4AF37' },
              { label: 'Streak days', value: Math.min(streak, 7), max: 7, color: '#2ECC71' },
              { label: 'Trials cleared', value: user.dailyChallenges.filter((c) => c.completed).length, max: 3, color: '#4A90D9' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span style={{ color: '#4A4A4A' }}>{item.label}</span>
                  <span className="font-bold" style={{ color: '#B3B3B3' }}>{item.value}/{item.max}</span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / item.max) * 100}%` }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="divider my-5" />

          <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.08)' }}>
            <p className="text-xs italic" style={{ color: '#4A4A4A' }}>
              "Every day you return, you become harder to defeat."
            </p>
          </div>
        </div>
      </div>

      <CheckInModal />
    </div>
  );
}
