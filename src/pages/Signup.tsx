import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { validateReferral } from '../api/backend';

const rankOptions = ['Novice', 'Iron Body', 'Warrior', 'Elite', 'Shadow'];
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function Signup() {
  const navigate = useNavigate();
  const signUp = useAuthStore((state) => state.signUp);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('');
  const [schedule, setSchedule] = useState<string[]>(['Mon', 'Wed']);
  const [rankTitle, setRankTitle] = useState('Novice');
  const [gymCode, setGymCode] = useState('');
  const [error, setError] = useState('');

  const [gym, setGym] = useState<any | null>(null);
  const canContinueOne = useMemo(() => name && email && password && avatar, [name, email, password, avatar]);
  const canContinueTwo = schedule.length >= 2;

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const base64 = await toBase64(file);
      setAvatar(base64);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!canContinueOne) {
        setError('Complete all fields and upload an avatar.');
        return;
      }
      if (!gymCode) {
        setError('Enter a gym referral code to continue.');
        return;
      }

      setError('Validating referral code...');
      const found = await validateReferral(gymCode);
      if (!found) {
        setError('Enter a valid gym referral code to continue.');
        return;
      }
      setGym(found);
    }
    if (step === 2 && !canContinueTwo) {
      setError('Choose at least two gym days.');
      return;
    }
    setError('');
    setStep((value) => value + 1);
  };

  const handleSignup = () => {
    if (!gym) {
      setError('Your gym referral code must be valid before signup completes.');
      return;
    }

    signUp({ name, email, password, avatar, rankTitle, schedule, gymId: gym.id });
    navigate('/dashboard');
  };

  return (
    <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-surface2 p-8 shadow-soft">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Welcome recruit</p>
        <h1 className="mt-4 text-4xl font-bold text-white">Create your IRONGATE profile</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-[#081225] p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">Step {step} of 4</p>
          {step === 1 && <p className="text-white">Profile essentials. Build your avatar and identity as you enter the dark dungeon.</p>}
          {step === 2 && <p className="text-white">Choose your training days. Streaks only count on selected gym days.</p>}
          {step === 3 && <p className="text-white">Pick a motivational rank title to match your path.</p>}
          {step === 4 && <p className="text-white">Ready to enter the arena. Review your details and complete onboarding.</p>}
        </div>
        <div className="space-y-6">
          {step === 1 && (
            <div className="space-y-5">
              <label className="block text-sm text-zinc-300">
                Full Name
                <input value={name} onChange={(e) => setName(e.target.value)} className="mt-3 w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-glow" />
              </label>
              <label className="block text-sm text-zinc-300">
                Email
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-3 w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-glow" type="email" />
              </label>
              <label className="block text-sm text-zinc-300">
                Password
                <input value={password} onChange={(e) => setPassword(e.target.value)} className="mt-3 w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-glow" type="password" />
              </label>
              <label className="block text-sm text-zinc-300">
                Gym Referral Code
                <input value={gymCode} onChange={(e) => setGymCode(e.target.value)} className="mt-3 w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-glow" />
              </label>
              {gymCode && (
                <p className={`text-sm mt-2 ${gym ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {gym ? `Linked to ${gym.name} (${gym.location})` : 'Referral code not recognized yet.'}
                </p>
              )}
              <label className="block text-sm text-zinc-300">
                Upload Avatar
                <input onChange={handleAvatarChange} className="mt-3 w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none file:mr-4 file:rounded-full file:border-0 file:bg-glow file:px-4 file:py-2 file:text-surface" type="file" accept="image/*" />
              </label>
              {avatar && <img src={avatar} alt="avatar preview" className="h-28 w-28 rounded-3xl object-cover" />}
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-300">Select your regular gym days:</p>
              <div className="grid grid-cols-3 gap-3">
                {weekdays.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSchedule((curr) => curr.includes(day) ? curr.filter((item) => item !== day) : [...curr, day])}
                    className={`rounded-3xl border px-4 py-4 text-sm font-semibold transition ${schedule.includes(day) ? 'border-glow bg-glow/10 text-white' : 'border-white/10 bg-white/5 text-zinc-300'}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <p className="text-sm text-zinc-400">Pick at least two days to keep your streak alive.</p>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-300">Choose an entrance rank:</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {rankOptions.map((rank) => (
                  <button
                    type="button"
                    key={rank}
                    onClick={() => setRankTitle(rank)}
                    className={`rounded-3xl border px-5 py-4 text-left transition ${rankTitle === rank ? 'border-glow bg-glow/10 text-white' : 'border-white/10 bg-white/5 text-zinc-300'}`}
                  >
                    <p className="font-semibold">{rank}</p>
                    <p className="mt-2 text-sm text-zinc-400">Motivational start rank for your journey.</p>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4 rounded-3xl border border-white/10 bg-[#07101f] p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">Review</p>
              <div className="space-y-3 text-sm text-zinc-300">
                <p><strong>Name:</strong> {name}</p>
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Gym:</strong> {gym ? `${gym.name} (${gym.location})` : 'Unknown gym'}</p>
                <p><strong>Schedule:</strong> {schedule.join(', ')}</p>
                <p><strong>Starting Rank:</strong> {rankTitle}</p>
              </div>
              <p className="text-sm text-zinc-400">Finish onboarding to enter the IRONGATE dashboard with your powered-up routine.</p>
            </div>
          )}
          {error && <p className="text-sm text-amber-300">{error}</p>}
          <div className="flex items-center justify-between gap-3">
            {step > 1 ? (
              <button type="button" onClick={() => setStep((value) => value - 1)} className="btn-secondary">Back</button>
            ) : <span />}
            <button
              type="button"
              onClick={step < 4 ? handleNext : handleSignup}
              className="btn-primary"
            >
              {step < 4 ? 'Continue' : 'Complete Onboarding'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
