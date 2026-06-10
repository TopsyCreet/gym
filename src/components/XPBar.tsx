import { motion } from 'framer-motion';
import { getXpProgress } from '../utils/xpCalculator';
import { TrendingUp } from 'lucide-react';

export default function XPBar({ xp }: { xp: number }) {
  const { level, progress, to } = getXpProgress(xp);
  const pct = Math.min(100, Math.round(progress * 100));

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.15)' }}
          >
            <TrendingUp size={18} style={{ color: '#D4AF37' }} />
          </div>
          <div>
            <p className="label">Progress</p>
            <p className="mt-0.5 text-xl font-black text-white">Level {level}</p>
          </div>
        </div>
        <span
          className="rounded-full px-3 py-1 text-xs font-bold"
          style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#D4AF37' }}
        >
          {pct}%
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full xp-shimmer"
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs" style={{ color: '#4A4A4A' }}>
          <span className="font-semibold" style={{ color: '#B3B3B3' }}>{xp.toLocaleString()}</span>
          {' '}/ {to.toLocaleString()} PP
        </p>
        <p className="text-xs" style={{ color: '#4A4A4A' }}>
          Next: <span className="font-semibold" style={{ color: '#B3B3B3' }}>Level {level + 1}</span>
        </p>
      </div>
    </div>
  );
}
