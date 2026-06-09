import { motion } from 'framer-motion';
import { getXpProgress } from '../utils/xpCalculator';
import { Zap } from 'lucide-react';

export default function XPBar({ xp }: { xp: number }) {
  const { level, progress, from, to } = getXpProgress(xp);
  const pct = Math.min(100, Math.round(progress * 100));

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-glow/10">
            <Zap size={18} className="text-glow" />
          </div>
          <div>
            <p className="label">XP Progress</p>
            <p className="mt-0.5 text-xl font-black text-white">Level {level}</p>
          </div>
        </div>
        <span
          className="rounded-full px-3 py-1 text-xs font-bold text-glow"
          style={{ background: 'rgba(91,142,240,0.12)', border: '1px solid rgba(91,142,240,0.22)' }}
        >
          {pct}%
        </span>
      </div>

      {/* Segmented progress bar */}
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/[0.05]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full xp-shimmer"
        />
      </div>

      {/* Level dots */}
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-zinc-600">
          <span className="text-zinc-400 font-semibold">{xp.toLocaleString()}</span> / {to.toLocaleString()} XP
        </p>
        <p className="text-xs text-zinc-600">
          Next: <span className="text-zinc-400 font-semibold">Level {level + 1}</span>
        </p>
      </div>
    </div>
  );
}
