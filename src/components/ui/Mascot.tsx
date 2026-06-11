/**
 * Mascot — emotional state machine over existing Zustand app state.
 *
 * GSAP owns: idle animations + wave greeting.
 * Framer Motion owns: state-change mount/unmount transition.
 *
 * Wave greeting: plays once on mount (waveOnMount prop), then idle takes over.
 * "Sad" state auto-returns to "encouraging" after 4 s.
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useAuthStore } from '../../store/authStore';
import { mascotStrings } from '../../content/mascotStrings';

// ── Asset imports ──────────────────────────────────────────
import neutralPng      from '../../assets/brand/mascot_neutral.png';
import happyPng        from '../../assets/brand/mascot_happy.png';
import celebratingPng  from '../../assets/brand/mascot_celebrating.png';
import encouragingPng  from '../../assets/brand/mascot_encouraging.png';
import worriedPng      from '../../assets/brand/mascot_worried.png';
import sadPng          from '../../assets/brand/mascot_sad.png';

// ── Types ──────────────────────────────────────────────────
export type MascotState =
  | 'neutral'
  | 'happy'
  | 'celebrating'
  | 'encouraging'
  | 'worried'
  | 'sad';

const ASSET: Record<MascotState, string> = {
  neutral:     neutralPng,
  happy:       happyPng,
  celebrating: celebratingPng,
  encouraging: encouragingPng,
  worried:     worriedPng,
  sad:         sadPng,
};

const ARIA_LABEL: Record<MascotState, string> = {
  neutral:     'Prime mascot, neutral expression',
  happy:       'Prime mascot, happy — check-in recorded',
  celebrating: 'Prime mascot, celebrating a milestone',
  encouraging: 'Prime mascot, encouraging — check in today',
  worried:     'Prime mascot, concerned — commitment at risk this week',
  sad:         'Prime mascot, disappointed — weekly commitment missed',
};

// ── State derivation ───────────────────────────────────────
export function deriveMascotState({
  checkedInToday,
  weeklyDone,
  weeklyTarget,
  daysRemainingInWeek,
  streakJustBroken,
  weeklyGoalJustCompleted,
  streakMilestone,
}: {
  checkedInToday: boolean;
  weeklyDone: number;
  weeklyTarget: number;
  daysRemainingInWeek: number;
  streakJustBroken: boolean;
  weeklyGoalJustCompleted: boolean;
  streakMilestone: boolean;
}): MascotState {
  if (streakJustBroken) return 'sad';
  if (weeklyGoalJustCompleted || streakMilestone) return 'celebrating';
  if (checkedInToday) return 'happy';
  const checkInsLeft = weeklyTarget - weeklyDone;
  if (checkInsLeft > 0 && checkInsLeft >= daysRemainingInWeek) return 'worried';
  return 'encouraging';
}

// ── Hook: derive state from Zustand ────────────────────────
function useMascotState(override?: MascotState): MascotState {
  const user = useAuthStore((state) => state.getUser());
  if (override) return override;
  if (!user) return 'encouraging';

  const today = new Date().toISOString().slice(0, 10);
  const checkedInToday = user.lastCheckInDate === today;
  const dayOfWeek = new Date().getDay();
  const daysRemainingInWeek = Math.max(1, 7 - dayOfWeek);

  const weeklyDone = (() => {
    const now = new Date();
    const daysSinceMonday = (now.getDay() + 6) % 7;
    let count = 0;
    for (let i = daysSinceMonday; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      if (user.attendanceHistory[d.toISOString().slice(0, 10)]) count++;
    }
    return count;
  })();

  const weeklyTarget = user.schedule.length;

  return deriveMascotState({
    checkedInToday,
    weeklyDone,
    weeklyTarget,
    daysRemainingInWeek,
    streakJustBroken: false,
    weeklyGoalJustCompleted: weeklyDone >= weeklyTarget && weeklyTarget > 0,
    streakMilestone: false,
  });
}

// ── Props ──────────────────────────────────────────────────
interface MascotProps {
  override?: MascotState;
  size?: number;
  speechKey?: string | null;
  className?: string;
  suppressIdle?: boolean;
  /** Play a friendly wave greeting on mount before the idle loop starts */
  waveOnMount?: boolean;
}

