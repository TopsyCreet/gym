import { motion } from 'framer-motion';
import { getRankByTitle } from '../data/ranks';

export default function RankBadge({ title }: { title: string }) {
  const rank = getRankByTitle(title);
  const hex = rank.color;

  return (
    <motion.div
      initial={{ scale: 0.88, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      className="inline-flex items-center gap-2 rounded-full px-4 py-2"
      style={{
        background: `${hex}18`,
        border: `1px solid ${hex}38`,
        boxShadow: `0 0 18px ${hex}22`,
      }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: hex, boxShadow: `0 0 6px ${hex}` }}
      />
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: `${hex}99` }}>
          Rank
        </p>
        <p className="text-sm font-bold leading-none text-white">{rank.title}</p>
      </div>
    </motion.div>
  );
}
