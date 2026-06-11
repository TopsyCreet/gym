import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useAuthStore } from '../store/authStore';
import { daysOfWeek } from '../utils/streakCalculator';
import RankBadge from '../components/RankBadge';
import { getRankByTitle } from '../data/ranks';
import { TrendingUp, Target, CheckCircle, Save, Settings } from 'lucide-react';
import mascotHappy from '../assets/brand/mascot_happy.png';

type RankTier = { title: string; minCheckIns: number };

const RANK_THRESHOLDS: RankTier[] = [
  { title: 'Initiate', minCheckIns: 0 },
  { title: 'Forged',   minCheckIns: 10 },
  { title: 'Vanguard', minCheckIns: 25 },
  { title: 'Elite',    minCheckIns: 50 },
  { title: 'Prime',    minCheckIns: 100 },
  { title: 'Monarch',  minCheckIns: 200 },
];

function getRankProgress(checkIns: number) {
  let currentIdx = 0;
  for (let i = 0; i < RANK_THRESHOLDS.length; i++) {
    if (checkIns >= RANK_THRESHOLDS[i].minCheckIns) currentIdx = i;
  }
  const isMax   = currentIdx === RANK_THRESHOLDS.length - 1;
  const current = RANK_THRESHOLDS[currentIdx];
  const next    = isMax ? null : RANK_THRESHOLDS[currentIdx + 1];
  const pct     = isMax
    ? 1
    : (checkIns - current.minCheckIns) / (next!.minCheckIns - current.minCheckIns);
  return { current, next, pct: Math.min(1, pct), isMax };
}

