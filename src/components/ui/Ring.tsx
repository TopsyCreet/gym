/**
 * Ring — Apple Watch-style concentric progress rings.
 *
 * Three rings rendered in a single SVG:
 *   A (outer, gold)   → daily check-in (0–1)
 *   B (middle, steel) → daily trial completion (0–1)
 *   W (inner arc)     → weekly commitment progress (0–1), separate smaller element
 *
 * GSAP owns all arc sweeps (stroke-dashoffset).
 * Framer Motion owns nothing on this component.
 */

import { useRef, useEffect, useId } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

// Register GSAP plugins once at module level
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

// ── Geometry constants ─────────────────────────────────────
const CX = 100;     // centre x of 200×200 viewBox
const CY = 100;     // centre y
const STROKE_A = 12;
const STROKE_B = 10;
const STROKE_W = 8;
const R_A = 82;    // outer ring radius
const R_B = 64;    // middle ring radius
const R_W = 46;    // inner weekly ring radius

const circ = (r: number) => 2 * Math.PI * r;

// ── Types ──────────────────────────────────────────────────
export interface RingProps {
  /** 0–1: today's verified check-in */
  checkIn: number;
  /** 0–1: daily trial completed */
  trial: number;
  /** 0–1: weekly commitment progress */
  weekly: number;
  /** size in px (renders as a square) */
  size?: number;
  /** show shield icon inside weekly ring when shield is active */
  shieldActive?: boolean;
  /** aria label for the whole ring group */
  label?: string;
  className?: string;
  /** callback fired when check-in ring completes (hits 1) */
  onCheckInComplete?: () => void;
}

function RingArc({
  r,
  progress,
  stroke,
  strokeWidth,
  trackOpacity = 0.08,
  delay = 0,
  gradientId,
}: {
  r: number;
  progress: number;
  stroke: string;
  strokeWidth: number;
  trackOpacity?: number;
  delay?: number;
  gradientId: string;
}) {
  const arcRef = useRef<SVGCircleElement>(null);
  const circumference = circ(r);
  const clampedProgress = Math.min(1, Math.max(0, progress));

  useGSAP(() => {
    if (!arcRef.current) return;
    const target = circumference * (1 - clampedProgress);
    gsap.to(arcRef.current, {
      strokeDashoffset: target,
      duration: 1.2,
      delay,
      ease: 'power2.out',
    });
  }, { dependencies: [clampedProgress, circumference] });

  return (
    <g aria-hidden="true">
      {/* Track (background circle) */}
      <circle
        cx={CX} cy={CY} r={r}
        fill="none"
        stroke={stroke}
        strokeOpacity={trackOpacity}
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <circle
        ref={arcRef}
        cx={CX} cy={CY} r={r}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference}          // GSAP animates from here
        transform={`rotate(-90 ${CX} ${CY})`}    // start at 12 o'clock
      />
    </g>
  );
}

