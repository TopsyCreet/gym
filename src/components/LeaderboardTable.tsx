import { useMemo, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { gyms } from '../data/gyms';

type LeaderboardTableProps = {
  scope?: 'global' | 'gym';
  gymId?: string | null;
};

export default function LeaderboardTable({ scope = 'global', gymId }: LeaderboardTableProps) {
  const users = useAuthStore((state) => state.users);
  const currentUser = useAuthStore((state) => state.getUser());
  const [tab, setTab] = useState<'streak' | 'xp' | 'challenges'>('streak');

  const gymMap = useMemo(() => Object.fromEntries(gyms.map((gym) => [gym.id, gym])), []);

  const sorted = useMemo(() => {
    const list = scope === 'gym' && gymId ? users.filter((user) => user.gymId === gymId) : users;
    const sortedList = [...list];
    if (tab === 'streak') return sortedList.sort((a, b) => b.streak - a.streak);
    if (tab === 'xp') return sortedList.sort((a, b) => b.xp - a.xp);
    return sortedList.sort((a, b) => b.challengesCompleted - a.challengesCompleted);
  }, [tab, users, scope, gymId]);

  return (
    <div className="rounded-3xl border border-white/10 bg-surface2 p-5 shadow-soft">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">Leaderboard</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Rivals in the Dark Dungeon</h2>
        </div>
        <div className="flex gap-2">
          {['streak', 'xp', 'challenges'].map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => setTab(option as 'streak' | 'xp' | 'challenges')}
              className={`rounded-full px-4 py-2 text-sm transition ${tab === option ? 'bg-glow text-surface' : 'bg-white/5 text-zinc-300 hover:bg-white/10'}`}
            >
              {option === 'streak' ? 'Streak' : option === 'xp' ? 'XP' : 'Challenges'}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-zinc-300">
          <thead>
            <tr className="border-b border-white/10 text-zinc-500">
              <th className="py-3 pr-6">Rank</th>
              <th className="py-3 pr-6">Name</th>
              {scope === 'global' && <th className="py-3 pr-6">Gym</th>}
              <th className="py-3 pr-6">Score</th>
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 10).map((user, index) => (
              <tr key={user.id} className={`transition ${currentUser?.id === user.id ? 'bg-glow/10 text-white' : 'hover:bg-white/5'}`}>
                <td className="py-4 pr-6 font-semibold">{index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}</td>
                <td className="py-4 pr-6">{user.name}</td>
                {scope === 'global' && (
                  <td className="py-4 pr-6 text-zinc-400">{gymMap[user.gymId]?.name ?? 'Independent'}</td>
                )}
                <td className="py-4 pr-6 font-semibold text-white">
                  {tab === 'streak' ? `${user.streak}d` : tab === 'xp' ? `${user.xp} XP` : `${user.challengesCompleted}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {currentUser && !sorted.slice(0, 10).some((item) => item.id === currentUser.id) && (
        <div className="mt-5 rounded-3xl bg-white/5 p-4 text-sm text-zinc-100">
          Your rank: #{sorted.findIndex((item) => item.id === currentUser.id) + 1} — {tab === 'streak' ? `${currentUser.streak}d` : tab === 'xp' ? `${currentUser.xp} XP` : `${currentUser.challengesCompleted}`}.
        </div>
      )}
    </div>
  );
}
