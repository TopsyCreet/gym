import { useEffect, useMemo, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { CheckCircle, Shield, AlertTriangle, X, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useGymStore } from '../store/gymStore';
import Ring, { WeeklyArc } from '../components/ui/Ring';
import Mascot from '../components/ui/Mascot';
import type { MascotState } from '../components/ui/Mascot';
import StatCounter from '../components/ui/StatCounter';
import Button from '../components/ui/Button';
import RankBadge from '../components/RankBadge';
import ChallengeCard from '../components/ChallengeCard';
import CheckInModal from '../components/CheckInModal';
import TrialSheet from '../components/TrialSheet';
import GymFeedCard from '../components/GymFeedCard';
import { getRankByTitle } from '../data/ranks';

// ── Rank thresholds: check-in count evidence (spec Mechanic 2) ──────────
// Auto-promotion to a new rankTitle requires a backend migration (pending).
// These thresholds drive the progress bar and "next rank" evidence text only.
const RANK_THRESHOLDS = [
  { title: 'Initiate', minCheckIns: 0   },
  { title: 'Forged',   minCheckIns: 10  },
  { title: 'Vanguard', minCheckIns: 25  },
  { title: 'Elite',    minCheckIns: 50  },
  { title: 'Prime',    minCheckIns: 100 },
  { title: 'Monarch',  minCheckIns: 200 },
];

type WeeklyState = 'secured' | 'tight' | 'done' | 'pending';

// ── Pure helpers ─────────────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getTimePeriod(): 'morning' | 'afternoon' | 'evening' {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function getMascotSpeechKey(period: 'morning' | 'afternoon' | 'evening', state: WeeklyState): string {
  if (state === 'secured') return `${period}.weekSecured`;
  if (state === 'tight')   return `${period}.tight`;
  if (state === 'done')    return `${period}.done`;
  return `${period}.pending`;
}

function getSubLine(state: WeeklyState, checkInsLeft: number, daysLeft: number): string {
  if (state === 'secured') return 'Week secured. Rest is part of discipline.';
  if (state === 'tight')
    return `${checkInsLeft} session${checkInsLeft !== 1 ? 's' : ''} left — ${daysLeft} day${daysLeft !== 1 ? 's' : ''} to go. Make it count.`;
  if (state === 'done') return 'Proved today. The record grows.';
  if (checkInsLeft > 0)
    return `${checkInsLeft} check-in${checkInsLeft !== 1 ? 's' : ''} to close your week.`;
  return 'Your week is yours to define.';
}

