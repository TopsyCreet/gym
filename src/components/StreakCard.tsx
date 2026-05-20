import { motion } from 'framer-motion';

const flame = (streak: number) => {
  if (streak >= 30) return '🔥🔥🔥';
  if (streak >= 14) return '🔥🔥';
  if (streak >= 7) return '🔥';
  if (streak > 0) return '✨';
  return '❄️';
};

export default function StreakCard({ streak }: { streak: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-3xl border border-white/10 bg-surface2 p-5 shadow-soft"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">Current Streak</p>
          <p className="mt-2 text-4xl font-semibold text-white">{streak} days</p>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-glow to-ember px-4 py-3 text-2xl shadow-glow">{flame(streak)}</div>
      </div>
      <p className="mt-4 text-sm text-zinc-300">Keep your routine strong with every scheduled session.</p>
    </motion.div>
  );
}
