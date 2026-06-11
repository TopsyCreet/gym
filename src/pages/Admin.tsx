import { useMemo, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useGymStore } from '../store/gymStore';
import { motion } from 'framer-motion';
import { Shield, Users, CheckCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import logoPng from '../assets/brand/logo.png';

export default function Admin() {
  const users           = useAuthStore((state) => state.users);
  const getUser         = useAuthStore((state) => state.getUser);
  const resetStreak     = useAuthStore((state) => state.resetStreak);
  const awardXp         = useAuthStore((state) => state.awardXp);
  const { atGymOverride, toggleAtGymOverride } = useGymStore();
  const user            = getUser();
  const [secret, setSecret]   = useState('');
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

  // ── Lock screen ─────────────────────────────────────────────────────────
  if (!allowed) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <div className="card p-7 text-center">
            <div className="relative mx-auto mb-5 h-12 w-12">
              <div className="absolute inset-0 rounded-xl opacity-30 blur-[14px]" style={{ background: '#D4AF37' }} />
              <img src={logoPng} alt="PRIME" className="relative h-12 w-12 object-contain" />
            </div>
            <p className="label tracking-[0.25em]">Admin Access</p>
            <h1 className="mt-2 text-2xl font-black text-white">Enter passphrase</h1>
            <p className="mt-1.5 text-xs" style={{ color: 'var(--text-faint)' }}>
              Restricted to Prime administrators.
            </p>
            <input
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              className="input-field mt-5"
              type="password"
              placeholder="••••••••"
              autoComplete="off"
            />
            <button type="button" onClick={handleUnlock} className="btn-primary mt-4 w-full">
              Unlock
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Admin panel ──────────────────────────────────────────────────────────
  const fade = (i: number) => ({
    initial:    { opacity: 0, y: 10 },
    animate:    { opacity: 1, y: 0 },
    transition: { delay: i * 0.07, duration: 0.36, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-5 sm:px-6 pb-24">

      {/* Header */}
      <motion.div {...fade(0)} className="px-1">
        <p className="label tracking-[0.25em]">Admin Panel</p>
        <h1 className="mt-0.5 text-display font-black leading-none text-white">Prime Controls</h1>
      </motion.div>

      {/* Stats bento */}
      <motion.div {...fade(1)} className="grid grid-cols-3 gap-3">
        {[
          { icon: Users,       label: 'Members',         value: users.length },
          { icon: CheckCircle, label: 'Check-ins Today', value: totalCheckInsToday },
          { icon: Shield,      label: 'Active Streaks',  value: activeStreaks },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="card p-4 text-center">
            <Icon size={14} style={{ color: 'var(--gold)', marginBottom: 6, marginInline: 'auto' }} />
            <p className="text-2xl font-black text-white tabular-nums">{value}</p>
            <p className="label mt-1" style={{ fontSize: '0.6rem' }}>{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Controls */}
      <motion.div {...fade(2)} className="grid gap-4 sm:grid-cols-2">

        {/* Location override */}
        <div className="card p-5">
          <p className="label tracking-[0.2em]">Location Override</p>
          <h2 className="mt-1 text-lg font-black text-white">Gym Verification</h2>
          <div className="mt-2 flex items-center gap-2">
            {atGymOverride
              ? <ToggleRight size={14} style={{ color: 'var(--success)' }} />
              : <ToggleLeft  size={14} style={{ color: 'var(--text-faint)' }} />}
            <p className="text-xs font-semibold" style={{ color: atGymOverride ? 'var(--success)' : 'var(--text-secondary)' }}>
              {atGymOverride ? 'At gym (overridden)' : 'Away from gym'}
            </p>
          </div>
          <button type="button" onClick={toggleAtGymOverride} className="btn-primary mt-4 w-full text-xs">
            {atGymOverride ? 'Set Away' : 'Set At Gym'}
          </button>
        </div>

        {/* Award XP */}
        <div className="card p-5">
          <p className="label tracking-[0.2em]">Award Points</p>
          <h2 className="mt-1 text-lg font-black text-white">Prime Points</h2>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            Award PP to <span style={{ color: 'var(--gold)' }}>{user?.name ?? 'logged-in user'}</span>
          </p>
          <div className="mt-4 flex gap-2">
            <input
              value={xpInput}
              onChange={(e) => setXpInput(e.target.value)}
              className="input-field text-sm"
              type="number"
              min="1"
            />
            <button type="button" onClick={handleAwardXp} className="btn-primary shrink-0 px-4 text-xs">
              {awarded ? '✓' : 'Award'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Streak reset */}
      <motion.div {...fade(3)} className="card p-5">
        <p className="label tracking-[0.2em]">Streak Management</p>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Reset streak for <span style={{ color: 'var(--gold)' }}>{user?.name ?? 'current user'}</span>
        </p>
        <button type="button" onClick={resetStreak} className="btn-secondary mt-4 text-xs">
          Reset Streak
        </button>
      </motion.div>

      {/* Member directory */}
      <motion.div {...fade(4)} className="card p-5">
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
                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{member.email}</p>
              </div>
              <div className="flex gap-3 text-xs">
                <span style={{ color: 'var(--text-secondary)' }}>{member.streak}d streak</span>
                <span style={{ color: 'var(--text-secondary)' }}>{member.xp.toLocaleString()} PP</span>
                <span style={{ color: 'var(--gold)' }}>{member.rankTitle}</span>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <p className="text-center text-sm py-4" style={{ color: 'var(--text-faint)' }}>No members yet.</p>
          )}
        </div>
      </motion.div>

    </div>
  );
}
