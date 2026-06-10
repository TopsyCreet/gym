import { useMemo, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useGymStore } from '../store/gymStore';
import { motion } from 'framer-motion';

export default function Admin() {
  const users = useAuthStore((state) => state.users);
  const getUser = useAuthStore((state) => state.getUser);
  const resetStreak = useAuthStore((state) => state.resetStreak);
  const awardXp = useAuthStore((state) => state.awardXp);
  const { atGymOverride, toggleAtGymOverride } = useGymStore();
  const user = getUser();
  const [secret, setSecret] = useState('');
  const [allowed, setAllowed] = useState(false);
  const [xpInput, setXpInput] = useState('100');
  const [awarded, setAwarded] = useState(false);

  const totalCheckInsToday = useMemo(
    () => users.filter((u) => u.lastCheckInDate === new Date().toISOString().slice(0, 10)).length,
    [users]
  );
  const activeStreaks = useMemo(() => users.filter((u) => u.streak >= 3).length, [users]);

  const handleUnlock = () => {
    if (secret === 'prime2024') setAllowed(true);
  };

  const handleAwardXp = () => {
    awardXp(Number(xpInput));
    setAwarded(true);
    setTimeout(() => setAwarded(false), 2000);
  };

  if (!allowed) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="card p-6 text-center">
            <div
              className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black text-surface"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #E5C158)' }}
            >
              ▲
            </div>
            <p className="label tracking-[0.25em]">Admin Access</p>
            <h1 className="mt-2 text-2xl font-black text-white">Enter passphrase</h1>
            <input
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              className="input-field mt-5"
              type="password"
              placeholder="••••••••"
            />
            <button type="button" onClick={handleUnlock} className="btn-primary mt-4 w-full">
              Unlock
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="card-elevated p-6">
        <p className="label tracking-[0.25em]">Admin Panel</p>
        <h1 className="mt-1 text-2xl font-black text-white">Prime Controls</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Members', value: users.length },
          { label: 'Commitments Today', value: totalCheckInsToday },
          { label: 'Active Streaks', value: activeStreaks },
        ].map((s) => (
          <div key={s.label} className="card p-5 text-center">
            <p className="text-3xl font-black text-white">{s.value}</p>
            <p className="label mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Location override */}
        <div className="card p-5">
          <p className="label tracking-[0.2em]">Location Override</p>
          <h2 className="mt-1 text-lg font-black text-white">Gym Verification</h2>
          <p className="mt-1 text-xs mb-4" style={{ color: '#3A3A3A' }}>
            {atGymOverride ? 'Currently: At gym' : 'Currently: Away from gym'}
          </p>
          <button
            type="button"
            onClick={toggleAtGymOverride}
            className="btn-primary w-full text-xs"
          >
            {atGymOverride ? 'Set Away' : 'Set At Gym'}
          </button>
        </div>

        {/* XP award */}
        <div className="card p-5">
          <p className="label tracking-[0.2em]">Award Points</p>
          <h2 className="mt-1 text-lg font-black text-white">Prime Points</h2>
          <p className="mt-1 text-xs mb-4" style={{ color: '#3A3A3A' }}>
            Award PP to {user?.name ?? 'logged-in user'}
          </p>
          <div className="flex gap-2">
            <input
              value={xpInput}
              onChange={(e) => setXpInput(e.target.value)}
              className="input-field text-sm"
              type="number"
              min="1"
            />
            <button type="button" onClick={handleAwardXp} className="btn-primary shrink-0 text-xs px-4">
              {awarded ? '✓' : 'Award'}
            </button>
          </div>
        </div>
      </div>

      {/* Streak reset */}
      <div className="card p-5">
        <p className="label tracking-[0.2em]">Streak Management</p>
        <p className="mt-1 text-sm text-white">
          Reset streak for <span style={{ color: '#D4AF37' }}>{user?.name ?? 'current user'}</span>
        </p>
        <button type="button" onClick={resetStreak} className="btn-secondary mt-4 text-xs">
          Reset Streak
        </button>
      </div>

      {/* User directory */}
      <div className="card p-5">
        <p className="label mb-4 tracking-[0.2em]">Member Directory</p>
        <div className="space-y-2">
          {users.map((member) => (
            <div
              key={member.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div>
                <p className="text-sm font-semibold text-white">{member.name}</p>
                <p className="text-xs" style={{ color: '#3A3A3A' }}>{member.email}</p>
              </div>
              <div className="flex gap-3 text-xs" style={{ color: '#4A4A4A' }}>
                <span>{member.streak}d streak</span>
                <span>{member.xp.toLocaleString()} PP</span>
                <span style={{ color: '#D4AF37' }}>{member.rankTitle}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
