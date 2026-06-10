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
      className="inline-flex items-center gap-2.5 rounded-full px-4 py-2"
      style={{
        background: `${hex}12`,
        border: `1px solid ${hex}30`,
        boxShadow: `0 0 20px ${hex}18`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: hex, boxShadow: `0 0 8px ${hex}` }}
      />
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.22em]" style={{ color: `${hex}80` }}>
          Rank
        </p>
        <p className="text-sm font-black leading-none tracking-wide text-white uppercase">{rank.title}</p>
      </div>
    </motion.div>
  );
}
