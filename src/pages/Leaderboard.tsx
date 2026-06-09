import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import LeaderboardTable from '../components/LeaderboardTable';

export default function Leaderboard() {
  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card relative overflow-hidden p-8"
        style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.07) 0%, rgba(91,142,240,0.05) 100%)' }}
      >
        <div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.06]">
          <Trophy size={120} />
        </div>
        <span className="badge badge-gold mb-4">The Arena</span>
        <h1 className="text-4xl font-black text-white">Global Leaderboard</h1>
        <p className="mt-2 max-w-sm text-sm text-zinc-400">
          Compete with your dungeon crew. Rankings reset monthly — stay consistent to hold your throne.
        </p>
      </motion.div>

      <LeaderboardTable />
    </div>
  );
}
