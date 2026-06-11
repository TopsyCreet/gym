/**
 * Mascot — emotional state machine over existing Zustand app state.
 *
 * The mascot is a SELECTOR: it reads auth/gym state and derives
 * which emotion to display. It never holds its own source of truth.
 *
 * GSAP owns: idle breathing loop.
 * Framer Motion owns: state-change mount/unmount transition.
 *
 * Placement rules from spec:
 *  - Never block content or interrupt a check-in flow in progress.
 *  - Speech bubbles are optional (pass speechKey prop).
 *  - "sad" state auto-returns to "encouraging" after 4 s.
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

// ── State derivation (pure function — easy to test) ────────
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
  // Tight: check-ins remaining >= days remaining (must go every remaining day)
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

  // Weekly calculation
  const dayOfWeek = new Date().getDay(); // 0=Sun
  const daysRemainingInWeek = Math.max(1, 7 - dayOfWeek);

  // Count check-ins this calendar week (Mon–Sun)
  const weeklyDone = (() => {
    const now = new Date();
    const daysSinceMonday = (now.getDay() + 6) % 7;
    let count = 0;
    for (let i = daysSinceMonday; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      if (user.attendanceHistory[key]) count++;
    }
    return count;
  })();

  const weeklyTarget = user.schedule.length;

  return deriveMascotState({
    checkedInToday,
    weeklyDone,
    weeklyTarget,
    daysRemainingInWeek,
    streakJustBroken: false,      // set externally via override prop
    weeklyGoalJustCompleted: weeklyDone >= weeklyTarget && weeklyTarget > 0,
    streakMilestone: false,        // set externally via override prop
  });
}

// ── Props ──────────────────────────────────────────────────
interface MascotProps {
  /** Force a specific state (for onboarding, celebrations, etc.) */
  override?: MascotState;
  /** Size in px */
  size?: number;
  /** Render a speech bubble with this key from mascotStrings */
  speechKey?: string | null;
  className?: string;
  /** Suppress idle GSAP loop (e.g. when GSAP celebration is driving) */
  suppressIdle?: boolean;
}

export default function Mascot({
  override,
  size = 120,
  speechKey,
  className = '',
  suppressIdle = false,
}: MascotProps) {
  const mascotState = useMascotState(override);
  const [displayState, setDisplayState] = useState<MascotState>(mascotState);
  const imgRef = useRef<HTMLImageElement>(null);
  const idleTl = useRef<gsap.core.Tween | null>(null);

  // "Sad" auto-returns to "encouraging" after 4s (spec: never punish repeatedly)
  useEffect(() => {
    setDisplayState(mascotState);
    if (mascotState === 'sad') {
      const t = setTimeout(() => setDisplayState('encouraging'), 4000);
      return () => clearTimeout(t);
    }
  }, [mascotState]);

  // GSAP idle: subtle breathing loop
  useGSAP(() => {
    if (suppressIdle || !imgRef.current) return;

    idleTl.current = gsap.to(imgRef.current, {
      scaleY: 1.025,
      scaleX: 0.985,
      transformOrigin: 'bottom center',
      duration: 2.2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    return () => { idleTl.current?.kill(); };
  }, { dependencies: [suppressIdle, displayState] });

  // Respect prefers-reduced-motion
  const prefersReduced = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const src = ASSET[displayState];
  const alt = ARIA_LABEL[displayState];

  const getSpeech = useCallback((): string | null => {
    if (!speechKey) return null;
    // Allow dot-notation keys like "morning.pending"
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
      {/* Speech bubble — appears above mascot */}
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
            {/* Bubble tail */}
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