// ── Component ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const user          = useAuthStore((s) => s.getUser());
  const openCheckIn   = useGymStore((s) => s.openCheckInModal);

  const containerRef      = useRef<HTMLDivElement>(null);
  const ringHeroRef       = useRef<HTMLDivElement>(null);
  const celebrationTlRef  = useRef<gsap.core.Timeline | null>(null);
  const mascotTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastShownRef     = useRef(false);

  const [mascotOverride, setMascotOverride] = useState<MascotState | undefined>(undefined);
  const [toast, setToast]                   = useState<string | null>(null);
  const [openTrialId, setOpenTrialId]       = useState<number | null>(null);

  const today          = new Date().toISOString().slice(0, 10);
  const checkedInToday = user?.lastCheckInDate === today;
  const firstName      = user?.name.split(' ')[0] ?? '';
  const timePeriod     = getTimePeriod();

  // ── Weekly progress ───────────────────────────────────────────────────
  const weeklyDone = useMemo(() => {
    if (!user) return 0;
    const now = new Date();
    const daysSinceMonday = (now.getDay() + 6) % 7; // Mon=0 … Sun=6
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

  // Days remaining this week (today = Mon → 6 remaining, Sun → 0)
  const daysRemainingInWeek = (() => {
    const day = new Date().getDay(); // 0=Sun
    return day === 0 ? 0 : 7 - day;
  })();

  const checkInsLeft = Math.max(0, weeklyTarget - weeklyDone);

  const weeklyState: WeeklyState = (() => {
    if (weeklyTarget > 0 && weeklyDone >= weeklyTarget) return 'secured';
    if (checkInsLeft > 0 && daysRemainingInWeek > 0 && checkInsLeft >= daysRemainingInWeek) return 'tight';
    if (checkedInToday) return 'done';
    return 'pending';
  })();

  // ── Ring progress values ──────────────────────────────────────────────
  const trialProgress = useMemo(() => {
    if (!user || user.dailyChallenges.length === 0) return 0;
    return user.dailyChallenges.filter((c) => c.completed).length / user.dailyChallenges.length;
  }, [user]);

  const checkInProgress = checkedInToday ? 1 : 0;
  const completedCount  = user?.dailyChallenges.filter((c) => c.completed).length ?? 0;

  // ── Rank evidence ─────────────────────────────────────────────────────
  const rankDef        = getRankByTitle(user?.rankTitle ?? 'Initiate');
  const rankIdx        = Math.max(0, RANK_THRESHOLDS.findIndex((r) => r.title === (user?.rankTitle ?? 'Initiate')));
  const nextRankDef    = RANK_THRESHOLDS[rankIdx + 1] ?? null;
  const curThreshold   = RANK_THRESHOLDS[rankIdx]?.minCheckIns ?? 0;
  const nextThreshold  = nextRankDef?.minCheckIns ?? curThreshold;
  const rankProgress   = nextRankDef && nextThreshold > curThreshold
    ? Math.min(1, Math.max(0, ((user?.checkIns ?? 0) - curThreshold) / (nextThreshold - curThreshold)))
    : 1;

  // ── Mascot speech ─────────────────────────────────────────────────────
  const speechKey = getMascotSpeechKey(timePeriod, weeklyState);

  // ── Tight-week toast (shown once per session) ─────────────────────────
  useEffect(() => {
    if (toastShownRef.current || checkedInToday) return;
    if (weeklyState === 'tight') {
      setToast(`${checkInsLeft} session${checkInsLeft !== 1 ? 's' : ''} left — ${daysRemainingInWeek} day${daysRemainingInWeek !== 1 ? 's' : ''} to go.`);
      toastShownRef.current = true;
    }
  }, [weeklyState, checkedInToday, checkInsLeft, daysRemainingInWeek]);

  // ── GSAP: card stagger entrance ───────────────────────────────────────
  useGSAP(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll('[data-card]');
    gsap.from(cards, {
      opacity: 0,
      y: 12,
      duration: 0.4,
      stagger: 0.07,
      ease: 'power2.out',
      clearProps: 'all',
    });
  }, { scope: containerRef });

  // ── Cleanup on unmount ────────────────────────────────────────────────
  useEffect(() => () => {
    if (mascotTimerRef.current) clearTimeout(mascotTimerRef.current);
    celebrationTlRef.current?.kill();
  }, []);

  // ── Check-in celebration (fires only when ring fills mid-session) ─────
  const handleRingComplete = useCallback(() => {
    // Haptic
    if ('vibrate' in navigator) navigator.vibrate([60, 20, 80]);

    // Ring pulse (GSAP)
    if (ringHeroRef.current) {
      const tl = gsap.timeline();
      celebrationTlRef.current = tl;
      tl.to(ringHeroRef.current, { scale: 1.04, duration: 0.15, ease: 'power2.out' })
        .to(ringHeroRef.current, { scale: 1, duration: 0.35, ease: 'back.out(1.7)' });
    }

    // Gold particle burst — appended to body so card overflow:hidden doesn't clip them
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
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          opacity: 0, scale: 0,
          duration: 0.9, ease: 'power2.out',
        }, 0);
      });
    }

    // Mascot celebrating → auto-reset
    if (mascotTimerRef.current) clearTimeout(mascotTimerRef.current);
    setMascotOverride('celebrating');
    mascotTimerRef.current = setTimeout(() => setMascotOverride(undefined), 3200);
  }, []);

  // ── Guard ─────────────────────────────────────────────────────────────
  if (!user) return null;

  return (
    <div ref={containerRef} className="mx-auto max-w-2xl space-y-4 px-4 py-5 sm:px-6 pb-24">

      {/* ── Tight-week toast ──────────────────────────────────────────── */}
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
              style={{ color: 'var(--text-faint)', padding: 4, minHeight: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Greeting strip ────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 px-1" data-card>
        <div className="min-w-0">
          <p className="text-sm font-medium" style={{ color: 'var(--text-faint)' }}>
            {getGreeting()},
          </p>
          <h1 className="mt-0.5 text-display font-black leading-none tracking-tight text-white truncate">
            {firstName}
          </h1>
          <div className="mt-2.5">
            <RankBadge title={user.rankTitle} size="sm" />
          </div>
          <p className="mt-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {getSubLine(weeklyState, checkInsLeft, daysRemainingInWeek)}
          </p>
        </div>

        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="shrink-0 rounded-2xl object-cover"
            style={{ width: 52, height: 52, border: '1px solid rgba(212,160,23,0.22)' }}
          />
        ) : (
          <div
            className="shrink-0 flex items-center justify-center rounded-2xl text-lg font-black text-black"
            style={{ width: 52, height: 52, background: 'linear-gradient(145deg, var(--gold-light), var(--gold))' }}
            aria-hidden="true"
          >
            {firstName.charAt(0)}
          </div>
        )}
      </div>

      {/* ── Hero Ring Card ────────────────────────────────────────────── */}
      <div className="card-hero p-6 sm:p-8" data-card>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Rings */}
          <div ref={ringHeroRef} className="shrink-0">
            <Ring
              checkIn={checkInProgress}
              trial={trialProgress}
              weekly={weeklyProgress}
              size={220}
              shieldActive={user.freezeTokens > 0}
              onCheckInComplete={handleRingComplete}
            />
          </div>

          {/* Right column: mascot + streak */}
          <div className="flex-1 flex flex-col items-center sm:items-start gap-4 w-full">
            <Mascot
              override={mascotOverride}
              size={80}
              speechKey={speechKey}
            />

            <div className="text-center sm:text-left">
              <p className="label">Days Unbroken</p>
              <p
                className="mt-0.5 tabular-nums leading-none"
                style={{
                  fontFamily: 'Space Grotesk, system-ui, sans-serif',
                  fontSize: 'clamp(3rem, 10vw, 4.5rem)',
                  fontWeight: 900,
                  color: user.streak > 0 ? 'var(--gold)' : 'var(--text-faint)',
                }}
                aria-label={`${user.streak} day streak`}
              >
                {user.streak}
              </p>

              {/* Streak shields */}
              {user.freezeTokens > 0 && (
                <div className="mt-2 flex items-center justify-center sm:justify-start gap-1.5" role="list" aria-label="Streak shields banked">
                  {Array.from({ length: Math.min(user.freezeTokens, 2) }).map((_, i) => (
                    <span
                      key={i}
                      role="listitem"
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                      style={{
                        background: 'rgba(61,127,212,0.1)',
                        border: '1px solid rgba(61,127,212,0.25)',
                        color: 'var(--steel)',
                      }}
                    >
                      <Shield size={9} aria-hidden="true" />
                      Shield
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Ring legend */}
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--gold)' }} aria-hidden="true" />
                Check-in
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--steel)' }} aria-hidden="true" />
                Trials
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--success)' }} aria-hidden="true" />
                Week
              </span>
            </div>
          </div>
        </div>

        {/* Weekly arc */}
        <div className="mt-6">
          <WeeklyArc
            progress={weeklyProgress}
            weeklyDone={weeklyDone}
            weeklyTarget={weeklyTarget}
          />
        </div>

        {/* Primary CTA */}
        <div className="mt-5">
          {checkedInToday ? (
            <div
              className="inline-flex items-center gap-2.5 rounded-full px-5 py-2.5"
              style={{ background: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.2)' }}
            >
              <CheckCircle size={14} style={{ color: 'var(--success)' }} aria-hidden="true" />
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--success)' }}>
                Committed Today
              </span>
            </div>
          ) : (
            <Button
              variant="primary"
              onClick={openCheckIn}
              className="w-full sm:w-auto"
              aria-label="Open check-in verification"
            >
              Prove Today
              <ArrowRight size={14} aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>

      {/* ── Bento grid: sessions + rank ───────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Sessions logged */}
        <div className="card p-5" data-card>
          <p className="label">Sessions Logged</p>
          <p className="mt-2 text-3xl font-black text-white">
            <StatCounter
              value={user.checkIns}
              aria-label={`${user.checkIns} total sessions`}
              className="tabular-nums"
            />
          </p>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--text-faint)' }}>
            verified check-ins
          </p>

          <div className="divider my-3" />

          <p className="label">Longest Run</p>
          <p className="mt-1 text-xl font-black text-white tabular-nums">
            {user.longestStreak}
            <span className="ml-1 text-xs font-semibold" style={{ color: 'var(--text-faint)' }}>days</span>
          </p>
        </div>

        {/* Rank evidence */}
        <div className="card p-5 flex flex-col" data-card>
          <p className="label mb-2.5">Your Rank</p>
          <RankBadge title={user.rankTitle} size="sm" />

          <p
            className="mt-2.5 text-xs leading-relaxed line-clamp-3"
            style={{ color: 'var(--text-faint)', fontSize: '0.6875rem' }}
          >
            {rankDef.manifesto}
          </p>

          {nextRankDef && (
            <div className="mt-auto pt-3">
              <div className="flex items-center justify-between mb-1.5">
                <p className="label">→ {nextRankDef.title}</p>
                <p className="label" style={{ color: rankDef.color }}>
                  {user.checkIns}/{nextRankDef.minCheckIns}
                </p>
              </div>
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{ background: 'var(--bg-overlay-2)' }}
                role="progressbar"
                aria-valuenow={user.checkIns}
                aria-valuemin={curThreshold}
                aria-valuemax={nextThreshold}
                aria-label={`${user.checkIns} of ${nextThreshold} check-ins toward ${nextRankDef.title}`}
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

      {/* ── Today's Trials ────────────────────────────────────────────── */}
      <div className="card p-5" data-card>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="label">Today's Trials</p>
            {checkedInToday && (
              <h2 className="mt-1 text-lg font-black text-white">
                {completedCount === 3 ? 'All Cleared' : `${completedCount} of 3 Done`}
              </h2>
            )}
          </div>
          {checkedInToday && (
            <span
              className="shrink-0 rounded-full px-3 py-1 text-xs font-bold tabular-nums"
              style={
                completedCount === 3
                  ? { background: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.2)', color: 'var(--success)' }
                  : { background: 'var(--gold-faint)', border: '1px solid rgba(212,160,23,0.22)', color: 'var(--gold)' }
              }
              aria-label={`${completedCount} of 3 trials complete`}
            >
              {completedCount}/3
            </span>
          )}
        </div>

        {!checkedInToday ? (
          <div
            className="rounded-2xl py-8 text-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <p className="text-sm font-semibold text-white">Trials unlock after check-in.</p>
            <p className="mt-1 text-xs" style={{ color: 'var(--text-faint)' }}>
              Prove your presence first.
            </p>
          </div>
        ) : user.dailyChallenges.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {user.dailyChallenges.map((c) => (
              <ChallengeCard key={c.id} id={c.id} completed={c.completed} onOpen={() => setOpenTrialId(c.id)} />
            ))}
          </div>
        ) : (
          <div
            className="rounded-2xl py-8 text-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <p className="text-sm font-semibold text-white">Generating today's trials…</p>
          </div>
        )}
      </div>

      {/* ── Gym Community ─────────────────────────────────────────────── */}
      <GymFeedCard />

      <TrialSheet trialId={openTrialId} onClose={() => setOpenTrialId(null)} />
      <CheckInModal />
    </div>
  );
}
