/**
 * Skeleton shimmer — all async Supabase content uses this while loading.
 * Uses Tailwind's shimmer animation defined in index.css.
 */

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: string;
  'aria-label'?: string;
}

export function Skeleton({
  className = '',
  width,
  height,
  rounded = '8px',
  'aria-label': ariaLabel = 'Loading…',
}: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: rounded }}
    />
  );
}

/** Convenience preset for a text line */
export function SkeletonText({ lines = 1, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`} role="status" aria-label="Loading text…">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={i === lines - 1 && lines > 1 ? '72%' : '100%'}
        />
      ))}
    </div>
  );
}

/** Convenience preset for a card placeholder */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`card p-5 space-y-3 ${className}`} role="status" aria-label="Loading card…">
      <Skeleton height={12} width="40%" />
      <Skeleton height={36} width="60%" />
      <Skeleton height={14} width="80%" />
      <Skeleton height={14} width="55%" />
    </div>
  );
}
