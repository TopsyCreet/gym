import { motion } from 'framer-motion';

type Tier = {
  min: number;
  color: string;
  glow: string;
  label: string;
  next: number;
  nextLabel: string;
  symbol: string;
};

const TIERS: Tier[] = [
  { min: 0,  color: '#3A3A3A', glow: 'transparent',           label: 'INITIATE',  next: 3,  nextLabel: 'Forged',   symbol: '○' },
  { min: 3,  color: '#CD853F', glow: 'rgba(205,133,63,0.28)', label: 'FORGED',    next: 7,  nextLabel: 'Vanguard', symbol: '◇' },
  { min: 7,  color: '#4A90D9', glow: 'rgba(74,144,217,0.28)', label: 'VANGUARD',  next: 14, nextLabel: 'Elite',    symbol: '▸' },
  { min: 14, color: '#2ECC71', glow: 'rgba(46,204,113,0.28)', label: 'ELITE',     next: 30, nextLabel: 'Prime',    symbol: '▲' },
  { min: 30, color: '#D4AF37', glow: 'rgba(212,175,55,0.32)', label: 'PRIME',     next: 60, nextLabel: 'Monarch',  symbol: '◆' },
  { min: 60, color: '#E5C158', glow: 'rgba(229,193,88,0.35)', label: 'MONARCH',   next: 90, nextLabel: 'Legend',   symbol: '◆' },
];

function getTier(streak: number): Tier {
  return [...TIERS].reverse().find((t) => streak >= t.min) ?? TIERS[0];
}

export default function StreakCard({ streak }: { streak: number }) {
  const tier = getTier(streak);
  const remaining = Math.max(0, tier.next - streak);
  const progress = streak >= tier.next ? 100 : Math.round((streak / tier.next) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="card-elevated relative overflow-hidden"
      style={{
        padding: '1.875rem',
        boxShadow: streak > 0
          ? `0 8px 56px rgba(0,0,0,0.72), 0 0 90px ${tier.glow}, inset 0 1px 0 rgba(255,255,255,0.04)`
          : undefined,
      }}
    >
      {/* Ambient glow from bottom */}
      {streak > 2 && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 110%, ${tier.color}18, transparent 65%)`,
          }}
        />
      )}

      <div className="relative">
        <p className="label tracking-[0.28em]">Commitment Streak</p>

        {/* Hero number row */}
        <div className="mt-3 flex items-end justify-between">
          <div>
            <motion.p
              key={streak}
              initial={{ y: 14, opacity: 0, scale: 0.94 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 20 }}
              className="text-hero tabular-nums leading-none"
              style={{ color: streak > 0 ? tier.color : '#2A2A2A' }}
            >
              {streak}
            </motion.p>
            <p
              className="mt-2 text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: streak > 0 ? `${tier.color}bb` : '#2A2A2A' }}
            >
              {streak > 0 ? 'DAYS UNBROKEN' : 'NO ACTIVE STREAK'}
            </p>
          </div>

          {/* Symbol */}
          <motion.div
            animate={streak > 2 ? { scale: [1, 1.04, 1] } : {}}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="mb-5 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: streak > 0 ? `${tier.color}0d` : 'rgba(255,255,255,0.025)',
              border: `1px solid ${tier.color}22`,
              boxShadow: streak > 2 ? `0 0 28px ${tier.glow}` : 'none',
            }}
          >
            <span className="text-3xl font-black" style={{ color: streak > 0 ? tier.color : '#2A2A2A' }}>
              {tier.symbol}
            </span>
          </motion.div>
        </div>

        {/* Tier pill */}
        <div className="mt-2 inline-flex items-center gap-2">
          <span
            className="status-dot"
            style={{ background: streak > 0 ? tier.color : '#2A2A2A', boxShadow: streak > 0 ? `0 0 6px ${tier.color}` : 'none' }}
          />
          <p className="label tracking-[0.2em]" style={{ color: streak > 0 ? `${tier.color}80` : undefined }}>
            {tier.label} TIER
          </p>
        </div>

        {/* Progress toward next tier */}
        <div className="mt-5">
          <div className="h-px overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full"
              style={{ background: streak > 0 ? `linear-gradient(90deg, ${tier.color}70, ${tier.color})` : '#2A2A2A' }}
            />
          </div>
          <p className="mt-2 text-xs" style={{ color: '#3A3A3A' }}>
            {remaining > 0
              ? `${remaining} day${remaining !== 1 ? 's' : ''} to ${tier.nextLabel}`
              : `${tier.nextLabel} unlocked`}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
