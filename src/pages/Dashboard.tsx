import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useGymStore } from '../store/gymStore';
import { useStreak } from '../hooks/useStreak';
import XPBar from '../components/XPBar';
import StreakCard from '../components/StreakCard';
import AttendanceCalendar from '../components/AttendanceCalendar';
import ChallengeCard from '../components/ChallengeCard';
import CheckInModal from '../components/CheckInModal';
import RankBadge from '../components/RankBadge';
import { challenges } from '../data/challenges';

export default function Dashboard() {
  const user = useAuthStore((state) => state.getUser());
  const openCheckInModal = useGymStore((state) => state.openCheckInModal);
  const [toast, setToast] = useState<string | null>(null);
  const { streak, level, nextMilestone, scheduleToday } = useStreak();

  useEffect(() => {
    if (!user) return;
    if (scheduleToday && (!user.lastCheckInDate || user.lastCheckInDate !== new Date().toISOString().slice(0, 10))) {
      setToast('⚡ Today is a gym day — your streak is at risk!');
    }
  }, [user, scheduleToday]);

  const weeklyStats = useMemo(() => {
    if (!user) return { total: 0, attended: 0, active: 0 };
    const today = new Date();
    let attended = 0;
    let active = 0;
    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const key = day.toISOString().slice(0, 10);
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()];
      if (user.schedule.includes(dayName)) active += 1;
      if (user.attendanceHistory[key]) attended += 1;
    }
    return { total: 7, attended, active };
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      {toast && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
          {toast}
        </motion.div>
      )}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-3xl border border-white/10 bg-surface2 p-6 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">Welcome back, {user.name.split(' ')[0]} ⚡</p>
              <h1 className="mt-4 text-4xl font-bold text-white">Your daily command center</h1>
            </div>
            <RankBadge title={user.rankTitle} />
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-[#07101f] p-5">
              <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">Today's streak</p>
              <p className="mt-4 text-5xl font-semibold text-white">{streak} days</p>
              <p className="mt-3 text-sm text-zinc-300">Next milestone: {nextMilestone} day{nextMilestone > 1 ? 's' : ''}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#07101f] p-5">
              <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">Level Progress</p>
              <p className="mt-4 text-3xl font-semibold text-white">Level {level}</p>
              <button type="button" onClick={openCheckInModal} className="mt-6 btn-primary w-full">{user.lastCheckInDate === new Date().toISOString().slice(0, 10) ? 'Already checked in today ✓' : 'CHECK IN TODAY'}</button>
            </div>
          </div>
        </section>
        <aside className="space-y-5">
          <StreakCard streak={streak} />
          <XPBar xp={user.xp} />
        </aside>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <AttendanceCalendar />
          <section className="rounded-3xl border border-white/10 bg-surface2 p-6 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">Daily Challenges</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Today's mission</h2>
              </div>
              <div className="rounded-full bg-white/5 px-3 py-2 text-sm text-zinc-300">{user.dailyChallenges.filter((item) => item.completed).length}/3 complete</div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {user.dailyChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} id={challenge.id} completed={challenge.completed} />
              ))}
            </div>
          </section>
        </div>
        <div className="rounded-3xl border border-white/10 bg-surface2 p-6 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">Quick stats</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Champion metrics</h2>
            </div>
            <Sparkles className="text-glow" size={28} />
          </div>
          <div className="mt-6 grid gap-4">
            <div className="rounded-3xl bg-[#08111f] p-4">
              <p className="text-sm text-zinc-400">Total check-ins</p>
              <p className="mt-2 text-3xl font-semibold text-white">{user.checkIns}</p>
            </div>
            <div className="rounded-3xl bg-[#08111f] p-4">
              <p className="text-sm text-zinc-400">Longest streak</p>
              <p className="mt-2 text-3xl font-semibold text-white">{user.longestStreak} days</p>
            </div>
            <div className="rounded-3xl bg-[#08111f] p-4">
              <p className="text-sm text-zinc-400">Challenges done</p>
              <p className="mt-2 text-3xl font-semibold text-white">{user.challengesCompleted}</p>
            </div>
          </div>
        </div>
      </div>
      <CheckInModal />
    </div>
  );
}
