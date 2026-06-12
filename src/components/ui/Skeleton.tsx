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

/** Matches the height and layout of a FeedItemRow */
export function FeedRowSkeleton() {
  return (
    <div
      className="flex items-center gap-3 py-3"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      aria-hidden="true"
    >
      <Skeleton width={36} height={36} rounded="9999px" />
      <div className="flex-1 space-y-1.5">
        <Skeleton height={11} width="60%" />
        <Skeleton height={9}  width="38%" />
      </div>
      <Skeleton width={44} height={32} rounded="12px" />
    </div>
  );
}
