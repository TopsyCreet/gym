import { motion } from 'framer-motion';
import { CheckCircle2, Dumbbell, Timer, Footprints, Wind, PersonStanding, BarChart2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { challenges } from '../data/challenges';

const categoryConfig: Record<string, { icon: React.ElementType; color: string }> = {
  strength:    { icon: Dumbbell,       color: '#D4AF37' },
  endurance:   { icon: Footprints,     color: '#2ECC71' },
  core:        { icon: PersonStanding, color: '#A1A1AA' },
  cardio:      { icon: Timer,          color: '#4A90D9' },
  legs:        { icon: BarChart2,      color: '#CD853F' },
  recovery:    { icon: Wind,           color: '#5BB8A0' },
  flexibility: { icon: PersonStanding, color: '#A1A1AA' },
  functional:  { icon: Dumbbell,       color: '#D4AF37' },
};

const getCategory = (cat: string) =>
  categoryConfig[cat.toLowerCase()] ?? { icon: Dumbbell, color: '#D4AF37' };

export default function ChallengeCard({ id, completed }: { id: number; completed: boolean }) {
  const completeChallenge = useAuthStore((state) => state.completeChallenge);
  const challenge = challenges.find((item) => item.id === id);
  if (!challenge) return null;

  const cfg = getCategory(challenge.category);
  const Icon = cfg.icon;

  return (
    <motion.div
      whileHover={completed ? {} : { y: -2 }}
      transition={{ duration: 0.18 }}
      className="relative flex flex-col overflow-hidden rounded-[1.125rem] p-5"
      style={{
        background: completed ? 'rgba(46,204,113,0.04)' : 'var(--bg-elevated)',
        border: completed
          ? '1px solid rgba(46,204,113,0.15)'
          : '1px solid var(--border-subtle)',
        transition: 'border-color 0.2s, background 0.2s',
        opacity: completed ? 0.7 : 1,
      }}
    >
      {/* Top row: icon + xp */}
      <div className="flex items-start justify-between gap-2">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{
            background: completed ? 'rgba(46,204,113,0.1)' : `${cfg.color}0d`,
            border: `1px solid ${completed ? 'rgba(46,204,113,0.2)' : `${cfg.color}1a`}`,
          }}
        >
          <Icon size={16} style={{ color: completed ? '#2ECC71' : cfg.color }} />
        </div>
        <span
          className="rounded-full px-2.5 py-1 font-mono text-[10px] font-bold"
          style={{
            background: completed ? 'rgba(46,204,113,0.08)' : `${cfg.color}0d`,
            color: completed ? '#2ECC71' : cfg.color,
            border: `1px solid ${completed ? 'rgba(46,204,113,0.18)' : `${cfg.color}1a`}`,
          }}
        >
          +{challenge.xp} PP
        </span>
      </div>

      {/* Content */}
      <div className="mt-4 flex-1">
        <p
          className="label tracking-[0.18em]"
          style={{ color: completed ? 'rgba(46,204,113,0.5)' : undefined }}
        >
          {challenge.category}
        </p>
        <h3
          className="mt-1.5 text-sm font-bold leading-snug text-white"
          style={{ textDecoration: completed ? 'line-through' : 'none', opacity: completed ? 0.6 : 1 }}
        >
          {challenge.name}
        </h3>
      </div>

      {/* CTA */}
      <div className="mt-4">
        {completed ? (
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: '#2ECC71' }}>
            <CheckCircle2 size={13} />
            Cleared
          </div>
        ) : (
          <button
            type="button"
            onClick={() => completeChallenge(challenge.id, challenge.xp)}
            className="w-full rounded-full py-2.5 text-[11px] font-bold uppercase tracking-wider text-black transition-all duration-150 hover:brightness-110 active:scale-[0.97]"
            style={{ background: `linear-gradient(135deg, ${cfg.color}ee, ${cfg.color})` }}
          >
            Complete
          </button>
        )}
      </div>
    </motion.div>
  );
}
