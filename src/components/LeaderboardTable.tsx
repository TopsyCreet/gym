import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { TrendingUp, BarChart2, Target } from 'lucide-react';

const tabs = [
  { key: 'streak',     label: 'Streak',   icon: TrendingUp, color: '#D4AF37' },
  { key: 'xp',         label: 'Points',   icon: BarChart2,  color: '#B3B3B3' },
  { key: 'challenges', label: 'Trials',   icon: Target,     color: '#2ECC71' },
] as const;

type Tab = typeof tabs[number]['key'];

const topThreeStyle: Record<number, { bg: string; text: string; border: string }> = {
  0: { bg: 'rgba(212,175,55,0.14)', text: '#D4AF37', border: 'rgba(212,175,55,0.3)' },
  1: { bg: 'rgba(179,179,179,0.1)',  text: '#B3B3B3', border: 'rgba(179,179,179,0.25)' },
  2: { bg: 'rgba(205,133,63,0.1)',   text: '#CD853F', border: 'rgba(205,133,63,0.25)' },
};

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

const avatarSeed = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 25%, 20%)`;
};

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
          <p className="label tracking-[0.25em]">Global Standing</p>
          <h2 className="mt-1 text-xl font-black text-white">The Ranks</h2>
        </div>
        {/* Tab switcher */}
        <div
          className="flex gap-1 rounded-xl p-1"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`relative flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150 ${
                tab === t.key ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              {tab === t.key && (
                <motion.span
                  layoutId="tab-bg"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: `${t.color}14`, border: `1px solid ${t.color}25` }}
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
      <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
        {sorted.slice(0, 10).map((user, index) => {
          const isMe = user.id === currentUser?.id;
          const podium = topThreeStyle[index];
          const score = tab === 'streak'
            ? `${user.streak}d`
            : tab === 'xp'
            ? `${user.xp.toLocaleString()} PP`
            : `${user.challengesCompleted}`;

          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              className="flex items-center gap-4 px-5 py-3.5 transition-colors duration-150"
              style={{
                background: isMe ? 'rgba(212,175,55,0.04)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!isMe) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
              }}
              onMouseLeave={(e) => {
                if (!isMe) (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              {/* Rank number */}
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black"
                style={
                  podium
                    ? { background: podium.bg, color: podium.text, border: `1px solid ${podium.border}` }
                    : { background: 'rgba(255,255,255,0.03)', color: '#3A3A3A', border: '1px solid rgba(255,255,255,0.05)' }
                }
              >
                {index + 1}
              </div>

              {/* Avatar */}
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: avatarSeed(user.name), border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {getInitials(user.name)}
              </div>

              {/* Name */}
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-semibold ${isMe ? 'text-white' : 'text-zinc-300'}`}>
                  {user.name}
                  {isMe && (
                    <span
                      className="ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                      style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37' }}
                    >
                      You
                    </span>
                  )}
                </p>
                <p className="label mt-0.5">{user.rankTitle}</p>
              </div>

              {/* Score */}
              <span
                className="shrink-0 rounded-full px-3 py-1 text-xs font-black"
                style={{
                  background: `${activeTab.color}10`,
                  color: activeTab.color,
                  border: `1px solid ${activeTab.color}22`,
                }}
              >
                {score}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Current user rank if outside top 10 */}
      {currentUser && myRank >= 10 && (
        <div
          className="px-5 py-3"
          style={{ borderTop: '1px solid rgba(212,175,55,0.08)', background: 'rgba(212,175,55,0.03)' }}
        >
          <p className="text-xs" style={{ color: '#4A4A4A' }}>
            Your standing: <span className="font-bold text-white">#{myRank + 1}</span>
            {' — '}
            {tab === 'streak'
              ? `${currentUser.streak}d streak`
              : tab === 'xp'
              ? `${currentUser.xp.toLocaleString()} PP`
              : `${currentUser.challengesCompleted} trials`}
          </p>
        </div>
      )}
    </div>
  );
}
