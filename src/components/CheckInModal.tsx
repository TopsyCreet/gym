/**
 * CheckInModal — 4-stage bottom sheet.
 *
 *  ready → verifying → success
 *                    ↘ failed → (retry) → verifying
 *
 * GSAP owns: GPS pulse rings (stage: verifying).
 * Framer Motion owns: stage transition animations, overlay fade, sheet slide.
 * No glassmorphism — solid bg-elevated surface only.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { X, MapPin, Radio, ToggleLeft, ToggleRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useGymStore } from '../store/gymStore';
import { useAuthStore } from '../store/authStore';
import Mascot from './ui/Mascot';
import Button from './ui/Button';

type Stage = 'ready' | 'verifying' | 'success' | 'failed';

// ── Stage: Ready ─────────────────────────────────────────────────────────
function ReadyStage({
  streak,
  onBegin,
  onClose,
}: {
  streak: number;
  onBegin: () => void;
  onClose: () => void;
}) {
  return (
    <div className="p-6 flex flex-col items-center text-center">
      {/* Dismiss */}
      <div className="flex w-full justify-end mb-1">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="focus-ring flex items-center justify-center rounded-full"
          style={{
            width: 32, height: 32,
            background: 'var(--bg-overlay-2)',
            color: 'var(--text-faint)',
          }}
        >
          <X size={13} />
        </button>
      </div>

      {/* Mascot */}
      <Mascot
        override="encouraging"
        size={160}
        speechKey="checkIn.ready"
      />

      <h2 className="mt-5 text-2xl font-black text-white">You're here.</h2>
      <p className="mt-2 text-sm leading-relaxed max-w-[260px]" style={{ color: 'var(--text-secondary)' }}>
        Every commitment builds the record that defines you.
      </p>

      {/* Streak context pill */}
      {streak > 0 && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 22 }}
          className="mt-5 flex items-center gap-3 rounded-2xl px-5 py-3"
          style={{
            background: 'var(--gold-faint)',
            border: '1px solid rgba(212,160,23,0.22)',
          }}
        >
          <span
            className="text-2xl font-black tabular-nums leading-none"
            style={{ color: 'var(--gold)' }}
          >
            {streak}
          </span>
          <span className="label text-left leading-relaxed">
            Day Streak<br />Active
          </span>
        </motion.div>
      )}

      <Button
        variant="primary"
        onClick={onBegin}
        className="mt-7 w-full"
        aria-label="Begin gym check-in verification"
      >
        Record My Presence
      </Button>
    </div>
  );
}

