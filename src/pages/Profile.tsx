import { useMemo, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { getXpProgress } from '../utils/xpCalculator';
import { daysOfWeek } from '../utils/streakCalculator';
import AnimatedCounter from '../components/AnimatedCounter';
import RankBadge from '../components/RankBadge';
import AchievementsTab from '../components/AchievementsTab';
import GymPlanTab from '../components/GymPlanTab';
import { gyms } from '../data/gyms';
import { validateReferral } from '../api/backend';

export default function Profile() {
  const user = useAuthStore((state) => state.getUser());
  const updateUser = useAuthStore((state) => state.updateUser);
  const [schedule, setSchedule] = useState(user?.schedule ?? []);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'gymplan'>('overview');
  const [gymCode, setGymCode] = useState('');
  const [gymError, setGymError] = useState('');

  if (!user) return null;

  const { level, progress, from, to } = getXpProgress(user.xp);
  const currentGym = gyms.find((gym) => gym.id === user.gymId);

  const chartData = useMemo(() => {
    const weeks: number[] = [];
    const today = new Date();
    for (let i = 7; i >= 0; i -= 1) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - i * 7);
      const count = Array.from({ length: 7 }).reduce((sum: number, _, index: number) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + index);
        const key = date.toISOString().slice(0, 10);
        return sum + (user.attendanceHistory[key] ? 1 : 0);
      }, 0);
      weeks.push(count);
    }
    return weeks;
  }, [user]);

  const handleSaveSchedule = () => {
    updateUser({ ...user, schedule });
  };

  const handleSaveWorkoutPlan = (newPlan: Record<string, any>) => {
    updateUser({ ...user, workoutPlan: newPlan });
    setActiveTab('overview');
  };

  const handleGymCodeUpdate = () => {
    (async () => {
      const foundGym = await validateReferral(gymCode);
      if (!foundGym) {
        setGymError('Referral code not recognized.');
        return;
      }

      updateUser({ ...user, gymId: foundGym.gymId });
      setGymError('Gym affiliation updated successfully.');
    })();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-surface2 p-8 shadow-soft">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Profile</p>
            <h1 className="mt-4 text-4xl font-bold text-white">{user.name}</h1>
            <p className="mt-3 text-zinc-300">Level {level} — {user.rankTitle}</p>
          </div>
          <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-[#07101f] p-4">
            <img src={user.avatar} alt="Avatar" className="h-20 w-20 rounded-3xl object-cover" />
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">Rank</p>
              <RankBadge title={user.rankTitle} />
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="rounded-3xl border border-white/10 bg-surface2 p-6">
        <div className="flex gap-3 border-b border-white/10 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-4 text-sm font-semibold tracking-[0.2em] uppercase transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'text-glow border-b-2 border-glow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`pb-4 px-4 text-sm font-semibold tracking-[0.2em] uppercase transition whitespace-nowrap ${
              activeTab === 'achievements'
                ? 'text-glow border-b-2 border-glow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Achievements
          </button>
          <button
            onClick={() => setActiveTab('gymplan')}
            className={`pb-4 px-4 text-sm font-semibold tracking-[0.2em] uppercase transition whitespace-nowrap ${
              activeTab === 'gymplan'
                ? 'text-glow border-b-2 border-glow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Gym Plan
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <section className="space-y-6 rounded-3xl border border-white/10 bg-surface p-6 shadow-soft">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">Gym affiliation</p>
                <p className="mt-2 text-zinc-300">Your current gym and referral code. Update the code if you want to switch locations.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#07101f] p-4 text-sm text-zinc-300">
                <p className="font-semibold text-white">{currentGym?.name ?? 'No gym assigned'}</p>
                <p className="mt-1 text-zinc-400">{currentGym?.location ?? 'No location available'}</p>
                <p className="mt-1 text-zinc-400">{currentGym?.description ?? 'Sign up with a gym referral code to join a gym leaderboard.'}</p>
              </div>
              <label className="block text-sm text-zinc-300">
                New referral code
                <input
                  value={gymCode}
                  onChange={(e) => {
                    setGymCode(e.target.value);
                    setGymError('');
                  }}
                  className="mt-3 w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-glow"
                />
              </label>
              <button type="button" onClick={handleGymCodeUpdate} className="btn-primary">Update gym</button>
              {gymError && <p className={`text-sm ${gymError.includes('successfully') ? 'text-emerald-300' : 'text-amber-300'}`}>{gymError}</p>}

              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">Edit schedule</p>
                <p className="mt-2 text-zinc-300">Adjust your gym days and maintain your streak strategy.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {daysOfWeek.slice(1).concat(daysOfWeek[0]).map((day) => (
                  <button
                    type="button"
                    key={day}
                    onClick={() => setSchedule((curr) => curr.includes(day) ? curr.filter((item) => item !== day) : [...curr, day])}
                    className={`rounded-3xl border px-4 py-4 text-sm font-semibold transition ${schedule.includes(day) ? 'border-glow bg-glow/10 text-white' : 'border-white/10 bg-white/5 text-zinc-300'}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <button type="button" onClick={handleSaveSchedule} className="btn-primary">Save schedule</button>
            </section>
            <aside className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-[#07101f] p-6">
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">Quick achievements</p>
                <div className="mt-4 grid gap-3">
                  {user.achievements.slice(0, 3).map((badge) => (
                    <div key={badge} className="rounded-3xl bg-white/5 p-4 text-sm text-zinc-200">{badge}</div>
                  ))}
                  {user.achievements.length > 3 && (
                    <p className="text-xs text-zinc-400 pt-2">+{user.achievements.length - 3} more</p>
                  )}
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#07101f] p-6">
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">Weekly check-ins</p>
                <div className="mt-4 flex items-end gap-2">
                  {chartData.map((value, index) => (
                    <div key={index} className="flex-1">
                      <div className="mx-auto h-24 w-full rounded-3xl bg-white/5" style={{ height: `${Math.max(20, value * 5)}px` }} />
                      <p className="mt-2 text-center text-xs text-zinc-400">W{index + 1}</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}

        {activeTab === 'achievements' && (
          <AchievementsTab userAchievements={user.achievements} />
        )}

        {activeTab === 'gymplan' && (
          <GymPlanTab workoutPlan={user.workoutPlan} onUpdate={handleSaveWorkoutPlan} />
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <AnimatedCounter value={user.xp} label="Total XP" />
        <AnimatedCounter value={user.streak} label="Current streak" />
        <AnimatedCounter value={user.longestStreak} label="Longest streak" />
        <AnimatedCounter value={user.checkIns} label="Total check-ins" />
      </div>
    </div>
  );
}
