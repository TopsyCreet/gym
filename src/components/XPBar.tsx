import { motion } from 'framer-motion';
import { getXpProgress } from '../utils/xpCalculator';

export default function XPBar({ xp }: { xp: number }) {
  const { level, progress, from, to } = getXpProgress(xp);
  return (
    <div className="rounded-3xl border border-white/10 bg-surface2 p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">XP Progress</p>
          <p className="mt-2 text-2xl font-semibold text-white">Level {level}</p>
        </div>
        <span className="rounded-full bg-white/5 px-3 py-2 text-sm text-zinc-200">{Math.round(progress * 100)}%</span>
      </div>
      <div className="mt-5 h-4 overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, progress * 100)}%` }}
          transition={{ duration: 0.8 }}
          className="h-full rounded-full bg-gradient-to-r from-glow to-ember"
        />
      </div>
      <p className="mt-3 text-sm text-zinc-400">{xp} XP / {to} XP</p>
    </div>
  );
}
