import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { daysOfWeek } from '../utils/streakCalculator';

export default function AttendanceCalendar() {
  const user = useAuthStore((state) => state.getUser());
  const today = new Date();

  const days = useMemo(() => {
    const items = [];
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      items.push({ key, date });
    }
    return items;
  }, [today]);

  return (
    <div className="rounded-3xl border border-white/10 bg-surface2 p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">Attendance</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">This week</h2>
        </div>
        <div className="text-sm text-zinc-300">Legend: filled = attended</div>
      </div>
      <div className="mt-5 grid grid-cols-7 gap-3">
        {days.map(({ key, date }) => {
          const attended = user?.attendanceHistory[key];
          const day = daysOfWeek[date.getDay()];
          return (
            <div key={key} className={`rounded-2xl border p-4 text-center ${attended ? 'bg-glow/15 border-glow' : 'bg-white/5 border-white/10'}`}>
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">{day}</p>
              <p className="mt-3 text-xl font-semibold text-white">{attended ? '✓' : '-'}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
