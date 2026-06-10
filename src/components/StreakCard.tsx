import { motion } from 'framer-motion';

const getStreakStyle = (streak: number) => {
  if (streak >= 30) return {
    color: '#D4AF37',
    shadow: '0 0 40px rgba(212,175,55,0.4), 0 0 80px rgba(212,175,55,0.15)',
    label: 'Monarch Tier',
    sublabel: 'You are the standard others chase.',
  };
  if (streak >= 14) return {
    color: '#E5C158',
    shadow: '0 0 32px rgba(229,193,88,0.35)',
    label: 'Prime Tier',
    sublabel: 'Peak discipline. Keep going.',
  };
  if (streak >= 7) return {
    color: '#4A90D9',
    shadow: '0 0 28px rgba(74,144,217,0.35)',
    label: 'Vanguard Tier',
    sublabel: 'You lead by example.',
  };
  if (streak >= 3) return {
    color: '#CD853F',
    shadow: '0 0 22px rgba(205,133,63,0.3)',
    label: 'Forged',
    sublabel: 'Consistency becomes identity.',
  };
  return {
    color: '#3A3A3A',
    shadow: 'none',
    label: 'Begin',
    sublabel: 'The path starts with one day.',
  };
};

export default function StreakCard({ streak }: { streak: number }) {
  const style = getStreakStyle(streak);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card-elevated p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="label">Commitment Streak</p>
          <div className="mt-3 flex items-end gap-2">
            <motion.p
              key={streak}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="text-6xl font-black tracking-tight text-white leading-none"
            >
              {streak}
            </motion.p>
            <span className="mb-1.5 text-base font-semibold" style={{ color: '#3A3A3A' }}>days</span>
          </div>
          <p className="mt-2 text-sm font-bold tracking-wide uppercase" style={{ color: style.color }}>{style.label}</p>
          <p className="mt-1 text-xs" style={{ color: '#4A4A4A' }}>{style.sublabel}</p>
        </div>

        <motion.div
          animate={{ scale: streak > 0 ? [1, 1.06, 1] : 1 }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
          style={{
            background: streak > 0 ? `${style.color}15` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${style.color}30`,
            boxShadow: streak > 0 ? style.shadow : 'none',
          }}
        >
          <span className="text-2xl font-black" style={{ color: style.color }}>
            {streak >= 30 ? '◆' : streak >= 14 ? '▲' : streak >= 7 ? '▸' : streak >= 3 ? '◇' : '○'}
          </span>
        </motion.div>
      </div>

      <div className="mt-5 h-1 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, (streak / 30) * 100)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${style.color}80, ${style.color})` }}
        />
      </div>
      <p className="mt-2 text-xs" style={{ color: '#3A3A3A' }}>{streak}/30 days to Monarch tier</p>
    </motion.div>
  );
}