export default function Mascot({
  override,
  size = 120,
  speechKey,
  className = '',
  suppressIdle = false,
  waveOnMount = false,
}: MascotProps) {
  const mascotState = useMascotState(override);
  const [displayState, setDisplayState] = useState<MascotState>(mascotState);
  // waveComplete gates the idle loop — starts false only when waveOnMount is true
  const [waveComplete, setWaveComplete] = useState(!waveOnMount);
  const imgRef = useRef<HTMLImageElement>(null);
  const idleTl = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null);

  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // "Sad" auto-returns to "encouraging" after 4s
  useEffect(() => {
    setDisplayState(mascotState);
    if (mascotState === 'sad') {
      const t = setTimeout(() => setDisplayState('encouraging'), 4000);
      return () => clearTimeout(t);
    }
  }, [mascotState]);

  // ── One-shot wave greeting ─────────────────────────────────
  useGSAP(() => {
    if (waveComplete || !imgRef.current) return;
    const el = imgRef.current;

    gsap.set(el, { transformOrigin: 'bottom center' });

    if (prefersReduced) {
      setWaveComplete(true);
      return;
    }

    const tl = gsap.timeline({
      delay: 0.5,
      onComplete: () => {
        gsap.set(el, { clearProps: 'all' });
        setWaveComplete(true);
      },
    });

    // Friendly greeting rock: lean back → bow forward → wave right → left → settle
    tl.to(el, { rotation: -8, y: -4, duration: 0.25, ease: 'power2.out' })
      .to(el, { rotation: 18, y: -10, scaleX: 0.95, duration: 0.28, ease: 'power2.out' })
      .to(el, { rotation: -12, y: -6, duration: 0.22, ease: 'sine.inOut' })
      .to(el, { rotation: 14, y: -10, duration: 0.22, ease: 'sine.inOut' })
      .to(el, { rotation: -6, y: -3, duration: 0.18, ease: 'sine.inOut' })
      .to(el, { rotation: 0, y: 0, scaleX: 1, duration: 0.4, ease: 'back.out(1.6)' });

    return () => tl.kill();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, { dependencies: [] }); // run once on mount

  // ── State-specific idle animation ─────────────────────────
  useGSAP(() => {
    if (!waveComplete || suppressIdle || !imgRef.current) return;
    const el = imgRef.current;

    idleTl.current?.kill();
    gsap.set(el, { clearProps: 'all' });
    // Set transform origin once — avoids jitter from per-tween overrides
    gsap.set(el, { transformOrigin: 'bottom center' });

    if (prefersReduced) {
      idleTl.current = gsap.to(el, {
        scale: 1.015,
        duration: 3,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
      return;
    }

    switch (displayState) {

      // Squash → launch → bounce land → rotation rock
      case 'celebrating': {
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
        tl.to(el, { scaleX: 1.14, scaleY: 0.86, duration: 0.14, ease: 'power2.in' })
          .to(el, { scaleX: 0.86, scaleY: 1.2, y: -26, duration: 0.28, ease: 'power3.out' })
          .to(el, { scaleX: 1.08, scaleY: 0.92, y: 0, duration: 0.2, ease: 'power2.in' })
          .to(el, { scaleX: 1, scaleY: 1, duration: 0.22, ease: 'elastic.out(1, 0.5)' })
          .to(el, { rotation: 13, duration: 0.14, ease: 'power2.in' }, '+=0.05')
          .to(el, { rotation: -11, duration: 0.2, ease: 'sine.inOut' })
          .to(el, { rotation: 0, duration: 0.18, ease: 'power2.out' });
        idleTl.current = tl;
        break;
      }

      // Gentle lift and soft land
      case 'happy': {
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
        tl.to(el, { y: -11, scaleY: 1.05, scaleX: 0.96, duration: 0.55, ease: 'power2.out' })
          .to(el, { y: 0, scaleY: 1, scaleX: 1, duration: 0.5, ease: 'elastic.out(1, 0.6)' });
        idleTl.current = tl;
        break;
      }

      // Peppy hop with natural arc
      case 'encouraging': {
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.0 });
        tl.to(el, { scaleX: 1.04, scaleY: 0.96, duration: 0.12, ease: 'power2.in' })
          .to(el, { y: -10, scaleX: 0.95, scaleY: 1.07, duration: 0.35, ease: 'power3.out' })
          .to(el, { y: 0, scaleX: 1, scaleY: 1, duration: 0.38, ease: 'elastic.out(1, 0.55)' });
        idleTl.current = tl;
        break;
      }

      // Anxious tremble — decelerating shakes feel organic
      case 'worried': {
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.6 });
        tl.to(el, { x: -6, duration: 0.08, ease: 'power2.inOut' })
          .to(el, { x: 6, duration: 0.08, ease: 'power2.inOut' })
          .to(el, { x: -4, duration: 0.07, ease: 'power1.inOut' })
          .to(el, { x: 4, duration: 0.07, ease: 'power1.inOut' })
          .to(el, { x: -2, duration: 0.06, ease: 'sine.inOut' })
          .to(el, { x: 0, duration: 0.1, ease: 'sine.out' });
        idleTl.current = tl;
        break;
      }

      // Heavy sagging sigh — slow and weighted
      case 'sad': {
        idleTl.current = gsap.to(el, {
          scaleY: 0.92,
          scaleX: 1.06,
          y: 6,
          duration: 2.6,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
        break;
      }

      // Calm minimal breathe (neutral / fallback)
      default: {
        idleTl.current = gsap.to(el, {
          scaleY: 1.022,
          scaleX: 0.984,
          duration: 2.4,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
      }
    }

    return () => {
      idleTl.current?.kill();
      gsap.set(el, { clearProps: 'all' });
    };
  }, { dependencies: [waveComplete, suppressIdle, displayState, prefersReduced] });

  const src = ASSET[displayState];
  const alt = ARIA_LABEL[displayState];

  const getSpeech = useCallback((): string | null => {
    if (!speechKey) return null;
    const keys = speechKey.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let obj: any = mascotStrings;
    for (const k of keys) {
      if (obj && typeof obj === 'object' && k in obj) obj = obj[k];
      else return null;
    }
    return typeof obj === 'string' ? obj : null;
  }, [speechKey]);

  const speechText = getSpeech();

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      {/* Speech bubble */}
      <AnimatePresence>
        {speechText && (
          <motion.div
            key={speechText}
            initial={{ opacity: 0, y: 6, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.25, 0, 0.15, 1] }}
            className="mb-2 max-w-[200px] rounded-2xl px-3.5 py-2.5 text-center"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.7rem',
              fontWeight: 600,
              lineHeight: 1.45,
              color: 'var(--text-secondary)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
            }}
            role="status"
            aria-live="polite"
          >
            {speechText}
            <span
              aria-hidden="true"
              className="absolute left-1/2 -translate-x-1/2 -bottom-[7px]"
              style={{
                width: 0, height: 0,
                borderLeft: '7px solid transparent',
                borderRight: '7px solid transparent',
                borderTop: '7px solid var(--bg-elevated)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot image with state transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={displayState}
          initial={{ opacity: 0, scale: prefersReduced ? 1 : 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: prefersReduced ? 1 : 0.92 }}
          transition={{ duration: prefersReduced ? 0.01 : 0.22, ease: [0.25, 0, 0.15, 1] }}
          style={{ width: size, height: size }}
        >
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            width={size}
            height={size}
            style={{ width: size, height: size, objectFit: 'contain' }}
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
