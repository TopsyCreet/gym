import { motion } from 'framer-motion';
import { CheckCircle2, Dumbbell, Timer, Footprints, Wind, PersonStanding, BarChart2, ArrowRight } from 'lucide-react';
import { challenges } from '../data/challenges';

const categoryConfig: Record<string, { icon: React.ElementType; color: string }> = {
  strength:    { icon: Dumbbell,       color: '#D4A017' },
  endurance:   { icon: Footprints,     color: '#27AE60' },
  core:        { icon: PersonStanding, color: '#A1A1AA' },
  cardio:      { icon: Timer,          color: '#3D7FD4' },
  legs:        { icon: BarChart2,      color: '#CD853F' },
  recovery:    { icon: Wind,           color: '#5BB8A0' },
  flexibility: { icon: PersonStanding, color: '#A1A1AA' },
  functional:  { icon: Dumbbell,       color: '#D4A017' },
};

const getCategory = (cat: string) =>
  categoryConfig[cat.toLowerCase()] ?? { icon: Dumbbell, color: '#D4A017' };

export default function ChallengeCard({
  id,
  completed,
  onOpen,
}: {
  id: number;
  completed: boolean;
  onOpen: () => void;
}) {
  const challenge = challenges.find((item) => item.id === id);
  if (!challenge) return null;

  const cfg = getCategory(challenge.category);
  const Icon = cfg.icon;

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className="relative flex flex-col overflow-hidden rounded-[1.125rem] p-5 w-full text-left"
      style={{
        background: completed ? 'rgba(39,174,96,0.04)' : 'var(--bg-elevated)',
        border: completed
          ? '1px solid rgba(39,174,96,0.15)'
          : '1px solid var(--border-subtle)',
        transition: 'border-color 0.2s, background 0.2s',
      }}
    >
      {/* Category icon */}
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl"
        style={{
          background: completed ? 'rgba(39,174,96,0.1)' : `${cfg.color}12`,
          border: `1px solid ${completed ? 'rgba(39,174,96,0.2)' : `${cfg.color}22`}`,
        }}
      >
        <Icon size={16} style={{ color: completed ? 'var(--success)' : cfg.color }} aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="mt-4 flex-1">
        <p
          className="label tracking-[0.18em]"
          style={{ color: completed ? 'rgba(39,174,96,0.5)' : cfg.color }}
        >
          {challenge.category}
        </p>
        <h3
          className="mt-1.5 text-sm font-bold leading-snug text-white"
          style={{
            textDecoration: completed ? 'line-through' : 'none',
            opacity: completed ? 0.55 : 1,
          }}
        >
          {challenge.name}
        </h3>
      </div>

      {/* Status row */}
      <div className="mt-4">
        {completed ? (
          <div
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
            style={{ color: 'var(--success)' }}
          >
            <CheckCircle2 size={12} aria-hidden="true" />
            Cleared
          </div>
        ) : (
          <div
            className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
            style={{ color: 'var(--text-faint)' }}
          >
            View Trial
            <ArrowRight size={11} aria-hidden="true" />
          </div>
        )}
      </div>
    </motion.button>
  );
}