export default function Profile() {
  const user       = useAuthStore((state) => state.getUser());
  const updateUser = useAuthStore((state) => state.updateUser);
  const [schedule, setSchedule] = useState(user?.schedule ?? []);
  const [saved, setSaved]       = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const rankBarRef   = useRef<HTMLDivElement>(null);

  const rank                        = getRankByTitle(user?.rankTitle ?? 'Initiate');
  const { current, next, pct, isMax } = getRankProgress(user?.checkIns ?? 0);

  // GSAP: card stagger entrance
  useGSAP(() => {
    if (!containerRef.current) return;
    gsap.from(containerRef.current.querySelectorAll('[data-card]'), {
      opacity: 0, y: 12,
      duration: 0.4, stagger: 0.07,
      ease: 'power2.out', clearProps: 'all',
    });
  }, { scope: containerRef });

  // GSAP: rank progress bar
  useGSAP(() => {
    if (!rankBarRef.current) return;
    gsap.fromTo(
      rankBarRef.current,
      { width: '0%' },
      { width: `${Math.round(pct * 100)}%`, duration: 1.4, ease: 'power3.out', delay: 0.4 }
    );
  }, [pct]);

  const statCards = [
    { icon: CheckCircle, label: 'Sessions',      value: user?.checkIns ?? 0,            color: '#3D7FD4' },
    { icon: TrendingUp,  label: 'Active Streak', value: user?.streak ?? 0,              color: '#27AE60', suffix: 'd' },
    { icon: TrendingUp,  label: 'Best Streak',   value: user?.longestStreak ?? 0,       color: '#A1A1AA', suffix: 'd' },
    { icon: Target,      label: 'Trials',        value: user?.challengesCompleted ?? 0, color: '#D4A017' },
  ];

  const handleSave = () => {
    if (!user) return;
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
        return sum + ((user?.attendanceHistory ?? {})[d.toISOString().slice(0, 10)] ? 1 : 0);
      }, 0);
      weeks.push(count);
    }
    return weeks;
  }, [user]);

  const maxChart = Math.max(...chartData, 1);

  if (!user) return null;

  // Mon-first day order
  const orderedDays = daysOfWeek.slice(1).concat(daysOfWeek[0]);

  return (
    <div ref={containerRef} className="mx-auto max-w-2xl space-y-4 px-4 py-5 sm:px-6 pb-24">

      {/* ── Identity hero */}
      <div className="card-hero relative overflow-hidden" data-card>
        {/* Rank-colour top line */}
        <div
          className="h-px w-full"
          style={{ background: `linear-gradient(90deg, transparent, ${rank.color}70, transparent)` }}
        />

        {/* Mascot — floats bottom-right of the hero card */}
        <img
          src={mascotHappy}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-3 select-none"
          style={{ width: 90, opacity: 0.9 }}
        />

        <div className="relative p-6 sm:p-8">
          {/* Settings shortcut */}
          <div className="flex justify-end mb-4">
            <Link
              to="/settings"
              className="flex items-center justify-center rounded-xl transition-colors hover:bg-white/[0.06]"
              style={{
                width: 34, height: 34,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: 'var(--text-faint)',
              }}
              aria-label="Open settings"
            >
              <Settings size={14} />
            </Link>
          </div>

          {/* Avatar + identity */}
          <div className="flex items-center gap-5 pr-20">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                className="h-20 w-20 shrink-0 rounded-2xl object-cover"
                style={{ border: `1px solid ${rank.color}35` }}
              />
            ) : (
              <div
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-3xl font-black text-black"
                style={{ background: `linear-gradient(145deg, ${rank.color}cc, ${rank.color})` }}
              >
                {user.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="label tracking-[0.25em]">Prime Member</p>
              <h1 className="mt-1 truncate text-2xl font-black leading-tight text-white sm:text-3xl">
                {user.name}
              </h1>
              <p className="mt-0.5 truncate text-xs" style={{ color: 'var(--text-secondary)' }}>
                {user.email}
              </p>
              <div className="mt-3">
                <RankBadge title={user.rankTitle} size="md" />
              </div>
            </div>
          </div>

          {/* Rank progress */}
          <div
            className="mt-6 rounded-2xl px-5 py-4"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="flex items-end justify-between gap-4 mb-3">
              <div>
                <p className="label tracking-[0.2em]">Check-Ins</p>
                <p className="mt-0.5 text-3xl font-black text-white tabular-nums">{user.checkIns}</p>
              </div>
              {!isMax && next && (
                <p className="text-xs pb-1" style={{ color: 'var(--text-secondary)' }}>
                  {next.minCheckIns - user.checkIns} more to <span style={{ color: rank.color }}>{next.title}</span>
                </p>
              )}
              {isMax && (
                <p className="text-xs pb-1" style={{ color: 'var(--gold)' }}>Maximum rank</p>
              )}
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full"
              style={{ background: 'rgba(255,255,255,0.06)' }}
              role="progressbar"
              aria-valuenow={user.checkIns}
              aria-valuemax={next?.minCheckIns ?? user.checkIns}
            >
              <div
                ref={rankBarRef}
                className="h-full rounded-full"
                style={{ width: '0%', background: `linear-gradient(90deg, ${rank.color}88, ${rank.color})` }}
              />
            </div>
          </div>

          <p className="mt-4 text-sm italic" style={{ color: 'var(--text-secondary)' }}>
            "{rank.manifesto}"
          </p>
        </div>
      </div>

      {/* ── Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" data-card>
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, duration: 0.35 }}
            className="card flex flex-col items-center p-4 text-center"
            style={{ borderTop: `2px solid ${s.color}28` }}
          >
            <s.icon size={13} style={{ color: s.color }} aria-hidden="true" />
            <p className="mt-2 text-2xl font-black text-white tabular-nums">
              {s.value.toLocaleString()}
              {'suffix' in s && <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{s.suffix}</span>}
            </p>
            <p className="mt-0.5 label">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Two-col section */}
      <div className="grid gap-4 sm:grid-cols-2">

        {/* Schedule editor */}
        <div className="card p-5" data-card>
          <p className="label tracking-[0.22em]">Training Schedule</p>
          <h2 className="mt-1 text-lg font-black text-white">Committed Days</h2>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            Streaks only count on days you commit to.
          </p>
          <div className="mt-4 grid grid-cols-7 gap-1.5">
            {orderedDays.map((day) => {
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
                  className="rounded-xl py-2.5 text-[10px] font-bold transition-all duration-150"
                  style={
                    active
                      ? { background: 'rgba(212,160,23,0.1)', color: 'var(--gold)', border: '1px solid rgba(212,160,23,0.28)' }
                      : { background: 'rgba(255,255,255,0.025)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.05)' }
                  }
                  aria-pressed={active}
                >
                  {day.slice(0, 2)}
                </button>
              );
            })}
          </div>
          <button type="button" onClick={handleSave} className="btn-primary mt-4 w-full">
            <Save size={13} aria-hidden="true" />
            {saved ? 'Schedule Saved ✓' : 'Save Schedule'}
          </button>
        </div>

        {/* 8-week chart */}
        <div className="card p-5" data-card>
          <p className="label tracking-[0.22em]">Attendance Record</p>
          <h2 className="mt-1 text-lg font-black text-white">8-Week History</h2>

          <div className="mt-5 flex h-24 items-end gap-1.5" role="img" aria-label="8-week attendance chart">
            {chartData.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(4, (v / maxChart) * 100)}%` }}
                  transition={{ delay: 0.2 + i * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full rounded-t-[3px]"
                  style={{ background: v > 0 ? 'linear-gradient(to top, #B8962E, #D4A017)' : 'rgba(255,255,255,0.04)' }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between">
            {chartData.map((_, i) => (
              <p key={i} className="flex-1 text-center label" aria-hidden="true">W{i + 1}</p>
            ))}
          </div>

          <div className="divider mt-4" />

          {/* Rank ladder */}
          <div className="mt-3">
            <p className="label mb-2.5 tracking-[0.2em]">Rank Ladder</p>
            <div className="flex flex-wrap gap-1.5">
              {RANK_THRESHOLDS.map((tier) => {
                const reached   = user.checkIns >= tier.minCheckIns;
                const isCurrent = tier.title === current.title;
                return (
                  <span
                    key={tier.title}
                    className="rounded-full px-2.5 py-1 text-xs font-bold"
                    style={
                      isCurrent
                        ? { background: `${rank.color}18`, color: rank.color, border: `1px solid ${rank.color}32` }
                        : reached
                        ? { background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.07)' }
                        : { background: 'transparent', color: 'var(--text-faint)', border: '1px solid rgba(255,255,255,0.04)' }
                    }
                  >
                    {tier.title}{reached && !isCurrent ? ' ✓' : ''}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
