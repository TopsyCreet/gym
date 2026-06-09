import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { getXpProgress } from '../utils/xpCalculator';
import { daysOfWeek } from '../utils/streakCalculator';
import RankBadge from '../components/RankBadge';
import { Flame, Zap, Trophy, Target, Save } from 'lucide-react';

export default function Profile() {
  const user = useAuthStore((state) => state.getUser());
  const updateUser = useAuthStore((state) => state.updateUser);
  const [schedule, setSchedule] = useState(user?.schedule ?? []);
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const { level, progress } = getXpProgress(user.xp);
  const pct = Math.round(progress * 100);

  const statCards = [
    { icon: Zap,    label: 'Total XP',     value: user.xp,               color: '#5B8EF0', suffix: '' },
    { icon: Flame,  label: 'Streak',       value: user.streak,           color: '#EF4444', suffix: 'd' },
    { icon: Flame,  label: 'Best Streak',  value: user.longestStreak,    color: '#F97316', suffix: 'd' },
    { icon: Trophy, label: 'Check-ins',    value: user.checkIns,         color: '#F59E0B', suffix: '' },
    { icon: Target, label: 'Challenges',   value: user.challengesCompleted, color: '#10B981', suffix: '' },
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

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">

      {/* ── Hero card ───────────────────────────────────── */}
      <div className="card overflow-hidden">
        {/* Top gradient strip */}
        <div className="h-2 w-full" style={{ background: 'linear-gradient(90deg, #5B8EF0, #8B5CF6, #EF4444)' }} />
        <div className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              {user.avatar ? (
                <img src={user.avatar} alt="avatar" className="h-20 w-20 rounded-2xl object-cover shadow-glow-sm" />
              ) : (
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-2xl text-3xl font-black text-white"
                  style={{ background: 'linear-gradient(135deg, #5B8EF0, #8B5CF6)', boxShadow: '0 0 24px rgba(91,142,240,0.4)' }}
                >
                  {user.name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-black text-white">{user.name}</h1>
                <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
                <div className="mt-2">
                  <RankBadge title={user.rankTitle} />
                </div>
              </div>
            </div>

            {/* Level + XP */}
            <div className="rounded-xl border border-glow/20 bg-glow/8 px-5 py-4 text-center">
              <p className="label">Level</p>
              <p className="mt-1 text-4xl font-black text-white">{level}</p>
              <div className="mt-2 h-1.5 w-28 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.9 }}
                  className="h-full rounded-full xp-shimmer"
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-600">{pct}% to next</p>
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
            style={{ borderTop: `2px solid ${s.color}40` }}
          >
            <s.icon size={16} style={{ color: s.color }} />
            <p className="mt-2 text-2xl font-black text-white">
              {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
              <span className="text-sm text-zinc-500">{s.suffix}</span>
            </p>
            <p className="mt-0.5 label">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">

        {/* ── Schedule editor ───────────────────────────────────── */}
        <div className="card p-5">
          <p className="label">Training Schedule</p>
          <h2 className="mt-1 text-xl font-black text-white">Gym Days</h2>
          <p className="mt-1 text-xs text-zinc-500">Streaks only count on selected days</p>
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
                      ? { background: 'rgba(91,142,240,0.15)', color: '#5B8EF0', border: '1px solid rgba(91,142,240,0.35)' }
                      : { background: 'rgba(255,255,255,0.03)', color: '#52525b', border: '1px solid rgba(255,255,255,0.06)' }
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
          <p className="label">Activity</p>
          <h2 className="mt-1 text-xl font-black text-white">Weekly Check-ins</h2>
          <div className="mt-6 flex items-end gap-2 h-28">
            {chartData.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(v / maxChart) * 100}%` }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                  className="w-full min-h-[4px] rounded-t-md"
                  style={{
                    background: v > 0
                      ? `linear-gradient(to top, #5B8EF0, #8B5CF6)`
                      : 'rgba(255,255,255,0.04)',
                    opacity: v > 0 ? 1 : 0.5,
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

          {/* Achievements */}
          <div className="mt-4">
            <p className="label mb-3">Achievements</p>
            <div className="flex flex-wrap gap-2">
              {user.achievements.map((a) => (
                <span key={a} className="badge badge-blue">{a}</span>
              ))}
              {user.achievements.length === 0 && (
                <p className="text-xs text-zinc-600">Complete challenges to earn achievements.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
