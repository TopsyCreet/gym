/**
 * Ring — Apple Watch-style concentric progress rings.
 *
 * Three rings rendered in a single SVG:
 *   A (outer, gold)      → daily check-in (0–1)
 *   B (middle, steel)    → daily trial completion (0–1)
 *   W (inner, gold-tint) → weekly commitment progress (0–1)
 *
 * GSAP owns all arc sweeps (stroke-dashoffset) and the glow-dot position.
 * Framer Motion owns nothing on this component.
 */

import { useRef, useEffect, useId } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

// ── Geometry constants ─────────────────────────────────────
const CX = 100;
const CY = 100;
// Outer ring thickest for visual hierarchy
const STROKE_A = 14;
const STROKE_B = 10;
const STROKE_W = 7;
// Radii chosen for ~5px visible gap between rings
const R_A = 82;
const R_B = 64;
const R_W = 48;

const circ = (r: number) => 2 * Math.PI * r;

// ── Types ──────────────────────────────────────────────────
export interface RingProps {
  checkIn:  number;
  trial:    number;
  weekly:   number;
  size?:    number;
  shieldActive?: boolean;
  label?:   string;
  className?: string;
  onCheckInComplete?: () => void;
}

// ── RingArc ────────────────────────────────────────────────
function RingArc({
  r,
  progress,
  stroke,
  strokeWidth,
  trackOpacity = 0.13,
  delay = 0,
  gradientId,
  showGlow = false,
}: {
  r: number;
  progress: number;
  stroke: string;
  strokeWidth: number;
  trackOpacity?: number;
  delay?: number;
  gradientId: string;
  showGlow?: boolean;
}) {
  const arcRef   = useRef<SVGCircleElement>(null);
  const glowRef  = useRef<SVGCircleElement>(null);
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
      onUpdate: () => {
        if (!showGlow || !glowRef.current || !arcRef.current) return;
        const currentOffset = parseFloat(
          arcRef.current.getAttribute('stroke-dashoffset') ?? String(circumference)
        );
        const p = Math.max(0, 1 - currentOffset / circumference);
        const angle = -Math.PI / 2 + p * 2 * Math.PI;
        glowRef.current.setAttribute('cx', String(CX + r * Math.cos(angle)));
        glowRef.current.setAttribute('cy', String(CY + r * Math.sin(angle)));
      },
    });
  }, { dependencies: [clampedProgress, circumference] });

  // Initial glow position at 12 o'clock
  const initAngle = -Math.PI / 2 + clampedProgress * 2 * Math.PI;
  const glowX = CX + r * Math.cos(initAngle);
  const glowY = CY + r * Math.sin(initAngle);

  return (
    <g aria-hidden="true">
      {/* Track */}
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
        strokeDashoffset={circumference}
        transform={`rotate(-90 ${CX} ${CY})`}
      />
      {/* Glow dot at arc tip — gold ring only */}
      {showGlow && clampedProgress > 0.02 && (
        <circle
          ref={glowRef}
          cx={glowX}
          cy={glowY}
          r={strokeWidth / 2 + 1}
          fill="var(--gold-light)"
          filter={`url(#glow-filter)`}
          opacity={0.85}
        />
      )}
    </g>
  );
}

// ── Main Ring component ────────────────────────────────────
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

  useEffect(() => {
    if (checkIn >= 1 && prevCheckIn.current < 1 && onCheckInComplete) {
      onCheckInComplete();
    }
    prevCheckIn.current = checkIn;
  }, [checkIn, onCheckInComplete]);

  const ariaLabel = label
    ?? `Check-in ${Math.round(checkIn * 100)}% complete. Trial ${Math.round(trial * 100)}% complete. Weekly ${Math.round(weekly * 100)}%.`;

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
          {/* Shared blur filter for glow dot */}
          <filter id="glow-filter" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gold gradient — darker at base, brighter toward tip */}
          <linearGradient id={`${idPrefix}-grad-a`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="var(--gold-muted)" />
            <stop offset="55%"  stopColor="var(--gold)" />
            <stop offset="100%" stopColor="var(--gold-light)" />
          </linearGradient>

          {/* Steel gradient for trial ring */}
          <linearGradient id={`${idPrefix}-grad-b`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="var(--steel)" />
            <stop offset="100%" stopColor="var(--steel-light)" />
          </linearGradient>

          {/* Gold-tint gradient for weekly ring */}
          <linearGradient id={`${idPrefix}-grad-w`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="var(--gold-muted)" />
            <stop offset="100%" stopColor="#E8C766" />
          </linearGradient>
        </defs>

        {/* Ring A — check-in (gold, outermost, with glow dot) */}
        <RingArc
          r={R_A}
          progress={checkIn}
          stroke="var(--gold)"
          strokeWidth={STROKE_A}
          gradientId={`${idPrefix}-grad-a`}
          delay={0}
          showGlow
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

        {/* Ring W — weekly commitment (gold tint, innermost) */}
        <RingArc
          r={R_W}
          progress={weekly}
          stroke="#E8C766"
          strokeWidth={STROKE_W}
          gradientId={`${idPrefix}-grad-w`}
          delay={0.16}
        />
      </svg>

      {/* Centre overlay — Inter font, no SVG text elements */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        aria-hidden="true"
      >
        {checkIn >= 1 ? (
          <span
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '2rem',
              fontWeight: 900,
              color: 'var(--gold)',
              lineHeight: 1,
            }}
          >
            ✓
          </span>
        ) : shieldActive ? (
          <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>🛡</span>
        ) : (
          <span
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '0.6rem',
              fontWeight: 800,
              color: 'var(--text-secondary)',
              letterSpacing: '0.18em',
              textAlign: 'center',
              lineHeight: 1.5,
              textTransform: 'uppercase',
            }}
          >
            PROVE<br />TODAY
          </span>
        )}
      </div>
    </div>
  );
}

// ── Weekly arc — standalone horizontal bar ─────────────────
export function WeeklyArc({
  progress,
  weeklyTarget,
  weeklyDone,
  className = '',
}: {
  progress: number;
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
        {weeklyTarget > 0 ? (
          <span className="label" style={{ color: 'var(--gold)' }}>
            {weeklyDone}/{weeklyTarget}
          </span>
        ) : (
          <span className="label" style={{ color: 'var(--text-faint)' }}>Not set</span>
        )}
      </div>
      <svg width="100%" height={HEIGHT} viewBox={`0 0 ${TOTAL_W} ${HEIGHT}`} preserveAspectRatio="none">
        <rect x={0} y={0} width={TOTAL_W} height={HEIGHT} rx={RADIUS} fill="var(--bg-overlay-2)" />
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
            <stop offset="100%" stopColor="#E8C766" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
