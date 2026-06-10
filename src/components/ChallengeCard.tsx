import { motion } from 'framer-motion';
import { CheckCircle2, Dumbbell, Timer, Footprints, Wind, PersonStanding, BarChart2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { challenges } from '../data/challenges';

const categoryConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  strength:    { icon: Dumbbell,       color: '#D4AF37', bg: 'rgba(212,175,55,0.1)'  },
  endurance:   { icon: Footprints,     color: '#2ECC71', bg: 'rgba(46,204,113,0.1)'  },
  core:        { icon: PersonStanding, color: '#B3B3B3', bg: 'rgba(179,179,179,0.08)' },
  cardio:      { icon: Timer,          color: '#4A90D9', bg: 'rgba(74,144,217,0.1)'  },
  legs:        { icon: BarChart2,      color: '#CD853F', bg: 'rgba(205,133,63,0.1)'  },
  recovery:    { icon: Wind,           color: '#5BB8A0', bg: 'rgba(91,184,160,0.1)'  },
  flexibility: { icon: PersonStanding, color: '#B3B3B3', bg: 'rgba(179,179,179,0.08)' },
  functional:  { icon: Dumbbell,       color: '#D4AF37', bg: 'rgba(212,175,55,0.1)'  },
};

const getCategory = (cat: string) =>
  categoryConfig[cat.toLowerCase()] ?? { icon: Dumbbell, color: '#D4AF37', bg: 'rgba(212,175,55,0.1)' };

export default function ChallengeCard({ id, completed }: { id: number; completed: boolean }) {
  const completeChallenge = useAuthStore((state) => state.completeChallenge);
  const challenge = challenges.find((item) => item.id === id);
  if (!challenge) return null;

  const cfg = getCategory(challenge.category);
  const Icon = cfg.icon;

  return (
    <motion.div
      whileHover={completed ? {} : { y: -3 }}
      className={`card flex flex-col p-5 transition-all duration-200 ${completed ? 'opacity-50' : 'hover:border-white/[0.1]'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: cfg.bg, border: `1px solid ${cfg.color}20` }}
        >
          <Icon size={18} style={{ color: cfg.color }} />
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
          style={{ background: `${cfg.color}12`, color: cfg.color, border: `1px solid ${cfg.color}25` }}
        >
          +{challenge.xp} PP
        </span>
      </div>

      <div className="mt-4 flex-1">
        <p className="label">{challenge.category}</p>
        <h3 className="mt-1.5 text-sm font-bold text-white leading-snug">{challenge.name}</h3>
      </div>

      {completed ? (
        <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: '#2ECC71' }}>
          <CheckCircle2 size={14} /> Cleared
        </div>
      ) : (
        <button
          type="button"
          onClick={() => completeChallenge(challenge.id, challenge.xp)}
          className="mt-4 w-full rounded-full py-2.5 text-xs font-bold uppercase tracking-wider text-surface transition-all duration-150 hover:brightness-110 active:scale-[0.97]"
          style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}dd)` }}
        >
          Mark Complete
        </button>
      )}
    </motion.div>
  );
}
