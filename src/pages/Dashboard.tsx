import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Flame, Trophy, Target, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useGymStore } from '../store/gymStore';
import { useStreak } from '../hooks/useStreak';
import XPBar from '../components/XPBar';
import StreakCard from '../components/StreakCard';
import AttendanceCalendar from '../components/AttendanceCalendar';
import ChallengeCard from '../components/ChallengeCard';
import CheckInModal from '../components/CheckInModal';
import RankBadge from '../components/RankBadge';

export default function Dashboard() {
  const user = useAuthStore((state) => state.getUser());
  const openCheckInModal = useGymStore((state) => state.openCheckInModal);
  const [toast, setToast] = useState<string | null>(null);
  const { streak, level, nextMilestone, scheduleToday } = useStreak();

  const checkedInToday = user?.lastCheckInDate === new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!user) return;
    if (scheduleToday && !checkedInToday) {
      setToast('Today is a gym day — your streak is at risk!');
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
    { icon: Trophy,  label: 'Check-ins',     value: user.checkIns,            color: '#F59E0B' },
    { icon: Flame,   label: 'Best Streak',   value: `${user.longestStreak}d`, color: '#EF4444' },
    { icon: Target,  label: 'Challenges',    value: user.challengesCompleted, color: '#10B981' },
    { icon: Zap,     label: 'Total XP',      value: user.xp.toLocaleString(), color: '#5B8EF0' },
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
            className="flex items-center justify-between gap-3 rounded-xl border border-fire/20 bg-fire/8 px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <Flame size={15} className="text-fire shrink-0" />
              <p className="text-sm font-medium text-orange-200">{toast}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-zinc-500 hover:text-white">
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Welcome + rank ─────────────────────────────── */}
      <div className="card p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Greeting */}
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-black text-white"
              style={{ background: 'linear-gradient(135deg, #5B8EF0, #8B5CF6)', boxShadow: '0 0 24px rgba(91,142,240,0.4)' }}
            >
              {firstName.charAt(0)}
            </div>
            <div>
              <p className="label">Welcome back</p>
              <h1 className="mt-0.5 text-2xl font-black text-white">{firstName}</h1>
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
              style={{ background: `${s.color}0D`, border: `1px solid ${s.color}20` }}
            >
              <s.icon size={16} style={{ color: s.color }} />
              <p className="mt-2 text-xl font-black text-white">{s.value}</p>
              <p className="mt-0.5 label">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Streak + XP + Check-in ─────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr_auto]">
        <StreakCard streak={streak} />
        <XPBar xp={user.xp} />

        {/* Check-in CTA */}
        <div className="card flex flex-col items-center justify-center gap-3 p-6 text-center lg:min-w-[180px]">
          {checkedInToday ? (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-jade/15">
                <Zap size={24} className="text-jade" />
              </div>
              <p className="text-sm font-semibold text-jade">Checked In ✓</p>
              <p className="text-xs text-zinc-600">See you tomorrow</p>
            </>
          ) : (
            <>
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl animate-pulse-glow"
                style={{ background: 'rgba(91,142,240,0.15)' }}
              >
                <Zap size={24} className="text-glow" />
              </div>
              <p className="label">Today's Session</p>
              <button
                type="button"
                onClick={openCheckInModal}
                className="btn-primary w-full text-xs"
              >
                Check In
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Attendance + Challenges ─────────────────────────────── */}
      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5">
          <AttendanceCalendar />

          {/* Daily Challenges */}
          <div className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="label">Daily Challenges</p>
                <h2 className="mt-1 text-xl font-black text-white">Today's Mission</h2>
              </div>
              <span
                className="rounded-full px-3 py-1 text-xs font-bold"
                style={{ background: 'rgba(139,92,246,0.12)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.25)' }}
              >
                {user.dailyChallenges.filter((c) => c.completed).length}/3 done
              </span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {user.dailyChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} id={challenge.id} completed={challenge.completed} />
              ))}
            </div>
          </div>
        </div>

        {/* Level & milestone card */}
        <div className="card p-5">
          <p className="label">Level Progress</p>
          <p className="mt-2 text-4xl font-black text-white">Lv. {level}</p>
          <p className="mt-1 text-sm text-zinc-500">
            Next milestone in <span className="font-bold text-zinc-300">{nextMilestone} day{nextMilestone !== 1 ? 's' : ''}</span>
          </p>

          <div className="divider my-5" />

          <p className="label mb-4">Weekly Score</p>
          <div className="space-y-3">
            {[
              { label: 'Sessions attended', value: weeklyStats.attended, max: weeklyStats.active || 1, color: '#10B981' },
              { label: 'Streak days', value: Math.min(streak, 7), max: 7, color: '#EF4444' },
              { label: 'Challenges done', value: user.dailyChallenges.filter((c) => c.completed).length, max: 3, color: '#5B8EF0' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-zinc-500">{item.label}</span>
                  <span className="font-bold text-zinc-300">{item.value}/{item.max}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / item.max) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CheckInModal />
    </div>
  );
}
