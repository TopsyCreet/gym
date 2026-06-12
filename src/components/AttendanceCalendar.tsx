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
          <p className="label">Commitment Record</p>
          <h2 className="mt-1 text-xl font-black text-white">This Week</h2>
        </div>
        <div
          className="rounded-xl px-3 py-2 text-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-2xl font-black text-white">
            {attendedCount}
            <span className="text-base font-semibold" style={{ color: '#3A3A3A' }}>/{scheduledCount}</span>
          </p>
          <p className="label mt-0.5">Days</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2">
        {days.map(({ key, dayName, isToday, attended, scheduled }, i) => {
          let bg = 'rgba(255,255,255,0.02)';
          let border = 'rgba(255,255,255,0.05)';
          let iconColor = '#2A2A2A';

          if (attended && scheduled) {
            bg = 'rgba(212,160,23,0.08)';
            border = 'rgba(212,160,23,0.25)';
            iconColor = '#D4A017';
          } else if (attended && !scheduled) {
            bg = 'rgba(212,175,55,0.07)';
            border = 'rgba(212,175,55,0.2)';
            iconColor = '#D4AF37';
          } else if (!attended && scheduled) {
            bg = 'rgba(231,76,60,0.06)';
            border = 'rgba(231,76,60,0.18)';
            iconColor = '#E74C3C';
          }

          if (isToday && !attended) {
            border = 'rgba(212,175,55,0.35)';
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
                  <Check size={13} style={{ color: iconColor }} strokeWidth={2.5} />
                ) : scheduled ? (
                  <X size={11} style={{ color: iconColor }} strokeWidth={2.5} />
                ) : (
                  <Minus size={11} style={{ color: iconColor }} strokeWidth={2} />
                )}
              </div>
              {isToday && (
                <div className="h-1 w-1 rounded-full" style={{ background: '#D4AF37' }} />
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        {[
          { color: '#D4A017', label: 'Proved' },
          { color: '#E74C3C', label: 'Missed' },
          { color: '#D4AF37', label: 'Bonus' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full" style={{ background: l.color }} />
            <span className="text-[11px]" style={{ color: '#3A3A3A' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
