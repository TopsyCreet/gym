import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { getXpProgress } from '../utils/xpCalculator';
import { daysOfWeek } from '../utils/streakCalculator';
import RankBadge from '../components/RankBadge';
import AchievementsTab from '../components/AchievementsTab';
import { TrendingUp, Target, CheckCircle, BarChart2, Save } from 'lucide-react';
import { allAchievements } from '../data/achievements';
import { getRankByTitle } from '../data/ranks';

export default function Profile() {
  const user = useAuthStore((state) => state.getUser());
  const updateUser = useAuthStore((state) => state.updateUser);
  const [schedule, setSchedule] = useState(user?.schedule ?? []);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<'overview' | 'milestones'>('overview');

  if (!user) return null;

  const { level, progress } = getXpProgress(user.xp);
  const pct = Math.round(progress * 100);
  const rank = getRankByTitle(user.rankTitle);

  const statCards = [
    { icon: BarChart2,    label: 'Prime Points',   value: user.xp,                  color: '#D4AF37', suffix: '' },
    { icon: TrendingUp,   label: 'Active Streak',  value: user.streak,              color: '#2ECC71', suffix: 'd' },
    { icon: TrendingUp,   label: 'Best Streak',    value: user.longestStreak,       color: '#A1A1AA', suffix: 'd' },
    { icon: CheckCircle,  label: 'Commitments',    value: user.checkIns,            color: '#4A90D9', suffix: '' },
    { icon: Target,       label: 'Trials Cleared', value: user.challengesCompleted, color: '#CD853F', suffix: '' },
  ];

  const handleSave = () => {
    updateUser({ ...user, schedule });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const chartData = useMemo(() => {
    const weeks: number[] = [];
    const today = new Date();
    for (let i = 7; i >= 0; i--) {
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

  const tabItems = [
    { key: 'overview',    label: 'Overview' },
    { key: 'milestones',  label: 'Milestones' },
  ] as const;

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-5 sm:px-6">

      {/* ── Identity hero ────────────────────────────────────── */}
      <div className="card-hero overflow-hidden">
        {/* Rank colour accent line */}
        <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${rank.color}60, transparent)` }} />

        <div className="p-7 sm:p-9">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

            {/* Avatar + identity */}
            <div className="flex items-center gap-5">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="h-20 w-20 rounded-2xl object-cover sm:h-24 sm:w-24"
                  style={{ border: `1px solid ${rank.color}30` }}
                />
              ) : (
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-2xl text-3xl font-black text-black sm:h-24 sm:w-24"
                  style={{ background: `linear-gradient(145deg, ${rank.color}dd, ${rank.color})` }}
                >
                  {user.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="label tracking-[0.25em]">Prime Member</p>
                <h1 className="mt-1 text-3xl font-black leading-tight text-white sm:text-4xl">
                  {user.name}
                </h1>
                <p className="mt-0.5 text-sm" style={{ color: '#3A3A3A' }}>{user.email}</p>
                <div className="mt-3">
                  <RankBadge title={user.rankTitle} size="md" />
                </div>
              </div>
            </div>

            {/* Level + XP ring */}
            <div
              className="flex flex-col items-center justify-center rounded-2xl px-7 py-5 text-center sm:min-w-[9rem]"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="label tracking-[0.22em]">Level</p>
              <p className="mt-1.5 text-5xl font-black text-white">{level}</p>

              {/* Progress arc */}
              <div className="mt-3 w-28">
                <div className="h-px overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full xp-shimmer"
                  />
                </div>
                <p className="mt-1.5 text-[11px]" style={{ color: '#3A3A3A' }}>{pct}% to next</p>
              </div>
            </div>
          </div>

          {/* Manifesto line from rank */}
          <p className="mt-6 text-sm italic" style={{ color: '#3A3A3A' }}>
            {rank.manifesto}
          </p>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            className="card flex flex-col items-center p-4 text-center"
            style={{ borderTop: `1px solid ${s.color}25` }}
          >
            <s.icon size={14} style={{ color: s.color }} />
            <p className="mt-2.5 text-2xl font-black text-white">
              {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
              <span className="text-sm font-semibold" style={{ color: '#3A3A3A' }}>{s.suffix}</span>
            </p>
            <p className="mt-0.5 label">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Tab nav ───────────────────────────────────────────── */}
      <div
        className="flex gap-1 rounded-2xl p-1 w-fit"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.055)' }}
      >
        {tabItems.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className="relative rounded-xl px-5 py-2 text-sm font-semibold transition-colors"
            style={{ color: tab === t.key ? '#fff' : '#4A4A4A' }}
          >
            {tab === t.key && (
              <motion.span
                layoutId="profile-tab"
                className="absolute inset-0 rounded-xl"
                style={{ background: 'rgba(212,175,55,0.09)', border: '1px solid rgba(212,175,55,0.18)' }}
                transition={{ type: 'spring', stiffness: 480, damping: 34 }}
              />
            )}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── Overview ─────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="grid gap-4 lg:grid-cols-2">

          {/* Schedule */}
          <div className="card p-6">
            <p className="label tracking-[0.22em]">Training Schedule</p>
            <h2 className="mt-1 text-xl font-black text-white">Committed Days</h2>
            <p className="mt-1 text-xs" style={{ color: '#3A3A3A' }}>
              Streaks only count on days you commit to.
            </p>
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
                        ? { background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.25)' }
                        : { background: 'rgba(255,255,255,0.025)', color: '#3A3A3A', border: '1px solid rgba(255,255,255,0.05)' }
                    }
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={handleSave} className="btn-primary mt-5 w-full">
              <Save size={13} />
              {saved ? 'Schedule Saved ✓' : 'Save Schedule'}
            </button>
          </div>

          {/* Attendance chart */}
          <div className="card p-6">
            <p className="label tracking-[0.22em]">Attendance Record</p>
            <h2 className="mt-1 text-xl font-black text-white">8-Week History</h2>

            <div className="mt-6 flex h-28 items-end gap-1.5">
              {chartData.map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(2, (v / maxChart) * 100)}%` }}
                    transition={{ delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full rounded-t-[3px]"
                    style={{
                      background: v > 0
                        ? `linear-gradient(to top, #B8962E, #D4AF37)`
                        : 'rgba(255,255,255,0.04)',
                      minHeight: 2,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between">
              {chartData.map((_, i) => (
                <p key={i} className="flex-1 text-center label">W{i + 1}</p>
              ))}
            </div>

            <div className="divider mt-5" />

            {/* Recent milestones */}
            <div className="mt-4">
              <p className="label mb-3 tracking-[0.2em]">Recent Milestones</p>
              {earnedMilestones.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {earnedMilestones.slice(0, 6).map((m) => (
                    <span
                      key={m.id}
                      className="rounded-full px-2.5 py-1 text-xs font-bold"
                      style={{ background: 'rgba(212,175,55,0.07)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.16)' }}
                    >
                      {m.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs" style={{ color: '#2A2A2A' }}>
                  Discipline is built one action at a time.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Milestones ────────────────────────────────────────── */}
      {tab === 'milestones' && (
        <div className="card p-6">
          <AchievementsTab userAchievements={user.achievements} />
        </div>
      )}
    </div>
  );
}
