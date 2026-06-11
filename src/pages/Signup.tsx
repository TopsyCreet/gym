import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { gyms, findGymByCode } from '../data/gyms';
import onboarding1 from '../assets/brand/onboarding_1.png';
import onboarding2 from '../assets/brand/onboarding_2.png';
import onboarding3 from '../assets/brand/onboarding_3.png';
import logoPng from '../assets/brand/logo.png';
import mascotEncouraging from '../assets/brand/mascot_encouraging.png';
import mascotHappy       from '../assets/brand/mascot_happy.png';
import mascotCelebrating from '../assets/brand/mascot_celebrating.png';

const STEP_MASCOT = [mascotEncouraging, mascotHappy, mascotCelebrating];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STEPS = [
  {
    label: 'Identity',
    tagline: 'Build your profile.',
    body: 'Your name, credentials, gym. Everything Prime needs to track your record.',
    img: onboarding1,
  },
  {
    label: 'Commitment',
    tagline: 'Name your frequency.',
    body: 'Streaks only count on days you commit to. Choose honestly — you can always adjust later.',
    img: onboarding2,
  },
  {
    label: 'Confirm',
    tagline: 'Begin your record.',
    body: 'Every session from this point is evidence. The record starts now.',
    img: onboarding3,
  },
] as const;

