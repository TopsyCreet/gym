import { motion } from 'framer-motion';
import { getRankByTitle } from '../data/ranks';

export default function RankBadge({ title }: { title: string }) {
  const rank = getRankByTitle(title);
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-surface2 px-4 py-2 shadow-soft"
    >
      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: rank.color }} />
      <div>
        <p className="text-sm text-zinc-400">Rank</p>
        <p className="font-semibold text-white">{rank.title}</p>
      </div>
    </motion.div>
  );
}
