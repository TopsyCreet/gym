import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, Check, X as XIcon, Minus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import type { AttendanceHistory } from '../store/authStore';
import StatCounter from '../components/ui/StatCounter';

// ── Helpers ───────────────────────────────────────────────────────────────

const DOW_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type DayCell = {
  key: string;
  day: number;
  attended: boolean;
  scheduled: boolean;
  isToday: boolean;
  isFuture: boolean;
};

function getMonthGrid(year: number, month: number, history: AttendanceHistory, schedule: string[], todayStr: string): (DayCell | null)[] {
  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = (firstDow + 6) % 7; // Shift so Mon=0
  const now = new Date();

  const cells: (DayCell | null)[] = Array(leadingBlanks).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const key = date.toISOString().slice(0, 10);
    const dayName = DOW_NAMES[date.getDay()];
    cells.push({
      key,
      day: d,
      attended: history[key] ?? false,
      scheduled: schedule.includes(dayName),
      isToday: key === todayStr,
      isFuture: date > now,
    });
  }
  return cells;
}

// Week-major heatmap: 13 weeks × 7 days
// cells[w * 7 + dow] = week w (0=oldest), day-of-week dow (0=Mon, 6=Sun)
function getHeatmapCells(history: AttendanceHistory, schedule: string[]): DayCell[] {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const todayDow = (today.getDay() + 6) % 7; // Mon=0

  const cells: DayCell[] = [];
  for (let w = 0; w < 13; w++) {
    for (let dow = 0; dow < 7; dow++) {
      const weeksBack = 12 - w;
      const daysBack = todayDow - dow + weeksBack * 7;
      const d = new Date(today);
      d.setDate(today.getDate() - daysBack);
      const key = d.toISOString().slice(0, 10);
      const dayName = DOW_NAMES[d.getDay()];
      cells.push({
        key,
        day: d.getDate(),
        attended: daysBack >= 0 ? (history[key] ?? false) : false,
        scheduled: schedule.includes(dayName),
        isToday: key === todayStr,
        isFuture: daysBack < 0,
      });
    }
  }
  return cells;
}

function heatmapColor(cell: DayCell): string {
  if (cell.isFuture) return 'rgba(255,255,255,0.03)';
  if (cell.attended && cell.scheduled)  return 'var(--gold)';
  if (cell.attended && !cell.scheduled) return 'var(--steel)';
  if (!cell.attended && cell.scheduled) return 'rgba(231,76,60,0.28)';
  return 'rgba(255,255,255,0.06)';
}

function monthCellBg(cell: DayCell): string {
  if (cell.isFuture) return 'rgba(255,255,255,0.02)';
  if (cell.attended && cell.scheduled)  return 'rgba(212,160,23,0.15)';
  if (cell.attended && !cell.scheduled) return 'rgba(61,127,212,0.12)';
  if (!cell.attended && cell.scheduled) return 'rgba(231,76,60,0.07)';
  return 'transparent';
}

function monthCellBorder(cell: DayCell): string {
  if (cell.isToday) return '1.5px solid var(--gold)';
  if (cell.attended && cell.scheduled)  return '1px solid rgba(212,160,23,0.32)';
  if (cell.attended && !cell.scheduled) return '1px solid rgba(61,127,212,0.25)';
  if (!cell.attended && cell.scheduled) return '1px solid rgba(231,76,60,0.18)';
  return '1px solid transparent';
}

// Last 8 calendar weeks, Mon→Sun
function getWeeklyHistory(history: AttendanceHistory, weeksBack = 8) {
  const today = new Date();
  const todayDow = (today.getDay() + 6) % 7;
  return Array.from({ length: weeksBack }, (_, i) => {
    const offset = weeksBack - 1 - i; // 0=current, 7=oldest on left
    let count = 0;
    let mondayDate = '';
    for (let d = 0; d < 7; d++) {
      const daysBack = todayDow - d + offset * 7;
      if (daysBack < 0) continue;
      const day = new Date(today);
      day.setDate(today.getDate() - daysBack);
      if (d === 0) mondayDate = `${MONTH_NAMES[day.getMonth()]} ${day.getDate()}`;
      if (history[day.toISOString().slice(0, 10)]) count++;
    }
    const label = offset === 0 ? 'Now' : mondayDate;
    return { label, count };
  });
}

