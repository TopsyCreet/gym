import { motion } from 'framer-motion';
import { getRankByTitle } from '../data/ranks';

interface Props {
  title: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function RankBadge({ title, size = 'md' }: Props) {
  const rank = getRankByTitle(title);

  const sizeStyles = {
    sm: { px: '0.625rem', py: '0.3125rem', dotSize: 5, fontSize: '0.5625rem', titleSize: '0.625rem' },
    md: { px: '0.875rem', py: '0.5rem',   dotSize: 6, fontSize: '0.5625rem', titleSize: '0.75rem' },
    lg: { px: '1.25rem',  py: '0.75rem',  dotSize: 7, fontSize: '0.625rem',  titleSize: '0.9375rem' },
  }[size];

  return (
    <motion.div
      initial={{ scale: 0.88, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 360, damping: 24 }}
      className="inline-flex items-center gap-2.5"
      style={{
        padding: `${sizeStyles.py} ${sizeStyles.px}`,
        borderRadius: 9999,
        background: `${rank.color}0e`,
        border: `1px solid ${rank.color}28`,
        boxShadow: `0 0 18px ${rank.color}14`,
      }}
    >
      <span
        style={{
          width: sizeStyles.dotSize,
          height: sizeStyles.dotSize,
          borderRadius: '50%',
          background: rank.color,
          boxShadow: `0 0 8px ${rank.color}cc`,
          flexShrink: 0,
          display: 'block',
        }}
      />
      <div>
        <p
          style={{
            fontSize: sizeStyles.fontSize,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.22em',
            color: `${rank.color}90`,
            lineHeight: 1.2,
          }}
        >
          Rank
        </p>
        <p
          style={{
            fontSize: sizeStyles.titleSize,
            fontWeight: 900,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#FFFFFF',
            lineHeight: 1,
          }}
        >
          {rank.title}
        </p>
      </div>
    </motion.div>
  );
}
