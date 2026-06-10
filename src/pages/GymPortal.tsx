import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { gyms, findGymByCode } from '../data/gyms';
import { TrendingUp, Users, CheckCircle, Target, ArrowUpRight } from 'lucide-react';

export default function GymPortal() {
  const users = useAuthStore((state) => state.users);
  const [code, setCode] = useState('');
  const [gym, setGym] = useState<(typeof gyms)[0] | null>(null);
  const [error, setError] = useState('');

  const handleUnlock = () => {
    const found = findGymByCode(code);
    if (found) {
      setGym(found);
      setError('');
    } else {
      setError('Invalid gym code. Contact your PRIME representative.');
    }
  };

  const members = useMemo(
    () => (gym ? users.filter((u) => u.gymId === gym.id) : []),
    [gym, users]
  );

  const stats = useMemo(() => {
    if (!members.length) return { total: 0, avgStreak: 0, checkInsToday: 0, trialsToday: 0 };
    const today = new Date().toISOString().slice(0, 10);
    return {
      total: members.length,
      avgStreak: Math.round(members.reduce((s, u) => s + u.streak, 0) / members.length),
      checkInsToday: members.filter((u) => u.lastCheckInDate === today).length,
      trialsToday: members.reduce((s, u) => s + u.dailyChallenges.filter((c) => c.completed).length, 0),
    };
  }, [members]);

  if (!gym) {
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
              className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl text-base font-black text-surface"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #E5C158)' }}
            >
              ◆
            </div>
            <p className="label tracking-[0.25em]">Gym Portal</p>
            <h1 className="mt-2 text-2xl font-black text-white">Enter your gym code</h1>
            <p className="mt-2 text-xs" style={{ color: '#4A4A4A' }}>
              Use the referral code assigned to your gym to view your members.
            </p>
            <input
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              className="input-field mt-5 uppercase tracking-widest text-center"
              placeholder="GYM CODE"
            />
            {error && (
              <p className="mt-2 text-xs" style={{ color: '#E74C3C' }}>{error}</p>
            )}
            <button type="button" onClick={handleUnlock} className="btn-primary mt-4 w-full">
              Access Dashboard
            </button>

            {/* Show available gyms as hints */}
            <div className="mt-6 space-y-2 text-left">
              <p className="label text-center tracking-[0.2em]">Available Gyms</p>
              {gyms.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <div>
                    <p className="text-xs font-semibold text-white">{g.name}</p>
                    <p className="text-[11px]" style={{ color: '#3A3A3A' }}>{g.location}</p>
                  </div>
                  <span
                    className="rounded-md px-2 py-1 font-mono text-[10px] font-bold tracking-widest"
                    style={{ background: 'rgba(212,175,55,0.08)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.15)' }}
                  >
                    {g.referralCode}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6">

      {/* Header */}
      <div className="card-elevated p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="label tracking-[0.25em]">Gym Portal</p>
            <h1 className="mt-1 text-2xl font-black text-white">{gym.name}</h1>
            <p className="mt-0.5 text-sm" style={{ color: '#4A4A4A' }}>{gym.location} · Code:{' '}
              <span className="font-mono font-bold" style={{ color: '#D4AF37' }}>{gym.referralCode}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setGym(null); setCode(''); }}
            className="btn-secondary text-xs self-start sm:self-auto"
          >
            Switch Gym
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: Users,      label: 'Total Members',      value: stats.total,        color: '#D4AF37' },
          { icon: TrendingUp, label: 'Avg Streak',         value: `${stats.avgStreak}d`, color: '#2ECC71' },
          { icon: CheckCircle,label: 'Check-ins Today',    value: stats.checkInsToday, color: '#4A90D9' },
          { icon: Target,     label: 'Trials Cleared Today', value: stats.trialsToday, color: '#B3B3B3' },
        ].map((s) => (
          <div
            key={s.label}
            className="card p-5"
            style={{ borderTop: `2px solid ${s.color}30` }}
          >
            <s.icon size={15} style={{ color: s.color }} />
            <p className="mt-3 text-3xl font-black text-white">{s.value}</p>
            <p className="mt-0.5 label">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Member table */}
      <div className="card overflow-hidden p-0">
        <div className="flex items-center justify-between gap-3 px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
        >
          <div>
            <p className="label tracking-[0.2em]">Member Directory</p>
            <p className="mt-0.5 text-xs" style={{ color: '#3A3A3A' }}>
              {members.length} member{members.length !== 1 ? 's' : ''} registered with code{' '}
              <span className="font-mono" style={{ color: '#D4AF37' }}>{gym.referralCode}</span>
            </p>
          </div>
        </div>

        {members.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm" style={{ color: '#3A3A3A' }}>No members yet for this gym.</p>
            <p className="mt-1 text-xs" style={{ color: '#2A2A2A' }}>
              Share code <span className="font-mono font-bold" style={{ color: '#D4AF37' }}>{gym.referralCode}</span> during signup.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
            {/* Column headers */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest"
              style={{ color: '#2A2A2A' }}
            >
              <span>Member</span>
              <span className="text-right">Streak</span>
              <span className="text-right">PP</span>
              <span className="text-right">Check-ins</span>
              <span className="text-right">Last Active</span>
            </div>

            {[...members]
              .sort((a, b) => b.streak - a.streak)
              .map((member, i) => {
                const today = new Date().toISOString().slice(0, 10);
                const isActive = member.lastCheckInDate === today;
                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center gap-3 px-5 py-3.5"
                  >
                    {/* Avatar + name */}
                    <div className="flex items-center gap-3 min-w-0">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="h-8 w-8 shrink-0 rounded-full object-cover"
                          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                        />
                      ) : (
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-surface"
                          style={{ background: 'linear-gradient(135deg, #D4AF37, #E5C158)' }}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{member.name}</p>
                        <p className="truncate text-[11px]" style={{ color: '#3A3A3A' }}>{member.rankTitle}</p>
                      </div>
                    </div>

                    <p className="text-right text-sm font-bold" style={{ color: '#D4AF37' }}>
                      {member.streak}d
                    </p>
                    <p className="text-right text-sm font-semibold text-white">
                      {member.xp.toLocaleString()}
                    </p>
                    <p className="text-right text-sm" style={{ color: '#4A4A4A' }}>
                      {member.checkIns}
                    </p>
                    <div className="flex items-center justify-end gap-1.5">
                      {isActive && (
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: '#2ECC71', boxShadow: '0 0 4px #2ECC71' }}
                        />
                      )}
                      <p className="text-right text-xs" style={{ color: isActive ? '#2ECC71' : '#2A2A2A' }}>
                        {member.lastCheckInDate
                          ? isActive ? 'Today' : member.lastCheckInDate.slice(5)
                          : 'Never'}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        )}
      </div>

      {/* Top performers */}
      {members.length >= 3 && (
        <div className="card p-5">
          <p className="label mb-4 tracking-[0.2em]">Top Performers</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[...members]
              .sort((a, b) => b.xp - a.xp)
              .slice(0, 3)
              .map((m, i) => (
                <div
                  key={m.id}
                  className="rounded-2xl p-4"
                  style={{
                    background: i === 0 ? 'rgba(212,175,55,0.06)' : 'rgba(255,255,255,0.02)',
                    border: i === 0 ? '1px solid rgba(212,175,55,0.18)' : '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <p className="label">#{i + 1}</p>
                  <p className="mt-1 text-base font-black text-white truncate">{m.name}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs" style={{ color: '#4A4A4A' }}>
                    <span>{m.xp.toLocaleString()} PP</span>
                    <span>·</span>
                    <span>{m.streak}d streak</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
