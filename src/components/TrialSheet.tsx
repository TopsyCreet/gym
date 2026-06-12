import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CheckCircle2, CheckCircle,
  Dumbbell, Timer, Footprints, Wind, PersonStanding, BarChart2,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { challenges } from '../data/challenges';
import { trials } from '../content/trials';

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

type Stage = 'detail' | 'done';
interface TrialSheetProps { trialId: number | null; onClose: () => void; }

export default function TrialSheet({ trialId, onClose }: TrialSheetProps) {
  const completeChallenge = useAuthStore((state) => state.completeChallenge);
  const user              = useAuthStore((state) => state.getUser());
  const [stage, setStage] = useState<Stage>('detail');
  const closeTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (trialId !== null) setStage('detail');
    return () => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current); };
  }, [trialId]);

  useEffect(() => {
    if (trialId !== null) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [trialId]);

  // Resolve data from either trials.ts (id >= 1001) or legacy challenges
  const isNewTrial = (trialId ?? 0) >= 1001;
  const trial      = isNewTrial ? trials.find((t) => t.id === trialId) : null;
  const challenge  = !isNewTrial ? challenges.find((c) => c.id === trialId) : null;

  const hasContent  = isNewTrial ? !!trial : !!challenge;
  const today       = new Date().toISOString().slice(0, 10);
  const checkedIn   = user?.lastCheckInDate === today;
  const isCompleted = user?.dailyChallenges.find((c) => c.id === trialId)?.completed ?? false;

  const handleComplete = () => {
    if (!trialId) return;
    const xp = isNewTrial ? (trial?.xp ?? 100) : (challenge?.xp ?? 100);
    completeChallenge(trialId, xp);
    setStage('done');
    closeTimerRef.current = setTimeout(onClose, 2000);
  };

  const cfg  = challenge ? getCategory(challenge.category) : null;
  const Icon = cfg?.icon ?? Dumbbell;

  return createPortal(
    <AnimatePresence>
      {trialId !== null && hasContent && (
        <>
          <motion.div
            key="trial-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(0,0,0,0.88)' }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            key="trial-panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-[70] mx-auto max-w-lg card-modal"
            style={{
              borderRadius: '1.5rem 1.5rem 0 0',
              maxHeight: '88vh',
              overflowY: 'auto',
              paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))',
            }}
            role="dialog"
            aria-modal="true"
            aria-label={`Trial: ${isNewTrial ? trial?.text : challenge?.name}`}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3.5 pb-1" aria-hidden="true">
              <div className="h-1 w-10 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close trial detail"
              className="absolute right-5 top-4 flex items-center justify-center rounded-full"
              style={{
                width: 32, height: 32,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-faint)',
              }}
            >
              <X size={14} />
            </button>

            <AnimatePresence mode="wait">
              {/* ── Detail stage */}
              {stage === 'detail' && (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.14 }}
                  className="px-6 pt-5 pb-4"
                >
                  {isNewTrial ? (
                    /* New-style daily trial — text only */
                    <>
                      <p className="label tracking-[0.22em] mb-3" style={{ color: 'var(--gold)' }}>
                        Today's Trial
                      </p>
                      <p className="text-xl font-black leading-snug text-white">
                        {trial!.text}
                      </p>
                    </>
                  ) : (
                    /* Legacy challenge — icon + category + description */
                    <>
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl"
                        style={{ background: `${cfg!.color}12`, border: `1px solid ${cfg!.color}22` }}
                      >
                        <Icon size={22} style={{ color: cfg!.color }} aria-hidden="true" />
                      </div>
                      <p className="label mt-4 tracking-[0.22em]" style={{ color: cfg!.color }}>
                        {challenge!.category}
                      </p>
                      <h2 className="mt-1.5 text-2xl font-black leading-tight text-white">
                        {challenge!.name}
                      </h2>
                      <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {challenge!.description}
                      </p>
                    </>
                  )}

                  <div className="divider mt-6 mb-5" />

                  {/* CTA */}
                  {isCompleted ? (
                    <div
                      className="flex w-full items-center justify-center gap-2.5 rounded-full py-3.5"
                      style={{ background: 'rgba(212,160,23,0.08)', border: '1px solid rgba(212,160,23,0.2)' }}
                    >
                      <CheckCircle2 size={15} style={{ color: 'var(--gold)' }} aria-hidden="true" />
                      <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--gold)' }}>
                        Cleared
                      </span>
                    </div>
                  ) : checkedIn ? (
                    <button type="button" onClick={handleComplete} className="btn-primary w-full py-3.5">
                      Mark Complete
                    </button>
                  ) : (
                    <div
                      className="flex w-full items-center justify-center rounded-full py-3.5"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
                        Check in to unlock
                      </span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── Done stage */}
              {stage === 'done' && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col items-center px-6 pt-8 pb-6 text-center"
                >
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 360, damping: 22, delay: 0.05 }}
                    style={{ color: 'var(--gold)' }}
                  >
                    <CheckCircle size={64} strokeWidth={1.5} />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.28 }}
                    className="mt-5 text-2xl font-black text-white"
                  >
                    Trial Cleared
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.32 }}
                    className="mt-2 text-sm italic"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    The record grows.
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
