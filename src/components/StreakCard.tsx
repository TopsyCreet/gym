import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

const getStreakStyle = (streak: number) => {
  if (streak >= 30) return {
    from: '#EF4444', to: '#F97316',
    shadow: '0 0 40px rgba(239,68,68,0.5), 0 0 80px rgba(239,68,68,0.2)',
    label: 'On Fire',
    textColor: '#EF4444',
  };
  if (streak >= 14) return {
    from: '#F97316', to: '#F59E0B',
    shadow: '0 0 35px rgba(249,115,22,0.45)',
    label: 'Blazing',
    textColor: '#F97316',
  };
  if (streak >= 7) return {
    from: '#F59E0B', to: '#FBBF24',
    shadow: '0 0 30px rgba(245,158,11,0.4)',
    label: 'Heating Up',
    textColor: '#F59E0B',
  };
  if (streak >= 3) return {
    from: '#5B8EF0', to: '#8B5CF6',
    shadow: '0 0 25px rgba(91,142,240,0.35)',
    label: 'Building',
    textColor: '#5B8EF0',
  };
  return {
    from: '#374151', to: '#4B5563',
    shadow: 'none',
    label: 'Start Today',
    textColor: '#9CA3AF',
  };
};

export default function StreakCard({ streak }: { streak: number }) {
  const style = getStreakStyle(streak);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="label">Current Streak</p>
          <p className="mt-2 text-5xl font-black tracking-tight text-white leading-none">
            {streak}
            <span className="ml-1.5 text-xl font-semibold text-zinc-500">days</span>
          </p>
          <p className="mt-2 text-xs font-semibold" style={{ color: style.textColor }}>{style.label}</p>
        </div>
        <motion.div
          animate={{ scale: streak > 0 ? [1, 1.08, 1] : 1 }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${style.from}, ${style.to})`,
            boxShadow: style.shadow,
          }}
        >
          <Flame size={26} className="text-white" />
        </motion.div>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, (streak / 30) * 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${style.from}, ${style.to})` }}
        />
      </div>
      <p className="mt-2 text-xs text-zinc-600">{streak}/30 days to max fire</p>
    </motion.div>
  );
}