// ── Stage: Verifying ────────────────────────────────────────────────────
function VerifyingStage({
  message,
  distance,
  atGymOverride,
  toggleAtGymOverride,
  onClose,
}: {
  message: string | null;
  distance: number | null;
  atGymOverride: boolean;
  toggleAtGymOverride: () => void;
  onClose: () => void;
}) {
  const ring1 = useRef<HTMLDivElement>(null);
  const ring2 = useRef<HTMLDivElement>(null);
  const ring3 = useRef<HTMLDivElement>(null);

  // GSAP GPS pulse: 3 rings expand outward, staggered
  useGSAP(() => {
    const rings = [ring1.current, ring2.current, ring3.current].filter(Boolean) as HTMLDivElement[];
    gsap.set(rings, { scale: 0.3, opacity: 0.85 });

    const tl = gsap.timeline({ repeat: -1 });
    rings.forEach((ring, i) => {
      tl.to(
        ring,
        { scale: 4, opacity: 0, duration: 2, ease: 'power1.out' },
        i * 0.55,
      );
    });

    return () => tl.kill();
  }, []);

  return (
    <div className="p-6">
      {/* Dismiss — always reachable, even during slow GPS */}
      <div className="flex w-full justify-end mb-2">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cancel verification"
          className="focus-ring flex items-center justify-center rounded-full"
          style={{ width: 32, height: 32, background: 'var(--bg-overlay-2)', color: 'var(--text-faint)' }}
        >
          <X size={13} />
        </button>
      </div>

      <div className="flex flex-col items-center text-center">
        {/* GPS visualisation */}
        <div
          className="relative flex items-center justify-center mb-6"
          style={{ width: 120, height: 120 }}
          aria-hidden="true"
        >
          {/* Pulse rings (GSAP-driven) */}
          <div
            ref={ring1}
            className="absolute rounded-full"
            style={{
              inset: '50%', width: 60, height: 60,
              transform: 'translate(-50%, -50%)',
              background: 'rgba(61,127,212,0.15)',
              border: '1.5px solid rgba(61,127,212,0.35)',
              transformOrigin: 'center',
            }}
          />
          <div
            ref={ring2}
            className="absolute rounded-full"
            style={{
              inset: '50%', width: 60, height: 60,
              transform: 'translate(-50%, -50%)',
              background: 'rgba(61,127,212,0.1)',
              border: '1px solid rgba(61,127,212,0.22)',
              transformOrigin: 'center',
            }}
          />
          <div
            ref={ring3}
            className="absolute rounded-full"
            style={{
              inset: '50%', width: 60, height: 60,
              transform: 'translate(-50%, -50%)',
              background: 'rgba(61,127,212,0.06)',
              border: '1px solid rgba(61,127,212,0.15)',
              transformOrigin: 'center',
            }}
          />
          {/* Static inner icon */}
          <div
            className="relative flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{
              background: 'rgba(61,127,212,0.12)',
              border: '1px solid rgba(61,127,212,0.28)',
              boxShadow: '0 0 20px rgba(61,127,212,0.18)',
            }}
          >
            <MapPin size={24} style={{ color: 'var(--steel)' }} />
          </div>
        </div>

        <h2 className="text-xl font-black text-white">Verifying Presence</h2>
        <p className="mt-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {message ?? 'Confirming your location…'}
        </p>

        {/* Distance readout — appears when GPS has a fix */}
        <AnimatePresence>
          {distance !== null && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 rounded-xl px-4 py-2.5"
              style={{
                background: 'rgba(61,127,212,0.07)',
                border: '1px solid rgba(61,127,212,0.18)',
              }}
            >
              <Radio size={12} style={{ color: 'var(--steel)' }} aria-hidden="true" />
              <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--steel)' }}>
                {Math.round(distance)}m from gym
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dev-only GPS override toggle */}
        {import.meta.env.DEV && (
          <div
            className="mt-5 flex w-full items-center justify-between rounded-xl px-4 py-3"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div>
              <p className="label text-left">Dev: Bypass GPS</p>
              <p className="mt-0.5 text-xs font-semibold text-left" style={{ color: atGymOverride ? 'var(--success)' : 'var(--text-faint)' }}>
                {atGymOverride ? 'Override active' : 'Using real GPS'}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleAtGymOverride}
              aria-label={atGymOverride ? 'Disable GPS override' : 'Enable GPS override'}
              style={{
                color: atGymOverride ? 'var(--success)' : 'var(--text-faint)',
                minWidth: 44, minHeight: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
              }}
            >
              {atGymOverride ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Stage: Success ───────────────────────────────────────────────────────
function SuccessStage({ onClose }: { onClose: () => void }) {
  const user   = useAuthStore((s) => s.getUser());
  const streak = user?.streak ?? 0;

  return (
    <div className="p-6 flex flex-col items-center text-center">
      {/* Mascot celebrating — auto-resets after 4s (spec Mascot behaviour) */}
      <Mascot
        override="celebrating"
        size={150}
        speechKey="checkIn.success"
        suppressIdle
      />

      {/* Success checkmark */}
      <motion.div
        initial={{ scale: 0.55, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.12 }}
        className="mt-4 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{
          background: 'rgba(39,174,96,0.1)',
          border: '1px solid rgba(39,174,96,0.28)',
          boxShadow: '0 0 32px rgba(39,174,96,0.2)',
        }}
      >
        <CheckCircle size={30} style={{ color: 'var(--success)' }} aria-hidden="true" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
        className="mt-4 text-2xl font-black text-white"
      >
        Commitment Recorded.
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
        className="mt-1.5 text-4xl font-black tabular-nums"
        style={{ color: 'var(--gold)' }}
        aria-label={`Day ${streak} streak`}
      >
        Day {streak}
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.44 }}
        className="mt-3 text-sm"
        style={{ color: 'var(--text-secondary)' }}
      >
        Recorded. Nothing undoes this.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.58 }}
        className="mt-7 w-full"
      >
        <Button variant="secondary" onClick={onClose} className="w-full">
          Continue
        </Button>
      </motion.div>
    </div>
  );
}

