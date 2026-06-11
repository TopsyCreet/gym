/**
 * StatCounter — GSAP count-up animation triggered by ScrollTrigger.
 * Framer Motion owns nothing here.
 */

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface StatCounterProps {
  value: number;
  /** suffix to display after number, e.g. "%" or "d" */
  suffix?: string;
  prefix?: string;
  /** decimal places (default 0) */
  decimals?: number;
  duration?: number;
  className?: string;
  'aria-label'?: string;
}

export default function StatCounter({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  duration = 1.5,
  className = '',
  'aria-label': ariaLabel,
}: StatCounterProps) {
  const spanRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    if (!spanRef.current) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: spanRef.current,
        start: 'top 88%',
        once: true,
      },
      onUpdate: () => {
        if (spanRef.current) {
          const formatted = obj.val.toFixed(decimals);
          const localized = decimals === 0
            ? Math.round(obj.val).toLocaleString()
            : parseFloat(formatted).toLocaleString(undefined, { minimumFractionDigits: decimals });
          spanRef.current.textContent = `${prefix}${localized}${suffix}`;
        }
      },
    });
    // Set initial so screen readers see the final value
    spanRef.current.textContent = `${prefix}${value.toLocaleString()}${suffix}`;
  }, { dependencies: [value] });

  return (
    <span
      ref={spanRef}
      className={`tabular-nums ${className}`}
      aria-label={ariaLabel ?? `${prefix}${value.toLocaleString()}${suffix}`}
    >
      {prefix}{value.toLocaleString()}{suffix}
    </span>
  );
}
