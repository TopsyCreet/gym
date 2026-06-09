import { motion } from 'framer-motion';
import { CheckCircle2, Dumbbell, Timer, Footprints, Zap, FlameKindling, Wind, PersonStanding } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { challenges } from '../data/challenges';

const categoryConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  Strength:    { icon: Dumbbell,       color: '#5B8EF0', bg: 'rgba(91,142,240,0.12)' },
  Endurance:   { icon: Footprints,     color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  Core:        { icon: PersonStanding, color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  Cardio:      { icon: Timer,          color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  Power:       { icon: FlameKindling,  color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  Recovery:    { icon: Wind,           color: '#06B6D4', bg: 'rgba(6,182,212,0.12)' },
};

const getCategory = (cat: string) =>
  categoryConfig[cat] ?? { icon: Zap, color: '#5B8EF0', bg: 'rgba(91,142,240,0.12)' };

export default function ChallengeCard({ id, completed }: { id: number; completed: boolean }) {
  const completeChallenge = useAuthStore((state) => state.completeChallenge);
  const challenge = challenges.find((item) => item.id === id);
  if (!challenge) return null;

  const cfg = getCategory(challenge.category);
  const Icon = cfg.icon;

  return (
    <motion.div
      whileHover={completed ? {} : { y: -4 }}
      className={`card flex flex-col p-5 transition-all duration-200 ${completed ? 'opacity-60' : 'hover:border-white/[0.12]'}`}
    >
      {/* Icon + XP */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: cfg.bg }}>
          <Icon size={20} style={{ color: cfg.color }} />
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-xs font-bold"
          style={{ background: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}30` }}
        >
          +{challenge.xp} XP
        </span>
      </div>

      {/* Text */}
      <div className="mt-4 flex-1">
        <p className="label">{challenge.category}</p>
        <h3 className="mt-1 text-sm font-bold text-white leading-snug">{challenge.name}</h3>
      </div>

      {/* Action */}
      {completed ? (
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-jade">
          <CheckCircle2 size={15} /> Completed
        </div>
      ) : (
        <button
          type="button"
          onClick={() => completeChallenge(challenge.id, challenge.xp)}
          className="mt-4 w-full rounded-full py-2.5 text-xs font-semibold text-white transition-all duration-150 hover:brightness-110 active:scale-[0.97]"
          style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)` }}
        >
          Mark Complete
        </button>
      )}
    </motion.div>
  );
}