const TIERS = [
  {
    id: 'foundation',
    label: 'Foundation',
    days: 3,
    desc: 'Build the habit before the intensity.',
    schedule: ['Mon', 'Wed', 'Fri'],
    color: '#3D7FD4',
  },
  {
    id: 'standard',
    label: 'Standard',
    days: 4,
    desc: 'The minimum for consistent, measurable progress.',
    schedule: ['Mon', 'Tue', 'Thu', 'Sat'],
    color: '#D4A017',
    recommended: true,
  },
  {
    id: 'elite',
    label: 'Elite',
    days: 5,
    desc: 'For those who make the gym non-negotiable.',
    schedule: ['Mon', 'Tue', 'Wed', 'Fri', 'Sat'],
    color: '#27AE60',
  },
] as const;

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function Signup() {
  const navigate = useNavigate();
  const signUp   = useAuthStore((s) => s.signUp);

  const [step, setStep]       = useState(1);
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone]     = useState('');
  const [gymCode, setGymCode] = useState('');
  const [gymId, setGymId]     = useState(gyms[0]?.id ?? 'gym-1');
  const [gymError, setGymError] = useState('');
  const [avatar, setAvatar]   = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [activeTier, setActiveTier] = useState<typeof TIERS[number]['id']>('standard');
  const [schedule, setSchedule] = useState<string[]>(['Mon', 'Tue', 'Thu', 'Sat']);
  const [error, setError]     = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canStep1 = useMemo(
    () => name.trim().length > 0 && email.trim().includes('@') && password.length >= 8,
    [name, email, password]
  );

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatar(await toBase64(file));
  };

  const handleNext = () => {
    setError('');

    if (step === 1) {
      if (!canStep1) { setError('Name, a valid email, and a password of at least 8 characters are required.'); return; }
      if (gymCode.trim()) {
        const found = findGymByCode(gymCode);
        if (!found) { setGymError('Invalid gym code. Leave blank to skip.'); return; }
        setGymId(found.id);
        setGymError('');
      }
    }

    if (step === 2 && schedule.length < 2) {
      setError('Select at least 2 training days.');
      return;
    }

    setStep((v) => v + 1);
  };

  const handleSignup = async () => {
    if (submitting) return;
    setSubmitting(true);
    // All new members start at Initiate — rank is earned through check-ins
    const result = await signUp({
      name, email, password, phone,
      avatar, avatarFile: avatarFile ?? undefined,
      rankTitle: 'Initiate',
      schedule, gymId,
    });
    setSubmitting(false);
    if (!result.success) { setError(result.message ?? 'Signup failed.'); return; }
    if (result.needsConfirmation) {
      navigate('/confirm-email', { state: { email } });
    } else {
      navigate('/dashboard');
    }
  };

  const currentStep = STEPS[step - 1];
  const currentTier = TIERS.find((t) => t.id === activeTier)!;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">

      {/* ── Brand + step indicators */}
      <div className="mb-7 text-center">
        <div className="relative mx-auto mb-4 h-12 w-12">
          <div
            className="absolute inset-0 rounded-xl opacity-30 blur-[12px]"
            style={{ background: '#D4AF37' }}
          />
          <img src={logoPng} alt="PRIME" className="relative h-12 w-12 object-contain" />
        </div>
        <h1 className="text-2xl font-black text-white">Begin your record.</h1>
        <p className="mt-1.5 text-sm" style={{ color: 'var(--text-faint)' }}>
          Prime rewards one thing: consistency.
        </p>
      </div>

      {/* Step pills */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {STEPS.map((_s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition-all"
              style={{
                background:  i + 1 < step ? '#D4A017' : i + 1 === step ? 'rgba(212,160,23,0.14)' : 'rgba(255,255,255,0.04)',
                color:       i + 1 < step ? '#0A0A0A' : i + 1 === step ? '#D4A017' : 'var(--text-faint)',
                border:      i + 1 === step ? '1px solid rgba(212,160,23,0.38)' : '1px solid transparent',
              }}
            >
              {i + 1 < step ? '✓' : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="h-px w-10"
                style={{ background: i + 1 < step ? 'rgba(212,160,23,0.4)' : 'rgba(255,255,255,0.06)' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* ── Main card — image left, form right */}
      <div
        className="overflow-hidden rounded-[1.25rem]"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="grid lg:grid-cols-[1.8fr_2.8fr]">

          {/* Left: illustration panel (desktop only) */}
          <div className="hidden lg:block relative" style={{ minHeight: 540 }}>
            <AnimatePresence mode="wait">
              <motion.img
                key={step}
                src={currentStep.img}
                alt=""
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.38 }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(160deg, rgba(14,15,17,0.1) 0%, rgba(14,15,17,0.82) 100%)' }}
            />
            {/* Text */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.32, delay: 0.1 }}
                className="absolute bottom-0 p-8"
              >
                <p className="label tracking-[0.25em]">
                  Step {step} of 3 — {currentStep.label}
                </p>
                <h2 className="mt-2 text-xl font-black leading-tight text-white">
                  {currentStep.tagline}
                </h2>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.48)' }}>
                  {currentStep.body}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: form */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.26 }}
              className="p-7 sm:p-9 space-y-5"
            >
              {/* Mascot — only visible on mobile (desktop has the illustration panel) */}
              <div className="lg:hidden flex justify-center pt-1 pb-2">
                <img src={STEP_MASCOT[step - 1]} alt="" aria-hidden="true" style={{ width: 90 }} />
              </div>

              {/* Mobile step label */}
              <div className="lg:hidden">
                <p className="label">{currentStep.label} · Step {step} of 3</p>
                <p className="mt-1 text-lg font-black text-white">{currentStep.tagline}</p>
              </div>

              {/* ── Step 1: Identity */}
              {step === 1 && (
                <>
                  <div className="space-y-1.5">
                    <label className="label tracking-[0.16em]" htmlFor="su-name">Full Name</label>
                    <input id="su-name" className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="label tracking-[0.16em]" htmlFor="su-email">Email</label>
                    <input id="su-email" className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="label tracking-[0.16em]" htmlFor="su-pw">Password</label>
                    <input id="su-pw" className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" autoComplete="new-password" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="label tracking-[0.16em]" htmlFor="su-phone">
                      Phone <span style={{ color: 'var(--text-faint)' }}>(optional)</span>
                    </label>
                    <input id="su-phone" className="input-field" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 800 000 0000" autoComplete="tel" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="label tracking-[0.16em]" htmlFor="su-gym">
                      Gym Code <span style={{ color: 'var(--text-faint)' }}>(optional)</span>
                    </label>
                    <input
                      id="su-gym"
                      className="input-field uppercase tracking-widest"
                      value={gymCode}
                      onChange={(e) => { setGymCode(e.target.value.toUpperCase()); setGymError(''); }}
                      placeholder="e.g. PRIME"
                    />
                    {gymCode && !gymError && findGymByCode(gymCode) && (
                      <p className="text-xs" style={{ color: 'var(--success)' }}>
                        ✓ {findGymByCode(gymCode)!.name}
                      </p>
                    )}
                    {gymError && <p className="text-xs" style={{ color: 'var(--error, #E74C3C)' }}>{gymError}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="label tracking-[0.16em]" htmlFor="su-avatar">
                      Photo <span style={{ color: 'var(--text-faint)' }}>(optional)</span>
                    </label>
                    <input
                      id="su-avatar"
                      className="input-field cursor-pointer file:mr-3 file:rounded-full file:border-0 file:bg-yellow-500/10 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-yellow-400"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                    {avatar && (
                      <img src={avatar} alt="preview" className="mt-2 h-16 w-16 rounded-xl object-cover" style={{ border: '1px solid rgba(212,160,23,0.22)' }} />
                    )}
                  </div>
                </>
              )}

              {/* ── Step 2: Commitment */}
              {step === 2 && (
                <>
                  {/* Tier cards */}
                  <div className="space-y-2">
                    {TIERS.map((tier) => {
                      const active = activeTier === tier.id;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => { setActiveTier(tier.id); setSchedule([...tier.schedule]); }}
                          className="w-full flex items-center gap-4 rounded-2xl p-4 text-left transition-all"
                          style={{
                            background: active ? `${tier.color}0e` : 'rgba(255,255,255,0.025)',
                            border: `1px solid ${active ? `${tier.color}32` : 'rgba(255,255,255,0.06)'}`,
                          }}
                        >
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black"
                            style={{
                              background: active ? `${tier.color}18` : 'rgba(255,255,255,0.04)',
                              color: active ? tier.color : 'var(--text-faint)',
                            }}
                          >
                            {tier.days}×
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-black text-white">{tier.label}</p>
                              {'recommended' in tier && tier.recommended && (
                                <span
                                  className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                                  style={{ background: 'rgba(212,160,23,0.1)', color: 'var(--gold)', border: '1px solid rgba(212,160,23,0.2)' }}
                                >
                                  Recommended
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-xs" style={{ color: 'var(--text-faint)' }}>
                              {tier.desc}
                            </p>
                          </div>
                          {active && (
                            <div
                              className="h-4 w-4 shrink-0 rounded-full flex items-center justify-center text-[9px] font-black"
                              style={{ background: currentTier.color, color: '#000' }}
                            >
                              ✓
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="divider" />

                  {/* Day picker */}
                  <div>
                    <p className="label tracking-[0.18em] mb-1">Training Days</p>
                    <p className="text-xs mb-3" style={{ color: 'var(--text-faint)' }}>
                      Pre-filled from your tier — tap to customise.
                    </p>
                    <div className="grid grid-cols-7 gap-1.5">
                      {WEEKDAYS.map((day) => {
                        const on = schedule.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() =>
                              setSchedule((curr) =>
                                curr.includes(day) ? curr.filter((d) => d !== day) : [...curr, day]
                              )
                            }
                            className="rounded-xl py-2.5 text-[11px] font-bold transition-all duration-150"
                            style={
                              on
                                ? { background: 'rgba(212,160,23,0.12)', color: 'var(--gold)', border: '1px solid rgba(212,160,23,0.3)' }
                                : { background: 'rgba(255,255,255,0.025)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.05)' }
                            }
                          >
                            {day.slice(0, 2)}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs" style={{ color: 'var(--text-faint)' }}>
                      {schedule.length} day{schedule.length !== 1 ? 's' : ''} · streaks only count on these days
                    </p>
                  </div>
                </>
              )}

              {/* ── Step 3: Confirm */}
              {step === 3 && (
                <div className="space-y-4">
                  <div
                    className="rounded-2xl p-5 space-y-3.5"
                    style={{ background: 'rgba(212,160,23,0.04)', border: '1px solid rgba(212,160,23,0.1)' }}
                  >
                    <p className="label tracking-[0.22em]">Your Record</p>
                    {[
                      { label: 'Name',       value: name },
                      { label: 'Email',      value: email },
                      { label: 'Gym',        value: gyms.find((g) => g.id === gymId)?.name ?? 'None' },
                      {
                        label: 'Commitment',
                        value: `${currentTier.label} · ${schedule.join(', ')}`,
                      },
                    ].map((row) => (
                      <div key={row.label} className="flex items-start justify-between gap-4">
                        <span className="label shrink-0">{row.label}</span>
                        <span className="text-sm font-semibold text-white text-right">{row.value}</span>
                      </div>
                    ))}
                  </div>

                  {avatar && (
                    <div className="flex items-center gap-3">
                      <img
                        src={avatar}
                        alt="avatar preview"
                        className="h-12 w-12 rounded-xl object-cover"
                        style={{ border: '1px solid rgba(212,160,23,0.2)' }}
                      />
                      <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Profile photo set</p>
                    </div>
                  )}

                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-faint)' }}>
                    You'll start as <span className="font-bold text-white">Initiate</span> — everyone does.
                    Rank advances through check-ins: 10 to Forged, 25 to Vanguard, 50 to Elite, 100 to Prime, 200 to Monarch.
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <p
                  className="rounded-xl px-3 py-2.5 text-xs"
                  style={{ background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)', color: '#E74C3C' }}
                >
                  {error}
                </p>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between gap-3 pt-1">
                {step > 1 ? (
                  <button type="button" onClick={() => { setError(''); setStep((v) => v - 1); }} className="btn-ghost gap-1.5">
                    <ArrowLeft size={13} /> Back
                  </button>
                ) : (
                  <Link to="/login" className="text-xs" style={{ color: 'var(--text-faint)' }}>
                    Already have an account?
                  </Link>
                )}
                <button
                  type="button"
                  onClick={step < 3 ? handleNext : handleSignup}
                  className="btn-primary gap-2"
                >
                  {step < 3 ? 'Continue' : 'Begin Your Record'}
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
