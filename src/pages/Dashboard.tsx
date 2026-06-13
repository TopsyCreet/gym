import { useEffect, useMemo, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { CheckCircle, Shield, AlertTriangle, X, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useGymStore } from '../store/gymStore';
import emptyStatePng from '../assets/brand/empty_state.png';
import Ring, { WeeklyArc } from '../components/ui/Ring';
import StatCounter from '../components/ui/StatCounter';
import Button from '../components/ui/Button';
import RankBadge from '../components/RankBadge';
import ChallengeCard from '../components/ChallengeCard';
import CheckInModal from '../components/CheckInModal';
import TrialSheet from '../components/TrialSheet';
import GymFeedCard from '../components/GymFeedCard';
import { getRankByTitle } from '../data/ranks';
import { sessionFlag } from '../lib/sessionFlags';

// ── Constants ─────────────────────────────────────────────────────────────────
const COMMITMENT_TIERS: Array<{ label: string; days: number; schedule: string[]; recommended?: boolean }> = [
  { label: 'Foundation', days: 3, schedule: ['Mon', 'Wed', 'Fri'] },
  { label: 'Standard',   days: 4, schedule: ['Mon', 'Tue', 'Thu', 'Sat'], recommended: true },
  { label: 'Elite',      days: 5, schedule: ['Mon', 'Tue', 'Wed', 'Fri', 'Sat'] },
];

const RANK_THRESHOLDS = [
  { title: 'Initiate', minCheckIns: 0   },
  { title: 'Forged',   minCheckIns: 10  },
  { title: 'Vanguard', minCheckIns: 25  },
  { title: 'Elite',    minCheckIns: 50  },
  { title: 'Prime',    minCheckIns: 100 },
  { title: 'Monarch',  minCheckIns: 200 },
];

const INSIGHTS = [
  {
    category: 'Consistency',
    title:    'The Compound Effect',
    body:     "Session 1 and session 50 feel different. Early sessions build the habit; later ones reveal the identity. Show up for both.",
    color:    '#D4A017',
  },
  {
    category: 'Identity',
    title:    'You Are What You Repeat',
    body:     "Every check-in is a vote for who you're becoming. The person with 100 sessions did not decide once — they decided 100 times.",
    color:    '#8A9BA8',
  },
  {
    category: 'Recovery',
    title:    'Rest Is Scheduled',
    body:     "Skipping a non-scheduled day is not a miss — it's the plan. Recovery is part of the record. Honour it like any other session.",
    color:    '#D4A017',
  },
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────
function getDailyInsight() {
  const now   = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  return INSIGHTS[dayOfYear % INSIGHTS.length];
}

type WeeklyState = 'secured' | 'tight' | 'done' | 'pending';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getSubLine(state: WeeklyState, checkInsLeft: number, daysLeft: number): string {
  if (state === 'secured') return 'Week secured. Rest is part of discipline.';
  if (state === 'tight')
    return `${checkInsLeft} session${checkInsLeft !== 1 ? 's' : ''} left — ${daysLeft} day${daysLeft !== 1 ? 's' : ''} to go.`;
  if (state === 'done') return 'Proved today. The record grows.';
  if (checkInsLeft > 0)
    return `${checkInsLeft} check-in${checkInsLeft !== 1 ? 's' : ''} to close your week.`;
  return "Showed up. Most didn't.";
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const user        = useAuthStore((s) => s.getUser());
  const updateUser  = useAuthStore((s) => s.updateUser);
  const openCheckIn = useGymStore((s) => s.openCheckInDirect);

  const containerRef     = useRef<HTMLDivElement>(null);
  const ringHeroRef      = useRef<HTMLDivElement>(null);
  const celebrationTlRef = useRef<gsap.core.Timeline | null>(null);
  const toastShownRef    = useRef(false);

  const [toast, setToast]             = useState<string | null>(null);
  const [openTrialId, setOpenTrialId] = useState<number | null>(null);

  const today          = new Date().toISOString().slice(0, 10);
  const checkedInToday = user?.lastCheckInDate === today;
  const firstName      = user?.name.split(' ')[0] ?? '';

  // ── Weekly progress ──────────────────────────────────────────────────────
  const weeklyDone = useMemo(() => {
    if (!user) return 0;
    const now = new Date();
    const daysSinceMonday = (now.getDay() + 6) % 7;
    let count = 0;
    for (let i = daysSinceMonday; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      if (user.attendanceHistory[d.toISOString().slice(0, 10)]) count++;
    }
    return count;
  }, [user]);

  const weeklyTarget   = user?.schedule.length ?? 0;
  const weeklyProgress = weeklyTarget > 0 ? Math.min(1, weeklyDone / weeklyTarget) : 0;

  const daysRemainingInWeek = (() => {
    const day = new Date().getDay();
    return day === 0 ? 0 : 7 - day;
  })();
  const checkInsLeft = Math.max(0, weeklyTarget - weeklyDone);

  const weeklyState: WeeklyState = (() => {
    if (weeklyTarget > 0 && weeklyDone >= weeklyTarget) return 'secured';
    if (checkInsLeft > 0 && daysRemainingInWeek > 0 && checkInsLeft >= daysRemainingInWeek) return 'tight';
    if (checkedInToday) return 'done';
    return 'pending';
  })();

  // ── Ring progress ────────────────────────────────────────────────────────
  const trialProgress = useMemo(() => {
    if (!user || user.dailyChallenges.length === 0) return 0;
    return user.dailyChallenges.filter((c) => c.completed).length / user.dailyChallenges.length;
  }, [user]);

  const checkInProgress = checkedInToday ? 1 : 0;
  const trialCleared    = user?.dailyChallenges[0]?.completed ?? false;

  // ── Rank progress ────────────────────────────────────────────────────────
  const rankDef       = getRankByTitle(user?.rankTitle ?? 'Initiate');
  const rankIdx       = Math.max(0, RANK_THRESHOLDS.findIndex((r) => r.title === (user?.rankTitle ?? 'Initiate')));
  const nextRankEntry = RANK_THRESHOLDS[rankIdx + 1] ?? null;
  const curThreshold  = RANK_THRESHOLDS[rankIdx]?.minCheckIns ?? 0;
  const nextThreshold = nextRankEntry?.minCheckIns ?? curThreshold;
  const rankProgress  = nextRankEntry && nextThreshold > curThreshold
    ? Math.min(1, Math.max(0, ((user?.checkIns ?? 0) - curThreshold) / (nextThreshold - curThreshold)))
    : 1;

  // ── Tight-week toast ─────────────────────────────────────────────────────
  useEffect(() => {
    if (toastShownRef.current || checkedInToday) return;
    if (weeklyState === 'tight') {
      setToast(`${checkInsLeft} session${checkInsLeft !== 1 ? 's' : ''} left — ${daysRemainingInWeek} day${daysRemainingInWeek !== 1 ? 's' : ''} to go.`);
      toastShownRef.current = true;
    }
  }, [weeklyState, checkedInToday, checkInsLeft, daysRemainingInWeek]);

  // ── GSAP: card stagger entrance — first mount only per session ───────────
  useGSAP(() => {
    if (!containerRef.current || sessionFlag.check('stagger:dashboard')) return;
    sessionFlag.set('stagger:dashboard');
    const cards = containerRef.current.querySelectorAll('[data-card]');
    gsap.from(cards, {
      opacity: 0, y: 12, duration: 0.4, stagger: 0.06,
      ease: 'power2.out', clearProps: 'all',
    });
  }, { scope: containerRef });

  useEffect(() => () => { celebrationTlRef.current?.kill(); }, []);

  // ── Check-in ring celebration ────────────────────────────────────────────
  const handleRingComplete = useCallback(() => {
    if ('vibrate' in navigator) navigator.vibrate([60, 20, 80]);

    if (ringHeroRef.current) {
      const tl = gsap.timeline();
      celebrationTlRef.current = tl;
      tl.to(ringHeroRef.current, { scale: 1.04, duration: 0.15, ease: 'power2.out' })
        .to(ringHeroRef.current, { scale: 1, duration: 0.35, ease: 'back.out(1.7)' });
    }

    if (ringHeroRef.current) {
      const rect = ringHeroRef.current.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const N    = 10;
      const particles: HTMLDivElement[] = [];
      for (let i = 0; i < N; i++) {
        const size = 6 + (i % 3) * 2;
        const el   = document.createElement('div');
        Object.assign(el.style, {
          position: 'fixed', left: `${cx}px`, top: `${cy}px`,
          width: `${size}px`, height: `${size}px`,
          borderRadius: '50%',
          background: i % 2 === 0 ? 'var(--gold)' : 'var(--gold-light)',
          pointerEvents: 'none', zIndex: '9999',
          transform: 'translate(-50%, -50%)',
        });
        document.body.appendChild(el);
        particles.push(el);
      }
      const ptl = gsap.timeline({ onComplete: () => particles.forEach((p) => p.remove()) });
      particles.forEach((p, i) => {
        const angle = (i / N) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const dist  = 70 + Math.random() * 60;
        ptl.to(p, {
          x: Math.cos(angle) * dist, y: Math.sin(angle) * dist,
          opacity: 0, scale: 0, duration: 0.9, ease: 'power2.out',
        }, 0);
      });
    }
  }, []);

  if (!user) return null;

  const dailyInsight = getDailyInsight();

  return (
    <div ref={containerRef} className="mx-auto max-w-2xl space-y-3 px-4 py-4 sm:px-6 pb-24">

      {/* ── Tight-week toast ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.25, 0, 0.15, 1] }}
            className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3"
            style={{ background: 'rgba(243,156,18,0.07)', border: '1px solid rgba(243,156,18,0.2)' }}
            role="status"
            data-card
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={13} style={{ color: 'var(--warning)' }} aria-hidden="true" />
              <p className="text-sm font-semibold" style={{ color: 'var(--warning)' }}>{toast}</p>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Dismiss"
              className="focus-ring"
              style={{
                color: 'var(--text-faint)', padding: 4,
                minHeight: 44, minWidth: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ONE Hero Card: greeting + ring + stats + CTA ────────────────── */}
      <div className="card-hero p-4 sm:p-6" data-card>

        {/* Greeting — compact, no avatar */}
        <div className="mb-3">
          <p className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>
            {getGreeting()},
          </p>
          <div className="flex items-center gap-2.5 mt-0.5 flex-wrap">
            <h1 className="text-display font-black leading-none tracking-tight text-white">
              {firstName}
            </h1>
            <RankBadge title={user.rankTitle} size="sm" />
          </div>
          <p className="mt-1.5 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {getSubLine(weeklyState, checkInsLeft, daysRemainingInWeek)}
          </p>
        </div>

        {/* Ring — centred */}
        <div ref={ringHeroRef} className="flex justify-center my-2">
          <Ring
            checkIn={checkInProgress}
            trial={trialProgress}
            weekly={weeklyProgress}
            size={200}
            shieldActive={user.freezeTokens > 0}
            onCheckInComplete={handleRingComplete}
          />
        </div>

        {/* Streak + ring legend */}
        <div className="flex items-end justify-between gap-4 mt-3">
          <div>
            <p className="label">Days Unbroken</p>
            <p
              className="mt-0.5 leading-none"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 'clamp(2.25rem, 8vw, 3.25rem)',
                fontWeight: 900,
                fontVariantNumeric: 'tabular-nums',
                color: user.streak > 0 ? 'var(--gold)' : 'var(--text-faint)',
              }}
              aria-label={`${user.streak} day streak`}
            >
              <StatCounter value={user.streak} />
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5 pb-1">
            {user.freezeTokens > 0 && (
              <div className="flex items-center gap-1" role="list" aria-label="Streak shields">
                {Array.from({ length: Math.min(user.freezeTokens, 2) }).map((_, i) => (
                  <span
                    key={i}
                    role="listitem"
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{
                      background: 'rgba(138,155,168,0.1)',
                      border: '1px solid rgba(138,155,168,0.25)',
                      color: 'var(--steel)',
                    }}
                  >
                    <Shield size={9} aria-hidden="true" />
                    Shield
                  </span>
                ))}
              </div>
            )}
            <div
              className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-wider"
              style={{ color: 'var(--text-faint)' }}
            >
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--gold)' }} />
                Check-in
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--steel)' }} />
                Trial
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--gold-muted)' }} />
                Week
              </span>
            </div>
          </div>
        </div>

        {/* Weekly arc */}
        <div className="mt-3">
          <WeeklyArc
            progress={weeklyProgress}
            weeklyDone={weeklyDone}
            weeklyTarget={weeklyTarget}
          />
        </div>

        {/* Primary CTA */}
        <div className="mt-4">
          {checkedInToday ? (
            <div
              className="inline-flex items-center gap-2.5 rounded-full px-5 py-2.5"
              style={{ background: 'var(--bg-overlay-3)', border: '1px solid rgba(212,160,23,0.2)' }}
            >
              <CheckCircle size={14} style={{ color: 'var(--gold)' }} aria-hidden="true" />
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--gold)' }}>
                Committed Today
              </span>
            </div>
          ) : (
            <Button
              variant="primary"
              onClick={openCheckIn}
              className="w-full"
              style={{ minHeight: 56, fontSize: '0.9375rem', letterSpacing: '0.05em' }}
              aria-label="Start gym check-in"
            >
              Check In
              <ArrowRight size={15} aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>

      {/* ── First-session welcome (new users: 0 check-ins) ──────────────── */}
      <AnimatePresence>
        {user.checkIns === 0 && !checkedInToday && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="card p-5"
            data-card
            style={{ border: '1px solid rgba(212,160,23,0.15)', background: 'rgba(212,160,23,0.025)' }}
          >
            <p className="label tracking-[0.22em]">Welcome to Prime</p>
            <h2 className="mt-1.5 text-xl font-black text-white leading-tight">
              Your record starts today.
            </h2>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Every session is logged against your name. Check in from the gym to begin building your streak.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {(['Check in at the gym', 'Complete the daily trial', 'Watch your rank climb'] as const).map((step, i) => (
                <div
                  key={step}
                  className="rounded-xl p-3"
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <p className="text-xs font-black tabular-nums" style={{ color: 'var(--gold)' }}>0{i + 1}</p>
                  <p className="mt-1 text-[11px] leading-snug" style={{ color: 'var(--text-secondary)' }}>{step}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Set weekly commitment (no schedule yet) ──────────────────────── */}
      {weeklyTarget === 0 && (
        <div className="card p-5" data-card>
          <p className="label mb-1">Set Weekly Commitment</p>
          <p className="mt-1 text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            How many days per week will you train? This activates your weekly ring.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {COMMITMENT_TIERS.map((tier) => (
              <button
                key={tier.label}
                type="button"
                onClick={() => updateUser({ ...user, schedule: [...tier.schedule] })}
                className="rounded-2xl p-4 text-left transition-colors"
                style={{ background: 'var(--bg-overlay-1)', border: '1px solid var(--border-subtle)' }}
              >
                <p className="text-xl font-black text-white">{tier.days}×</p>
                <p className="label mt-0.5">{tier.label}</p>
                {tier.recommended && (
                  <span
                    className="mt-1.5 inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                    style={{ background: 'var(--gold-faint)', color: 'var(--gold)' }}
                  >
                    Recommended
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Bento: sessions + rank ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-5" data-card>
          <p className="label">Sessions Logged</p>
          <p className="mt-2 text-3xl font-black text-white">
            <StatCounter
              value={user.checkIns}
              aria-label={`${user.checkIns} total sessions`}
              className="tabular-nums"
            />
          </p>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--text-faint)' }}>verified check-ins</p>
          <div className="divider my-3" />
          <p className="label">Longest Run</p>
          <p className="mt-1 text-xl font-black text-white tabular-nums">
            {user.longestStreak}
            <span className="ml-1 text-xs font-semibold" style={{ color: 'var(--text-faint)' }}>days</span>
          </p>
        </div>

        <div className="card p-5 flex flex-col" data-card>
          <p className="label mb-2.5">Your Rank</p>
          <RankBadge title={user.rankTitle} size="sm" />
          <p
            className="mt-2.5 text-xs leading-relaxed line-clamp-3"
            style={{ color: 'var(--text-faint)', fontSize: '0.6875rem' }}
          >
            {rankDef.manifesto}
          </p>
          {nextRankEntry && (
            <div className="mt-auto pt-3">
              <div className="flex items-center justify-between mb-1.5">
                <p className="label">→ {nextRankEntry.title}</p>
                <p className="label" style={{ color: rankDef.color }}>
                  {user.checkIns}/{nextRankEntry.minCheckIns}
                </p>
              </div>
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{ background: 'var(--bg-overlay-2)' }}
                role="progressbar"
                aria-valuenow={user.checkIns}
                aria-valuemin={curThreshold}
                aria-valuemax={nextThreshold}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${rankProgress * 100}%` }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full"
                  style={{ background: rankDef.color }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Today's Trial ─────────────────────────────────────────────────── */}
      <div className="card p-5" data-card>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="label">Today's Trial</p>
            {checkedInToday && (
              <h2 className="mt-1 text-lg font-black text-white">
                {trialCleared ? 'Cleared' : 'Active'}
              </h2>
            )}
          </div>
          {checkedInToday && (
            <span
              className="shrink-0 rounded-full px-3 py-1 text-xs font-bold"
              style={
                trialCleared
                  ? { background: 'var(--gold-faint)', border: '1px solid rgba(212,160,23,0.22)', color: 'var(--gold)' }
                  : { background: 'var(--bg-overlay-2)', border: '1px solid var(--border-faint)', color: 'var(--text-secondary)' }
              }
              aria-label={trialCleared ? 'Trial cleared' : 'Trial pending'}
            >
              {trialCleared ? '✓' : '—'}
            </span>
          )}
        </div>

        {!checkedInToday ? (
          <div
            className="flex flex-col items-center rounded-2xl py-8 text-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <img
              src={emptyStatePng}
              alt=""
              className="mb-4 h-20 w-20 object-contain opacity-60"
              aria-hidden="true"
            />
            <p className="text-sm font-semibold text-white">Trial unlocks after check-in.</p>
            <p className="mt-1 text-xs" style={{ color: 'var(--text-faint)' }}>Prove your presence first.</p>
          </div>
        ) : user.dailyChallenges.length > 0 ? (
          <ChallengeCard
            id={user.dailyChallenges[0].id}
            completed={user.dailyChallenges[0].completed}
            onOpen={() => setOpenTrialId(user.dailyChallenges[0].id)}
          />
        ) : (
          <div
            className="rounded-2xl py-8 text-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <p className="text-sm font-semibold text-white">Generating today's trial…</p>
          </div>
        )}
      </div>

      {/* ── Daily Insight ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="card relative overflow-hidden px-5 py-4"
        data-card
        style={{ borderLeft: `3px solid ${dailyInsight.color}` }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 70% 60% at 0% 0%, ${dailyInsight.color}0d 0%, transparent 100%)`,
          }}
        />
        <div className="relative">
          <p className="label tracking-[0.22em]" style={{ color: dailyInsight.color }}>
            {dailyInsight.category}
          </p>
          <p className="mt-2 text-lg font-black leading-snug text-white">
            {dailyInsight.title}
          </p>
          <div className="mt-3 h-px" style={{ background: `${dailyInsight.color}22` }} />
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {dailyInsight.body}
          </p>
        </div>
      </motion.div>

      {/* ── Gym Community Feed ────────────────────────────────────────────── */}
      <GymFeedCard />

      <TrialSheet trialId={openTrialId} onClose={() => setOpenTrialId(null)} />
      <CheckInModal />
    </div>
  );
}
