import { useMemo, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useGymStore } from '../store/gymStore';

export default function Admin() {
  const users = useAuthStore((state) => state.users);
  const getUser = useAuthStore((state) => state.getUser);
  const updateUser = useAuthStore((state) => state.updateUser);
  const resetStreak = useAuthStore((state) => state.resetStreak);
  const awardXp = useAuthStore((state) => state.awardXp);
  const { atGymOverride, toggleAtGymOverride } = useGymStore();
  const user = getUser();
  const [secret, setSecret] = useState('');
  const [allowed, setAllowed] = useState(false);
  const [xpInput, setXpInput] = useState('100');

  const totalCheckInsToday = useMemo(() => users.filter((item) => item.lastCheckInDate === new Date().toISOString().slice(0, 10)).length, [users]);
  const activeStreaks = useMemo(() => users.filter((item) => item.streak >= 3).length, [users]);

  const handleUnlock = () => {
    if (secret === 'irongate2024') setAllowed(true);
  };

  if (!allowed) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-surface2 p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Admin portal</p>
        <h1 className="mt-4 text-4xl font-bold text-white">Enter admin password</h1>
        <input value={secret} onChange={(e) => setSecret(e.target.value)} className="mt-6 w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-glow" type="password" />
        <button type="button" onClick={handleUnlock} className="btn-primary mt-6 w-full">Unlock Admin</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-surface2 p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Admin panel</p>
        <h1 className="mt-4 text-4xl font-bold text-white">Demo controls</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-[#07101f] p-5">
            <p className="text-sm text-zinc-400">Total users</p>
            <p className="mt-3 text-3xl font-semibold text-white">{users.length}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#07101f] p-5">
            <p className="text-sm text-zinc-400">Check-ins today</p>
            <p className="mt-3 text-3xl font-semibold text-white">{totalCheckInsToday}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#07101f] p-5">
            <p className="text-sm text-zinc-400">Active streaks</p>
            <p className="mt-3 text-3xl font-semibold text-white">{activeStreaks}</p>
          </div>
        </div>
      </section>
      <section className="rounded-3xl border border-white/10 bg-surface2 p-8 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">Simulation toggle</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Gym location override</h2>
          </div>
          <button type="button" onClick={toggleAtGymOverride} className="btn-primary">{atGymOverride ? 'Set Away' : 'Set At Gym'}</button>
        </div>
      </section>
      <section className="rounded-3xl border border-white/10 bg-surface2 p-8 shadow-soft">
        <div className="grid gap-4">
          <div className="rounded-3xl bg-[#07101f] p-5">
            <p className="text-sm text-zinc-400">Award XP to logged-in user</p>
            <div className="mt-4 flex gap-3">
              <input value={xpInput} onChange={(e) => setXpInput(e.target.value)} className="flex-1 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-glow" type="number" />
              <button type="button" onClick={() => awardXp(Number(xpInput))} className="btn-primary">Award</button>
            </div>
          </div>
          <div className="rounded-3xl bg-[#07101f] p-5">
            <p className="text-sm text-zinc-400">Reset streak for logged-in user</p>
            <button type="button" onClick={resetStreak} className="btn-secondary mt-4">Reset Streak</button>
          </div>
        </div>
      </section>
      <section className="rounded-3xl border border-white/10 bg-surface2 p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">All users</p>
        <div className="mt-6 grid gap-4">
          {users.map((member) => (
            <div key={member.id} className="rounded-3xl border border-white/10 bg-[#07101f] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{member.name}</p>
                  <p className="text-sm text-zinc-400">{member.email}</p>
                </div>
                <div className="text-sm text-zinc-200">Streak: {member.streak} | XP: {member.xp}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
