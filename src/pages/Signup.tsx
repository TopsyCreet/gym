import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { gyms, findGymByCode } from '../data/gyms';
import { ranks } from '../data/ranks';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const steps = [
  { label: 'Identity', desc: 'Who are you?' },
  { label: 'Schedule', desc: 'When do you show up?' },
  { label: 'Rank', desc: 'Where do you begin?' },
  { label: 'Confirm', desc: 'Ready to commit?' },
];

export default function Signup() {
  const navigate = useNavigate();
  const signUp = useAuthStore((state) => state.signUp);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [phone, setPhone] = useState('');
  const [schedule, setSchedule] = useState<string[]>(['Mon', 'Wed']);
  const [rankTitle, setRankTitle] = useState('Initiate');
  const [gymCode, setGymCode] = useState('');
  const [gymId, setGymId] = useState(gyms[0]?.id ?? 'gym-1');
  const [gymError, setGymError] = useState('');
  const [error, setError] = useState('');

  const canContinueOne = useMemo(() => name && email && password, [name, email, password]);
  const canContinueTwo = schedule.length >= 2;

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const base64 = await toBase64(file);
      setAvatar(base64);
    }
  };

  const handleNext = () => {
    if (step === 1 && !canContinueOne) {
      setError('Name, email, and password are required.');
      return;
    }
    // Validate gym code if provided
    if (step === 1 && gymCode.trim()) {
      const found = findGymByCode(gymCode);
      if (!found) {
        setGymError('Invalid gym code. Leave blank to skip.');
        return;
      }
      setGymId(found.id);
      setGymError('');
    }
    if (step === 2 && !canContinueTwo) {
      setError('Select at least two gym days.');
      return;
    }
    setError('');
    setStep((v) => v + 1);
  };

  const handleSignup = async () => {
    const result = await signUp({ name, email, password, avatar, rankTitle, schedule, gymId, avatarFile: avatarFile ?? undefined, phone });
    if (!result.success) {
      setError(result.message ?? 'Signup failed.');
      return;
    }
    if (result.needsConfirmation) {
      navigate('/confirm-email', { state: { email } });
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black text-surface"
          style={{ background: 'linear-gradient(135deg, #D4AF37, #E5C158)' }}
        >
          ▲
        </div>
        <h1 className="text-3xl font-black text-white">Begin your record.</h1>
        <p className="mt-2 text-sm" style={{ color: '#4A4A4A' }}>
          Prime rewards one thing: consistency.
        </p>
      </div>

      {/* Step indicators */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {steps.map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition-all"
              style={{
                background: i + 1 < step ? '#D4AF37' : i + 1 === step ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
                color: i + 1 <= step ? (i + 1 < step ? '#0A0A0A' : '#D4AF37') : '#3A3A3A',
                border: i + 1 === step ? '1px solid rgba(212,175,55,0.4)' : '1px solid transparent',
              }}
            >
              {i + 1 < step ? '✓' : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className="h-px w-8" style={{ background: i + 1 < step ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.06)' }} />
            )}
          </div>
        ))}
      </div>

      <div className="card p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
          {/* Left: context */}
          <div
            className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <p className="label tracking-[0.25em]">Step {step} of 4 — {steps[step - 1].label}</p>
            <div className="mt-4 space-y-3 text-sm" style={{ color: '#4A4A4A' }}>
              {step === 1 && (
                <>
                  <p className="font-bold text-white">Welcome to Prime.</p>
                  <p>Prime rewards one thing: consistency.</p>
                  <p>Every visit proves commitment. Every proof earns progress.</p>
                </>
              )}
              {step === 2 && (
                <>
                  <p className="font-bold text-white">Set your schedule.</p>
                  <p>Streaks only count on days you commit to.</p>
                  <p>Most people quit. Prime exists for those who don't.</p>
                </>
              )}
              {step === 3 && (
                <>
                  <p className="font-bold text-white">Choose your starting rank.</p>
                  <p>All ranks begin the same way — with a first step.</p>
                  <p>Your rank will advance through consistency.</p>
                </>
              )}
              {step === 4 && (
                <>
                  <p className="font-bold text-white">Begin your first streak.</p>
                  <p>Review your details and commit.</p>
                  <p>The path starts now.</p>
                </>
              )}
            </div>
          </div>

          {/* Right: form */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            {step === 1 && (
              <>
                <div>
                  <label className="label block mb-2">Full Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Your name" />
                </div>
                <div>
                  <label className="label block mb-2">Email</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" type="email" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="label block mb-2">Password</label>
                  <input value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" type="password" placeholder="Min. 8 characters" />
                </div>
                <div>
                  <label className="label block mb-2">
                    Phone <span style={{ color: '#3A3A3A' }}>(optional)</span>
                  </label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" type="tel" placeholder="+1 555 000 0000" />
                </div>
                <div>
                  <label className="label block mb-2">
                    Gym Code <span style={{ color: '#3A3A3A' }}>(optional)</span>
                  </label>
                  <input
                    value={gymCode}
                    onChange={(e) => { setGymCode(e.target.value.toUpperCase()); setGymError(''); }}
                    className="input-field uppercase tracking-widest"
                    placeholder="e.g. PRIME"
                  />
                  {gymCode && !gymError && findGymByCode(gymCode) && (
                    <p className="mt-1.5 text-xs" style={{ color: '#2ECC71' }}>
                      ✓ {findGymByCode(gymCode)!.name}
                    </p>
                  )}
                  {gymError && (
                    <p className="mt-1.5 text-xs" style={{ color: '#E74C3C' }}>{gymError}</p>
                  )}
                </div>
                <div>
                  <label className="label block mb-2">Avatar <span style={{ color: '#3A3A3A' }}>(optional)</span></label>
                  <input
                    onChange={handleAvatarChange}
                    className="input-field cursor-pointer file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-surface"
                    type="file"
                    accept="image/*"
                  />
                  {avatar && (
                    <img src={avatar} alt="preview" className="mt-3 h-20 w-20 rounded-2xl object-cover" style={{ border: '1px solid rgba(212,175,55,0.2)' }} />
                  )}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <p className="text-sm" style={{ color: '#6B6B6B' }}>Select your committed gym days — minimum 2:</p>
                <div className="grid grid-cols-4 gap-2">
                  {weekdays.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSchedule((curr) => curr.includes(day) ? curr.filter((d) => d !== day) : [...curr, day])}
                      className="rounded-xl py-3.5 text-sm font-bold transition-all duration-150"
                      style={
                        schedule.includes(day)
                          ? { background: 'rgba(212,175,55,0.12)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }
                          : { background: 'rgba(255,255,255,0.02)', color: '#3A3A3A', border: '1px solid rgba(255,255,255,0.05)' }
                      }
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <p className="text-xs" style={{ color: '#3A3A3A' }}>
                  {schedule.length} day{schedule.length !== 1 ? 's' : ''} selected
                </p>
              </>
            )}

            {step === 3 && (
              <>
                <p className="text-sm" style={{ color: '#6B6B6B' }}>Your starting rank. All are equal — each requires the same first step.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {ranks.map((rank) => (
                    <button
                      type="button"
                      key={rank.title}
                      onClick={() => setRankTitle(rank.title)}
                      className="rounded-2xl p-4 text-left transition-all duration-150"
                      style={
                        rankTitle === rank.title
                          ? { background: `${rank.color}10`, border: `1px solid ${rank.color}35` }
                          : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }
                      }
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: rank.color }} />
                        <p className="text-sm font-black uppercase tracking-wider" style={{ color: rankTitle === rank.title ? rank.color : '#B3B3B3' }}>
                          {rank.title}
                        </p>
                      </div>
                      <p className="text-xs" style={{ color: '#3A3A3A' }}>{rank.subtitle}</p>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 4 && (
              <div
                className="space-y-4 rounded-2xl p-5"
                style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.1)' }}
              >
                <p className="label tracking-[0.2em]">Your Record</p>
                <div className="space-y-3 text-sm">
                  {[
                    { label: 'Name', value: name },
                    { label: 'Email', value: email },
                    { label: 'Schedule', value: schedule.join(', ') },
                    { label: 'Starting Rank', value: rankTitle },
                    { label: 'Gym', value: gyms.find(g => g.id === gymId)?.name ?? 'None' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-3">
                      <span className="label">{row.label}</span>
                      <span className="font-semibold text-white text-right">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p className="rounded-xl px-3 py-2 text-xs" style={{ background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)', color: '#E74C3C' }}>
                {error}
              </p>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              {step > 1 ? (
                <button type="button" onClick={() => setStep((v) => v - 1)} className="btn-ghost gap-1.5">
                  <ArrowLeft size={13} /> Back
                </button>
              ) : <span />}
              <button type="button" onClick={step < 4 ? handleNext : handleSignup} className="btn-primary gap-2">
                {step < 4 ? 'Continue' : 'Begin Your Record'}
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
