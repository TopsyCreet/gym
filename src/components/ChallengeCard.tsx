import { motion } from 'framer-motion';
import { CheckCircle2, Play, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useGymStore } from '../store/gymStore';
import { challenges } from '../data/challenges';

export default function ChallengeCard({ id, completed, startedAt }: { id: number; completed: boolean; startedAt?: string }) {
  const startChallenge = useAuthStore((state) => state.startChallenge);
  const completeChallenge = useAuthStore((state) => state.completeChallenge);
  const isAtGym = useGymStore((state) => state.isAtGym);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  
  const challenge = challenges.find((item) => item.id === id);
  if (!challenge) return null;

  const isStarted = !!startedAt;

  // Calculate remaining time
  useEffect(() => {
    if (!isStarted) {
      setTimeRemaining(null);
      return;
    }

    const updateTimer = () => {
      const startTime = new Date(startedAt).getTime();
      const requiredMs = challenge.minDurationMinutes * 60 * 1000;
      const elapsedMs = Date.now() - startTime;
      const remaining = Math.max(0, requiredMs - elapsedMs);

      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100);
    return () => clearInterval(interval);
  }, [isStarted, startedAt, challenge.minDurationMinutes]);

  const canComplete = isStarted && timeRemaining !== null && timeRemaining <= 0;

  const handleStart = () => {
    startChallenge(id);
  };

  const handleComplete = async () => {
    setIsVerifying(true);
    setVerifyError(null);
    try {
      const atGym = await isAtGym();
      if (!atGym) {
        setVerifyError('You must be at the gym to complete this challenge.');
        setIsVerifying(false);
        return;
      }
      completeChallenge(id, challenge.xp);
    } catch (error) {
      setVerifyError('Location verification failed.');
      setIsVerifying(false);
    }
  };

  const formatTimeRemaining = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      whileHover={{ y: !completed ? -4 : 0 }}
      className={`group rounded-3xl border border-white/10 bg-surface2 p-5 shadow-soft transition ${completed ? 'opacity-80' : isStarted ? 'border-glow/40 bg-surface2' : 'hover:border-glow/60'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">{challenge.category}</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{challenge.name}</h3>
        </div>
        <div className="rounded-2xl bg-glow/10 px-3 py-2 text-sm font-semibold text-glow">+{challenge.xp} XP</div>
      </div>
      <p className="mt-4 text-sm text-zinc-300">
        {isStarted && !completed
          ? `Work out for ${challenge.minDurationMinutes} minutes before marking complete.`
          : 'Complete to earn XP and climb the leaderboard.'}
      </p>

      {/* Timer Display */}
      {isStarted && !completed && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-glow/30 bg-glow/10 px-4 py-3">
          <div className="text-right flex-1">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Time remaining</p>
            <p className={`text-2xl font-bold font-mono ${canComplete ? 'text-emerald-400' : 'text-glow'}`}>
              {timeRemaining !== null ? formatTimeRemaining(timeRemaining) : 'calculating...'}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {verifyError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-2 rounded-2xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300"
        >
          <AlertCircle size={16} />
          {verifyError}
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="mt-5 flex gap-3">
        {!completed && !isStarted && (
          <button
            type="button"
            onClick={handleStart}
            className="w-full rounded-full bg-glow px-4 py-3 text-sm font-semibold text-surface hover:scale-[1.01] transition"
          >
            <div className="flex items-center justify-center gap-2">
              <Play size={16} />
              Start Workout
            </div>
          </button>
        )}

        {isStarted && !completed && (
          <button
            type="button"
            disabled={!canComplete || isVerifying}
            onClick={handleComplete}
            className={`w-full rounded-full px-4 py-3 text-sm font-semibold transition ${
              canComplete && !isVerifying
                ? 'bg-emerald-500 text-white hover:scale-[1.01]'
                : 'bg-zinc-700/50 text-zinc-400 cursor-not-allowed'
            }`}
          >
            {isVerifying ? 'Verifying location...' : 'Mark Complete'}
          </button>
        )}
      </div>

      {completed && (
        <div className="mt-4 flex items-center gap-2 text-emerald-300">
          <CheckCircle2 size={18} /> Completed
        </div>
      )}
    </motion.div>
  );
}
