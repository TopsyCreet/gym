import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { challenges } from '../data/challenges';

export default function ChallengeCard({ id, completed }: { id: number; completed: boolean }) {
  const completeChallenge = useAuthStore((state) => state.completeChallenge);
  const challenge = challenges.find((item) => item.id === id);
  if (!challenge) return null;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`group rounded-3xl border border-white/10 bg-surface2 p-5 shadow-soft transition ${completed ? 'opacity-80' : 'hover:border-glow/60'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">{challenge.category}</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{challenge.name}</h3>
        </div>
        <div className="rounded-2xl bg-glow/10 px-3 py-2 text-sm font-semibold text-glow">+{challenge.xp} XP</div>
      </div>
      <p className="mt-4 text-sm text-zinc-300">Complete to earn XP and climb the leaderboard.</p>
      <button
        type="button"
        disabled={completed}
        onClick={() => completeChallenge(challenge.id, challenge.xp)}
        className={`mt-5 w-full rounded-full px-4 py-3 text-sm font-semibold transition ${completed ? 'cursor-not-allowed bg-zinc-700/50 text-zinc-300' : 'bg-glow text-surface hover:scale-[1.01]'}`}
      >
        {completed ? 'Completed' : 'Mark Complete'}
      </button>
      {completed && (
        <div className="mt-4 flex items-center gap-2 text-emerald-300">
          <CheckCircle2 size={18} /> Completed
        </div>
      )}
    </motion.div>
  );
}