function getBestWeek(history: AttendanceHistory): number {
  const counts: Record<string, number> = {};
  Object.entries(history)
    .filter(([, v]) => v)
    .forEach(([dateStr]) => {
      const d = new Date(dateStr);
      const dow = (d.getDay() + 6) % 7;
      const mon = new Date(d);
      mon.setDate(d.getDate() - dow);
      const wk = mon.toISOString().slice(0, 10);
      counts[wk] = (counts[wk] ?? 0) + 1;
    });
  return Math.max(0, ...Object.values(counts));
}

// ── Sub-components ────────────────────────────────────────────────────────

function MonthCalendar({ history, schedule }: { history: AttendanceHistory; schedule: string[] }) {
  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [dir,   setDir]   = useState(0);

  const todayStr = now.toISOString().slice(0, 10);
  const cells    = useMemo(() => getMonthGrid(year, month, history, schedule, todayStr), [year, month, history, schedule]);
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  const navigate = (delta: number) => {
    setDir(delta);
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="focus-ring flex items-center justify-center rounded-xl"
          style={{ width: 36, height: 36, background: 'var(--bg-overlay-2)', color: 'var(--text-secondary)' }}
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-bold text-white">{MONTH_NAMES[month]} {year}</span>
        <button
          type="button"
          onClick={() => navigate(1)}
          disabled={isCurrentMonth}
          className="focus-ring flex items-center justify-center rounded-xl"
          style={{
            width: 36, height: 36,
            background: 'var(--bg-overlay-2)',
            color: isCurrentMonth ? 'var(--text-faint)' : 'var(--text-secondary)',
            opacity: isCurrentMonth ? 0.4 : 1,
          }}
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <p key={i} className="label text-center" aria-hidden="true">{d}</p>
        ))}
      </div>

      {/* Calendar grid */}
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={`${year}-${month}`}
          custom={dir}
          initial={{ opacity: 0, x: dir * 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir * -18 }}
          transition={{ duration: 0.2, ease: [0.25, 0, 0.15, 1] }}
          className="grid grid-cols-7 gap-1"
        >
          {cells.map((cell, i) =>
            cell === null ? (
              <div key={`blank-${i}`} />
            ) : (
              <div
                key={cell.key}
                title={cell.key}
                className="flex flex-col items-center justify-center rounded-xl py-1.5"
                style={{
                  background: monthCellBg(cell),
                  border: monthCellBorder(cell),
                  minHeight: 40,
                }}
                aria-label={`${cell.key}: ${cell.attended ? 'Proved' : cell.scheduled ? 'Missed' : 'Rest'}`}
              >
                <span
                  className="text-[11px] font-bold tabular-nums"
                  style={{ color: cell.isToday ? 'var(--gold)' : cell.attended ? 'var(--text-primary)' : 'var(--text-faint)' }}
                >
                  {cell.day}
                </span>
                {!cell.isFuture && (
                  <span className="mt-0.5">
                    {cell.attended ? (
                      <Check size={8} strokeWidth={3} style={{ color: cell.scheduled ? 'var(--gold)' : 'var(--steel)' }} />
                    ) : cell.scheduled ? (
                      <XIcon size={7} strokeWidth={2.5} style={{ color: 'var(--error)' }} />
                    ) : (
                      <Minus size={7} strokeWidth={2} style={{ color: 'var(--text-faint)' }} />
                    )}
                  </span>
                )}
              </div>
            )
          )}
        </motion.div>
      </AnimatePresence>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
        {[
          { color: 'var(--gold)',    label: 'Proved'  },
          { color: 'var(--steel)',   label: 'Bonus'   },
          { color: 'var(--error)',   label: 'Missed'  },
          { color: 'var(--text-faint)', label: 'Rest' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ background: color }} aria-hidden="true" />
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-faint)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function Progress() {
  const user = useAuthStore((s) => s.getUser());
  const containerRef = useRef<HTMLDivElement>(null);
  const heatmapRef   = useRef<HTMLDivElement>(null);

  // GSAP: card stagger entrance
  useGSAP(() => {
    if (!containerRef.current) return;
    gsap.from(containerRef.current.querySelectorAll('[data-card]'), {
      opacity: 0, y: 12,
      duration: 0.4, stagger: 0.07,
      ease: 'power2.out', clearProps: 'all',
    });
  }, { scope: containerRef });

  // GSAP: heatmap tile wave (delayed so card appears first)
  useGSAP(() => {
    if (!heatmapRef.current) return;
    const cells = heatmapRef.current.querySelectorAll('[data-cell]');
    gsap.from(cells, {
      scale: 0, opacity: 0,
      duration: 0.22,
      stagger: { amount: 0.65, from: 'start' },
      ease: 'back.out(1.6)',
      delay: 0.35,
    });
  }, { scope: heatmapRef });

  const heatmapCells  = useMemo(() => user ? getHeatmapCells(user.attendanceHistory, user.schedule) : [], [user]);
  const weeklyHistory = useMemo(() => user ? getWeeklyHistory(user.attendanceHistory) : [], [user]);
  const bestWeek      = useMemo(() => user ? getBestWeek(user.attendanceHistory) : 0, [user]);
  const maxWeekCount  = useMemo(() => Math.max(...weeklyHistory.map((w) => w.count), 1), [weeklyHistory]);

  const streakProgress = user && user.longestStreak > 0
    ? Math.min(1, user.streak / user.longestStreak)
    : 0;

  if (!user) return null;

  return (
    <div ref={containerRef} className="mx-auto max-w-2xl space-y-4 px-4 py-5 sm:px-6 pb-24">

      {/* ── Page title ─────────────────────────────────────────────── */}
      <div className="px-1" data-card>
        <p className="label">Progress</p>
        <h1 className="mt-0.5 text-display font-black leading-none text-white">Your Record</h1>
      </div>

      {/* ── Streak spotlight ───────────────────────────────────────── */}
      <div className="card-hero p-6" data-card>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="label mb-1">Current Streak</p>
            <p
              className="text-[4rem] font-black leading-none tabular-nums"
              style={{ color: user.streak > 0 ? 'var(--gold)' : 'var(--text-faint)', fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
              aria-label={`${user.streak} day streak`}
            >
              <StatCounter value={user.streak} duration={0.7} />
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--text-faint)' }}>
              {user.streak > 0 ? 'days unbroken' : 'start today'}
            </p>
          </div>

          <div>
            <p className="label mb-1">Personal Best</p>
            <p
              className="text-[4rem] font-black leading-none tabular-nums"
              style={{ color: 'var(--text-secondary)', fontFamily: 'Space Grotesk, system-ui, sans-serif' }}
              aria-label={`${user.longestStreak} day personal best`}
            >
              <StatCounter value={user.longestStreak} duration={0.9} />
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--text-faint)' }}>days all-time</p>
          </div>
        </div>

        {/* Current vs best comparison bar */}
        {user.longestStreak > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-1.5">
              <p className="label">Current vs Best</p>
              <p className="label" style={{ color: 'var(--gold)' }}>
                {user.streak}/{user.longestStreak}
              </p>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: 'var(--bg-overlay-2)' }}
              role="progressbar"
              aria-valuenow={user.streak}
              aria-valuemax={user.longestStreak}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${streakProgress * 100}%` }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, var(--gold-muted), var(--gold-light))' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Monthly calendar ───────────────────────────────────────── */}
      <div className="card p-5" data-card>
        <p className="label mb-4">Attendance Calendar</p>
        <MonthCalendar history={user.attendanceHistory} schedule={user.schedule} />
      </div>

      {/* ── Activity heatmap (90 days) ────────────────────────────── */}
      <div className="card p-5" data-card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="label">Activity — Last 13 Weeks</p>
          </div>
          <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-sm" style={{ background: 'var(--gold)' }} aria-hidden="true" />
              Proved
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-sm" style={{ background: 'var(--steel)' }} aria-hidden="true" />
              Bonus
            </span>
          </div>
        </div>

        <div ref={heatmapRef}>
          {/* Day-of-week labels + cell rows */}
          {['M','T','W','T','F','S','S'].map((dayLabel, dow) => (
            <div key={dow} className="flex items-center gap-0.5 mb-0.5">
              <span
                className="shrink-0 text-right"
                style={{ width: 10, fontSize: 7, fontWeight: 700, color: 'var(--text-faint)', lineHeight: 1 }}
                aria-hidden="true"
              >
                {dayLabel}
              </span>
              <div className="w-1 shrink-0" aria-hidden="true" />
              {Array.from({ length: 13 }, (_, w) => {
                const cell = heatmapCells[w * 7 + dow];
                if (!cell) return <div key={w} style={{ width: 12, height: 12, flexShrink: 0 }} />;
                return (
                  <div
                    key={w}
                    data-cell
                    className="rounded-[2px] shrink-0"
                    style={{ width: 12, height: 12, background: heatmapColor(cell), outline: cell.isToday ? '1.5px solid var(--gold)' : 'none', outlineOffset: 1 }}
                    title={`${cell.key}: ${cell.attended ? (cell.scheduled ? 'Proved' : 'Bonus') : cell.scheduled ? 'Missed' : 'Rest'}`}
                    role="img"
                    aria-label={`${cell.key}: ${cell.attended ? 'session' : 'rest'}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── Weekly consistency bar chart ───────────────────────────── */}
      <div className="card p-5" data-card>
        <p className="label mb-4">Weekly Sessions — Last 8 Weeks</p>
        <div className="flex items-end gap-1.5 h-20" role="img" aria-label="Weekly session history bar chart">
          {weeklyHistory.map(({ label, count }, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <span
                className="text-[9px] font-bold tabular-nums"
                style={{ color: count > 0 ? 'var(--gold)' : 'var(--text-faint)' }}
                aria-hidden="true"
              >
                {count || ''}
              </span>
              <div
                className="relative w-full rounded-sm overflow-hidden"
                style={{ height: 48, background: 'var(--bg-overlay-2)' }}
              >
                <motion.div
                  className="absolute bottom-0 w-full rounded-sm"
                  style={{ background: count > 0 ? 'var(--gold)' : 'var(--bg-overlay-3)' }}
                  initial={{ height: 0 }}
                  animate={{ height: `${(count / maxWeekCount) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <p className="label text-center leading-tight" style={{ fontSize: 7 }} aria-hidden="true">
                {label}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs" style={{ color: 'var(--text-faint)' }}>
          Target: {user.schedule.length} session{user.schedule.length !== 1 ? 's' : ''} per week
        </p>
      </div>

      {/* ── Lifetime stats ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3" data-card>
        {[
          { label: 'Sessions',   value: user.checkIns,           suffix: '' },
          { label: 'Trials',     value: user.challengesCompleted, suffix: '' },
          { label: 'Best Week',  value: bestWeek,                suffix: '' },
        ].map(({ label, value, suffix }) => (
          <div
            key={label}
            className="card p-4 text-center"
            style={{ '--data-card': '' } as React.CSSProperties}
          >
            <p className="text-2xl font-black text-white tabular-nums">
              <StatCounter value={value} suffix={suffix} duration={1} />
            </p>
            <p className="label mt-1">{label}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
