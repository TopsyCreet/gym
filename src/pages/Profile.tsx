import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { getXpProgress } from '../utils/xpCalculator';
import { daysOfWeek } from '../utils/streakCalculator';
import RankBadge from '../components/RankBadge';
import AchievementsTab from '../components/AchievementsTab';
import { TrendingUp, Target, CheckCircle, BarChart2, Save } from 'lucide-react';
import { allAchievements } from '../data/achievements';

export default function Profile() {
  const user = useAuthStore((state) => state.getUser());
  const updateUser = useAuthStore((state) => state.updateUser);
  const [schedule, setSchedule] = useState(user?.schedule ?? []);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<'overview' | 'milestones'>('overview');

  if (!user) return null;

  const { level, progress } = getXpProgress(user.xp);
  const pct = Math.round(progress * 100);

  const statCards = [
    { icon: BarChart2,   label: 'Prime Points',    value: user.xp,               color: '#D4AF37', suffix: ' PP' },
    { icon: TrendingUp,  label: 'Streak',          value: user.streak,           color: '#2ECC71', suffix: 'd' },
    { icon: TrendingUp,  label: 'Best Streak',     value: user.longestStreak,    color: '#B3B3B3', suffix: 'd' },
    { icon: CheckCircle, label: 'Commitments',     value: user.checkIns,         color: '#4A90D9', suffix: '' },
    { icon: Target,      label: 'Trials Cleared',  value: user.challengesCompleted, color: '#2ECC71', suffix: '' },
  ];

  const handleSave = () => {
    updateUser({ ...user, schedule });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const chartData = useMemo(() => {
    const weeks: number[] = [];
    const today = new Date();
    for (let i = 7; i >= 0; i -= 1) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - i * 7);
      const count = Array.from({ length: 7 }).reduce((sum: number, _, j: number) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + j);
        return sum + (user.attendanceHistory[d.toISOString().slice(0, 10)] ? 1 : 0);
      }, 0);
      weeks.push(count);
    }
    return weeks;
  }, [user]);

  const maxChart = Math.max(...chartData, 1);

  const earnedMilestones = allAchievements.filter((a) => user.achievements.includes(a.id));

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">

      {/* ── Identity card ───────────────────────────────────── */}
      <div className="card-elevated overflow-hidden">
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #B8962E, #D4AF37, #E5C158, #D4AF37, #B8962E)' }} />
        <div className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="h-20 w-20 rounded-2xl object-cover shadow-gold-sm"
                  style={{ border: '1px solid rgba(212,175,55,0.2)' }}
                />
              ) : (
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-2xl text-3xl font-black text-surface shadow-gold-sm"
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #E5C158)' }}
                >
                  {user.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="label tracking-[0.25em]">Prime Member</p>
                <h1 className="mt-1 text-3xl font-black text-white">{user.name}</h1>
                <p className="mt-0.5 text-sm" style={{ color: '#4A4A4A' }}>{user.email}</p>
                <div className="mt-3">
                  <RankBadge title={user.rankTitle} />
                </div>
              </div>
            </div>

            {/* Level + XP */}
            <div
              className="rounded-xl px-5 py-4 text-center"
              style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}
            >
              <p className="label tracking-[0.2em]">Level</p>
              <p className="mt-1 text-4xl font-black text-white">{level}</p>
              <div className="mt-2 h-1.5 w-28 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1 }}
                  className="h-full rounded-full xp-shimmer"
                />
              </div>
              <p className="mt-1 text-[11px]" style={{ color: '#4A4A4A' }}>{pct}% to next</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat counters ───────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="card flex flex-col items-center p-4 text-center"
            style={{ borderTop: `1px solid ${s.color}30` }}
          >
            <s.icon size={15} style={{ color: s.color }} />
            <p className="mt-2 text-2xl font-black text-white">
              {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
              <span className="text-sm" style={{ color: '#3A3A3A' }}>{s.suffix}</span>
            </p>
            <p className="mt-0.5 label">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Tab nav ───────────────────────────────────── */}
      <div className="flex gap-1 rounded-xl p-1 w-fit" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'milestones', label: 'Milestones' },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key as typeof tab)}
            className="relative rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
            style={{ color: tab === t.key ? '#fff' : '#4A4A4A' }}
          >
            {tab === t.key && (
              <motion.span
                layoutId="profile-tab"
                className="absolute inset-0 rounded-lg"
                style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}
                transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              />
            )}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">

          {/* ── Schedule editor ───────────────────────────────────── */}
          <div className="card p-5">
            <p className="label tracking-[0.2em]">Training Schedule</p>
            <h2 className="mt-1 text-xl font-black text-white">Your Gym Days</h2>
            <p className="mt-1 text-xs" style={{ color: '#4A4A4A' }}>Streaks only count on days you commit to.</p>
            <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-7">
              {daysOfWeek.slice(1).concat(daysOfWeek[0]).map((day) => {
                const active = schedule.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() =>
                      setSchedule((curr) =>
                        curr.includes(day) ? curr.filter((d) => d !== day) : [...curr, day]
                      )
                    }
                    className="rounded-xl py-3 text-xs font-bold transition-all duration-150"
                    style={
                      active
                        ? { background: 'rgba(212,175,55,0.12)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }
                        : { background: 'rgba(255,255,255,0.02)', color: '#3A3A3A', border: '1px solid rgba(255,255,255,0.05)' }
                    }
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={handleSave} className="btn-primary mt-5 w-full">
              <Save size={14} /> {saved ? 'Saved ✓' : 'Save Schedule'}
            </button>
          </div>

          {/* ── Weekly activity chart ───────────────────────────────────── */}
          <div className="card p-5">
            <p className="label tracking-[0.2em]">Attendance Record</p>
            <h2 className="mt-1 text-xl font-black text-white">8-Week History</h2>
            <div className="mt-6 flex items-end gap-2 h-28">
              {chartData.map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(v / maxChart) * 100}%` }}
                    transition={{ delay: i * 0.06, duration: 0.5 }}
                    className="w-full min-h-[3px] rounded-t-md"
                    style={{
                      background: v > 0
                        ? 'linear-gradient(to top, #B8962E, #D4AF37)'
                        : 'rgba(255,255,255,0.04)',
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between">
              {Array.from({ length: chartData.length }, (_, i) => (
                <p key={i} className="flex-1 text-center label">W{i + 1}</p>
              ))}
            </div>

            <div className="divider mt-4" />

            {/* Recent milestones */}
            <div className="mt-4">
              <p className="label mb-3 tracking-[0.2em]">Recent Milestones</p>
              <div className="flex flex-wrap gap-2">
                {earnedMilestones.slice(0, 6).map((m) => (
                  <span
                    key={m.id}
                    className="rounded-full px-2.5 py-1 text-xs font-bold"
                    style={{ background: 'rgba(212,175,55,0.08)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.18)' }}
                  >
                    {m.name}
                  </span>
                ))}
                {earnedMilestones.length === 0 && (
                  <p className="text-xs" style={{ color: '#3A3A3A' }}>
                    Discipline is built one action at a time.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'milestones' && (
        <div className="card p-6">
          <AchievementsTab userAchievements={user.achievements} />
        </div>
      )}
    </div>
  );
}
