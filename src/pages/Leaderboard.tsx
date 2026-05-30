import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import LeaderboardTable from '../components/LeaderboardTable';

export default function Leaderboard() {
  const currentUser = useAuthStore((state) => state.getUser());
  const [scope, setScope] = useState<'global' | 'gym'>('global');

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-surface2 p-8 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-amber-300">The arena</p>
            <h1 className="mt-4 text-4xl font-bold text-white">{scope === 'global' ? 'Global leaderboard' : 'Gym leaderboard'}</h1>
            <p className="mt-3 text-zinc-300">Watch your rank climb as you earn streaks, XP, and challenge completions.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setScope('global')}
              className={`rounded-full px-5 py-3 text-sm transition ${scope === 'global' ? 'bg-glow text-surface' : 'bg-white/5 text-zinc-300 hover:bg-white/10'}`}
            >
              Global
            </button>
            <button
              type="button"
              onClick={() => setScope('gym')}
              className={`rounded-full px-5 py-3 text-sm transition ${scope === 'gym' ? 'bg-glow text-surface' : 'bg-white/5 text-zinc-300 hover:bg-white/10'}`}
            >
              Gym
            </button>
          </div>
        </div>
      </section>
      {scope === 'gym' && !currentUser?.gymId ? (
        <div className="rounded-3xl border border-white/10 bg-surface2 p-8 text-zinc-300">
          You are not currently associated with a gym. Sign up with a referral code to view gym leaderboards.
        </div>
      ) : (
        <LeaderboardTable scope={scope} gymId={currentUser?.gymId} />
      )}
    </div>
  );
}