// ── Stage: Failed ────────────────────────────────────────────────────────
function FailedStage({
  message,
  onRetry,
  onClose,
}: {
  message: string | null;
  onRetry: () => void;
  onClose: () => void;
}) {
  return (
    <div className="p-6 flex flex-col items-center text-center">
      <Mascot override="worried" size={130} />

      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.08 }}
        className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ background: 'var(--error-faint)', border: '1px solid rgba(231,76,60,0.25)' }}
      >
        <AlertCircle size={22} style={{ color: 'var(--error)' }} aria-hidden="true" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="mt-4 text-xl font-black text-white"
      >
        Verification Failed
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.26 }}
        className="mt-2 text-sm leading-relaxed max-w-[240px]"
        style={{ color: 'var(--text-secondary)' }}
      >
        {message ?? 'Unable to confirm your location. Move closer to the gym and try again.'}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.36 }}
        className="mt-7 flex w-full gap-3"
      >
        <Button variant="ghost" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button variant="primary" onClick={onRetry} className="flex-1">
          Try Again
        </Button>
      </motion.div>
    </div>
  );
}

// ── Main modal ───────────────────────────────────────────────────────────
export default function CheckInModal() {
  const {
    checkInModalOpen, closeCheckInModal, checkInToday,
    distance, lastCheckInMessage, atGymOverride, toggleAtGymOverride,
  } = useGymStore();

  const user   = useAuthStore((s) => s.getUser());
  const streak = user?.streak ?? 0;

  const [stage, setStage] = useState<Stage>('ready');

  const handleClose = useCallback(() => {
    closeCheckInModal();
    // Reset stage after exit animation completes
    setTimeout(() => setStage('ready'), 320);
  }, [closeCheckInModal]);

  // Core check-in sequence: verify → record → decide outcome
  const runCheckIn = useCallback(async () => {
    setStage('verifying');
    await checkInToday();
    const latestUser = useAuthStore.getState().getUser();
    const today      = new Date().toISOString().slice(0, 10);
    setStage(latestUser?.lastCheckInDate === today ? 'success' : 'failed');
  }, [checkInToday]);

  // Reset when modal closes externally (e.g., backdrop tap during success)
  useEffect(() => {
    if (!checkInModalOpen) {
      const t = setTimeout(() => setStage('ready'), 320);
      return () => clearTimeout(t);
    }
  }, [checkInModalOpen]);

  return (
    <AnimatePresence>
      {checkInModalOpen && (
        // Backdrop — solid, NO blur (spec: no glassmorphism)
        <motion.div
          key="checkin-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-20 sm:items-center sm:pb-0"
          style={{ background: 'var(--bg-modal)' }}
          onClick={handleClose}
          aria-modal="true"
          role="dialog"
          aria-label="Gym check-in"
        >
          {/* Sheet panel */}
          <motion.div
            key="checkin-panel"
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="card-modal w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">

              {stage === 'ready' && (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2, ease: [0.25, 0, 0.15, 1] }}
                >
                  <ReadyStage streak={streak} onBegin={runCheckIn} onClose={handleClose} />
                </motion.div>
              )}

              {stage === 'verifying' && (
                <motion.div
                  key="verifying"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2, ease: [0.25, 0, 0.15, 1] }}
                >
                  <VerifyingStage
                    message={lastCheckInMessage}
                    distance={distance}
                    atGymOverride={atGymOverride}
                    toggleAtGymOverride={toggleAtGymOverride}
                    onClose={handleClose}
                  />
                </motion.div>
              )}

              {stage === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                >
                  <SuccessStage onClose={handleClose} />
                </motion.div>
              )}

              {stage === 'failed' && (
                <motion.div
                  key="failed"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2, ease: [0.25, 0, 0.15, 1] }}
                >
                  <FailedStage
                    message={lastCheckInMessage}
                    onRetry={runCheckIn}
                    onClose={handleClose}
                  />
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
