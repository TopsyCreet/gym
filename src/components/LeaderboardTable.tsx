import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { Flame, Zap, Trophy } from 'lucide-react';

const tabs = [
  { key: 'streak',     label: 'Streak',     icon: Flame,  color: '#EF4444' },
  { key: 'xp',         label: 'XP',         icon: Zap,    color: '#5B8EF0' },
  { key: 'challenges', label: 'Challenges', icon: Trophy, color: '#F59E0B' },
] as const;

type Tab = typeof tabs[number]['key'];

const medalStyle: Record<number, { bg: string; text: string; border: string }> = {
  0: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B', border: 'rgba(245,158,11,0.35)' },
  1: { bg: 'rgba(156,163,175,0.15)', text: '#9CA3AF', border: 'rgba(156,163,175,0.35)' },
  2: { bg: 'rgba(180,83,9,0.15)', text: '#B45309', border: 'rgba(180,83,9,0.35)' },
};

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

const avatarColors = [
  '#5B8EF0', '#EF4444', '#10B981', '#8B5CF6', '#F59E0B',
  '#06B6D4', '#EC4899', '#14B8A6', '#F97316', '#6366F1',
];
const getAvatarColor = (name: string) =>
  avatarColors[name.charCodeAt(0) % avatarColors.length];

export default function LeaderboardTable() {
  const users = useAuthStore((state) => state.users);
  const currentUser = useAuthStore((state) => state.getUser());
  const [tab, setTab] = useState<Tab>('streak');

  const sorted = useMemo(() => {
    const list = [...users];
    if (tab === 'streak') return list.sort((a, b) => b.streak - a.streak);
    if (tab === 'xp') return list.sort((a, b) => b.xp - a.xp);
    return list.sort((a, b) => b.challengesCompleted - a.challengesCompleted);
  }, [tab, users]);

  const activeTab = tabs.find((t) => t.key === tab)!;
  const myRank = sorted.findIndex((u) => u.id === currentUser?.id);

  return (
    <div className="card p-0 overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 pb-4">
        <div>
          <p className="label">Rankings</p>
          <h2 className="mt-1 text-xl font-black text-white">Dark Dungeon Arena</h2>
        </div>
        {/* Tab switcher */}
        <div className="flex gap-1.5 rounded-xl border border-white/[0.06] bg-black/20 p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`relative flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150 ${
                tab === t.key ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab === t.key && (
                <motion.span
                  layoutId="tab-bg"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: `${t.color}22`, border: `1px solid ${t.color}33` }}
                  transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                />
              )}
              <t.icon size={12} style={{ color: tab === t.key ? t.color : undefined }} />
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="divider" />

      {/* Rows */}
      <div className="divide-y divide-white/[0.04]">
        {sorted.slice(0, 10).map((user, index) => {
          const isMe = user.id === currentUser?.id;
          const medal = medalStyle[index];
          const score = tab === 'streak'
            ? `${user.streak}d`
            : tab === 'xp'
            ? `${user.xp.toLocaleString()} XP`
            : `${user.challengesCompleted}`;

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              className={`flex items-center gap-4 px-5 py-3.5 transition-colors duration-150 ${
                isMe ? 'bg-glow/[0.06]' : 'hover:bg-white/[0.025]'
              }`}
            >
              {/* Rank badge */}
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black"
                style={
                  medal
                    ? { background: medal.bg, color: medal.text, border: `1px solid ${medal.border}` }
                    : { background: 'rgba(255,255,255,0.04)', color: '#71717a', border: '1px solid rgba(255,255,255,0.07)' }
                }
              >
                {index < 3 ? ['1', '2', '3'][index] : `${index + 1}`}
              </div>

              {/* Avatar */}
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: getAvatarColor(user.name) }}
              >
                {getInitials(user.name)}
              </div>

              {/* Name */}
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-semibold ${isMe ? 'text-white' : 'text-zinc-200'}`}>
                  {user.name}
                  {isMe && (
                    <span className="ml-2 rounded-full bg-glow/15 px-1.5 py-0.5 text-[10px] font-bold text-glow">You</span>
                  )}
                </p>
                <p className="label mt-0.5">{user.rankTitle}</p>
              </div>

              {/* Score */}
              <span
                className="shrink-0 rounded-full px-3 py-1 text-xs font-black"
                style={{ background: `${activeTab.color}14`, color: activeTab.color, border: `1px solid ${activeTab.color}28` }}
              >
                {score}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Current user rank if outside top 10 */}
      {currentUser && myRank >= 10 && (
        <div className="border-t border-white/[0.06] bg-glow/[0.04] px-5 py-3">
          <p className="text-xs text-zinc-400">
            Your rank: <span className="font-bold text-white">#{myRank + 1}</span>
            {' — '}
            {tab === 'streak'
              ? `${currentUser.streak}d streak`
              : tab === 'xp'
              ? `${currentUser.xp.toLocaleString()} XP`
              : `${currentUser.challengesCompleted} challenges`}
          </p>
        </div>
      )}
    </div>
  );
}
