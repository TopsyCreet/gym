import { motion } from 'framer-motion';
import { CheckCircle2, Dumbbell, Timer, Footprints, Wind, PersonStanding, BarChart2, ArrowRight } from 'lucide-react';
import { challenges } from '../data/challenges';
import { trials } from '../content/trials';

// ── Legacy challenge category config ──────────────────────
const categoryConfig: Record<string, { icon: React.ElementType; color: string }> = {
  strength:    { icon: Dumbbell,       color: '#D4A017' },
  endurance:   { icon: Footprints,     color: '#8A9BA8' },
  core:        { icon: PersonStanding, color: '#A1A1AA' },
  cardio:      { icon: Timer,          color: '#8A9BA8' },
  legs:        { icon: BarChart2,      color: '#CD853F' },
  recovery:    { icon: Wind,           color: '#8A9BA8' },
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
  // New daily trial (id >= 1001)
  if (id >= 1001) {
    const trial = trials.find((t) => t.id === id);
    if (!trial) return null;

    return (
      <motion.button
        type="button"
        onClick={onOpen}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15 }}
        className="relative flex flex-col overflow-hidden rounded-[1.125rem] p-5 w-full text-left"
        style={{
          background: completed ? 'rgba(212,160,23,0.04)' : 'var(--bg-elevated)',
          border: completed
            ? '1px solid rgba(212,160,23,0.2)'
            : '1px solid var(--border-subtle)',
        }}
      >
        <p
          className="text-sm font-semibold leading-snug"
          style={{
            color: completed ? 'var(--text-faint)' : 'var(--text-primary)',
            textDecoration: completed ? 'line-through' : 'none',
          }}
        >
          {trial.text}
        </p>

        <div className="mt-4">
          {completed ? (
            <div
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
              style={{ color: 'var(--gold)' }}
            >
              <CheckCircle2 size={12} aria-hidden="true" />
              Cleared
            </div>
          ) : (
            <div
              className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
              style={{ color: 'var(--text-faint)' }}
            >
              Mark Done
              <ArrowRight size={11} aria-hidden="true" />
            </div>
          )}
        </div>
      </motion.button>
    );
  }

  // Legacy challenge (id < 1001)
  const challenge = challenges.find((item) => item.id === id);
  if (!challenge) return null;

  const cfg  = getCategory(challenge.category);
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
        background: completed ? 'rgba(212,160,23,0.04)' : 'var(--bg-elevated)',
        border: completed
          ? '1px solid rgba(212,160,23,0.2)'
          : '1px solid var(--border-subtle)',
      }}
    >
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl"
        style={{
          background: completed ? 'rgba(212,160,23,0.1)' : `${cfg.color}12`,
          border: `1px solid ${completed ? 'rgba(212,160,23,0.2)' : `${cfg.color}22`}`,
        }}
      >
        <Icon size={16} style={{ color: completed ? 'var(--gold)' : cfg.color }} aria-hidden="true" />
      </div>

      <div className="mt-4 flex-1">
        <p
          className="label tracking-[0.18em]"
          style={{ color: completed ? 'rgba(212,160,23,0.5)' : cfg.color }}
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

      <div className="mt-4">
        {completed ? (
          <div
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
            style={{ color: 'var(--gold)' }}
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