export default function Ring({
  checkIn,
  trial,
  weekly,
  size = 220,
  shieldActive = false,
  label,
  className = '',
  onCheckInComplete,
}: RingProps) {
  const idPrefix = useId().replace(/:/g, '');
  const prevCheckIn = useRef(checkIn);

  // Fire completion callback when check-in ring reaches 1
  useEffect(() => {
    if (checkIn >= 1 && prevCheckIn.current < 1 && onCheckInComplete) {
      onCheckInComplete();
    }
    prevCheckIn.current = checkIn;
  }, [checkIn, onCheckInComplete]);

  const ariaLabel = label
    ?? `Check-in ring ${Math.round(checkIn * 100)}% complete. Trial ring ${Math.round(trial * 100)}% complete. Weekly progress ${Math.round(weekly * 100)}%.`;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        role="img"
        aria-label={ariaLabel}
      >
        <defs>
          {/* Gold gradient for check-in ring */}
          <linearGradient id={`${idPrefix}-grad-a`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="var(--gold-muted)" />
            <stop offset="50%"  stopColor="var(--gold)" />
            <stop offset="100%" stopColor="var(--gold-light)" />
          </linearGradient>
          {/* Steel gradient for trial ring */}
          <linearGradient id={`${idPrefix}-grad-b`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="var(--steel)" />
            <stop offset="100%" stopColor="var(--steel-light)" />
          </linearGradient>
          {/* Success gradient for weekly ring */}
          <linearGradient id={`${idPrefix}-grad-w`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="var(--success)" />
            <stop offset="100%" stopColor="#2ECC71" />
          </linearGradient>
        </defs>

        {/* Ring A — check-in (gold, outermost) */}
        <RingArc
          r={R_A}
          progress={checkIn}
          stroke="var(--gold)"
          strokeWidth={STROKE_A}
          gradientId={`${idPrefix}-grad-a`}
          delay={0}
        />

        {/* Ring B — daily trial (steel, middle) */}
        <RingArc
          r={R_B}
          progress={trial}
          stroke="var(--steel)"
          strokeWidth={STROKE_B}
          gradientId={`${idPrefix}-grad-b`}
          delay={0.08}
        />

        {/* Ring W — weekly commitment (success green, innermost) */}
        <RingArc
          r={R_W}
          progress={weekly}
          stroke="var(--success)"
          strokeWidth={STROKE_W}
          gradientId={`${idPrefix}-grad-w`}
          delay={0.16}
        />

        {/* Centre: check-in percentage or shield icon */}
        <text
          x={CX} y={CY - 6}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={checkIn >= 1 ? 'var(--gold)' : 'var(--text-secondary)'}
          fontSize="18"
          fontWeight="900"
          fontFamily="Space Grotesk, system-ui, sans-serif"
          aria-hidden="true"
        >
          {checkIn >= 1 ? '✓' : shieldActive ? '🛡' : `${Math.round(checkIn * 100)}%`}
        </text>
        <text
          x={CX} y={CY + 12}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--text-faint)"
          fontSize="8"
          fontWeight="700"
          fontFamily="Space Grotesk, system-ui, sans-serif"
          letterSpacing="0.12em"
          aria-hidden="true"
        >
          {checkIn >= 1 ? 'PROVED' : 'CHECK-IN'}
        </text>
      </svg>
    </div>
  );
}

// ── Weekly arc — standalone horizontal bar ─────────────────
// Used below the ring pair on Dashboard hero card.
export function WeeklyArc({
  progress,
  weeklyTarget,
  weeklyDone,
  className = '',
}: {
  progress: number;  // 0–1
  weeklyTarget: number;
  weeklyDone: number;
  className?: string;
}) {
  const barRef = useRef<SVGRectElement>(null);
  const TOTAL_W = 280;
  const HEIGHT  = 6;
  const RADIUS  = 3;

  useGSAP(() => {
    if (!barRef.current) return;
    gsap.to(barRef.current, {
      width: TOTAL_W * Math.min(1, progress),
      duration: 1.4,
      ease: 'power2.out',
    });
  }, { dependencies: [progress] });

  return (
    <div
      className={`w-full ${className}`}
      role="img"
      aria-label={`Weekly commitment: ${weeklyDone} of ${weeklyTarget} sessions complete`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="label">Weekly Commitment</span>
        <span className="label" style={{ color: 'var(--gold)' }}>
          {weeklyDone}/{weeklyTarget}
        </span>
      </div>
      <svg width="100%" height={HEIGHT} viewBox={`0 0 ${TOTAL_W} ${HEIGHT}`} preserveAspectRatio="none">
        {/* Track */}
        <rect x={0} y={0} width={TOTAL_W} height={HEIGHT} rx={RADIUS} fill="var(--bg-overlay-2)" />
        {/* Progress fill — GSAP animates width from 0 */}
        <rect
          ref={barRef}
          x={0} y={0}
          width={0}
          height={HEIGHT}
          rx={RADIUS}
          fill="url(#weekly-bar-grad)"
        />
        <defs>
          <linearGradient id="weekly-bar-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="var(--gold-muted)" />
            <stop offset="100%" stopColor="var(--gold-light)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
