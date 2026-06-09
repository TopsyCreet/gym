import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { daysOfWeek } from '../utils/streakCalculator';
import { Check, X, Minus } from 'lucide-react';

export default function AttendanceCalendar() {
  const user = useAuthStore((state) => state.getUser());
  const today = new Date();

  const days = useMemo(() => {
    const items = [];
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      const dayName = daysOfWeek[date.getDay()];
      const isToday = i === 0;
      const attended = user?.attendanceHistory[key] ?? false;
      const scheduled = user?.schedule.includes(dayName) ?? false;
      items.push({ key, date, dayName, isToday, attended, scheduled });
    }
    return items;
  }, [today, user]);

  const attendedCount = days.filter((d) => d.attended).length;
  const scheduledCount = days.filter((d) => d.scheduled).length;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="label">Attendance</p>
          <h2 className="mt-1 text-xl font-black text-white">This Week</h2>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-center">
          <p className="text-2xl font-black text-white">{attendedCount}<span className="text-base text-zinc-500">/{scheduledCount}</span></p>
          <p className="label mt-0.5">Sessions</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2">
        {days.map(({ key, dayName, isToday, attended, scheduled }, i) => {
          let bg = 'rgba(255,255,255,0.03)';
          let border = 'rgba(255,255,255,0.06)';
          let iconColor = '#3f3f46';

          if (attended && scheduled) {
            bg = 'rgba(16,185,129,0.12)';
            border = 'rgba(16,185,129,0.4)';
            iconColor = '#10B981';
          } else if (attended && !scheduled) {
            bg = 'rgba(91,142,240,0.10)';
            border = 'rgba(91,142,240,0.35)';
            iconColor = '#5B8EF0';
          } else if (!attended && scheduled) {
            bg = 'rgba(239,68,68,0.07)';
            border = 'rgba(239,68,68,0.22)';
            iconColor = '#EF4444';
          }

          if (isToday) {
            border = attended ? border : 'rgba(91,142,240,0.5)';
          }

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center gap-2 rounded-xl p-3"
              style={{ background: bg, border: `1px solid ${border}` }}
            >
              <p className="label text-center leading-none">{dayName.slice(0, 1)}</p>
              <div className="flex h-5 w-5 items-center justify-center">
                {attended ? (
                  <Check size={14} style={{ color: iconColor }} strokeWidth={2.5} />
                ) : scheduled ? (
                  <X size={12} style={{ color: iconColor }} strokeWidth={2.5} />
                ) : (
                  <Minus size={12} style={{ color: iconColor }} strokeWidth={2} />
                )}
              </div>
              {isToday && (
                <div className="h-1 w-1 rounded-full bg-glow" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4">
        {[
          { color: '#10B981', label: 'Attended' },
          { color: '#EF4444', label: 'Missed' },
          { color: '#5B8EF0', label: 'Bonus' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ background: l.color }} />
            <span className="text-[11px] text-zinc-600">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
